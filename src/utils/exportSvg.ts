import type { Settings } from '../types';
import { getBrushMask } from '../renderers/brushMask';
import { getOverlayImage } from '../renderers/overlayImage';

export async function exportSvg(
  svgString: string,
  filename: string,
): Promise<void> {
  const base =
    filename
      .trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .slice(0, 60) || 'pixelcraft';
  const name = base.endsWith('.svg') ? base : `${base}.svg`;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Extract the inner children of an `<svg ...>...</svg>` string. */
function svgInner(svg: string): string {
  const start = svg.indexOf('>');
  if (start === -1) return svg;
  const end = svg.lastIndexOf('</svg>');
  if (end === -1) return svg.slice(start + 1);
  return svg.slice(start + 1, end).trim();
}

/** Canvas-safe CSS blend mode name for SVG `mix-blend-mode`. */
function svgBlend(mode: string): string {
  const m = (mode || 'source-over').toLowerCase();
  const map: Record<string, string> = {
    'source-over': 'normal',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay',
    darken: 'darken',
    lighten: 'lighten',
    'soft-light': 'soft-light',
    difference: 'difference',
  };
  return map[m] ?? 'normal';
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Wraps an engine SVG string with mask and overlay compositing so SVG export
 * mirrors the canvas composite path (mask + blend + overlay).
 */
export function composeSvg(
  engineSvg: string,
  settings: Settings,
  width: number,
  height: number,
): string {
  const inner = svgInner(engineSvg);
  const parts: string[] = [];
  const s = settings;

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  );

  // ---- Mask definition -------------------------------------------------
  if (s.maskShape !== 'none') {
    const cx = s.maskX * width;
    const cy = s.maskY * height;
    const size = Math.min(1, Math.max(0.02, s.maskSize));
    const feather = clamp01(s.maskFeather);
    const inverted = s.maskInvert;

    const show = inverted ? '#000000' : '#ffffff';
    const hide = inverted ? '#ffffff' : '#000000';
    const showAlpha = inverted ? 0 : 1;
    const hideAlpha = inverted ? 1 : 0;

    parts.push(
      `<defs><mask id="export-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}">`,
    );

    if (s.maskShape === 'brush') {
      const brush = getBrushMask();
      if (brush) {
        const dataUrl = brush.toDataURL('image/png');
        parts.push(
          `<image href="${dataUrl}" x="0" y="0" width="${width}" height="${height}"/>`,
        );
      }
    } else if (s.maskShape === 'ellipse') {
      const minDim = Math.min(width, height);
      const r = size * minDim * 0.9 + 1;
      const innerR = Math.max(0, r * (1 - feather));
      parts.push(
        `<radialGradient id="export-mask-grad" cx="${cx}" cy="${cy}" r="${r}" fx="${cx}" fy="${cy}" fr="${innerR}" gradientUnits="userSpaceOnUse">`,
      );
      parts.push(
        `<stop offset="0" stop-color="${show}" stop-opacity="${showAlpha}"/><stop offset="1" stop-color="${hide}" stop-opacity="${hideAlpha}"/>`,
      );
      parts.push(`</radialGradient>`);
      parts.push(
        `<rect width="${width}" height="${height}" fill="url(#export-mask-grad)"/>`,
      );
    } else if (s.maskShape === 'rect') {
      const mw = size * width;
      const mh = size * height;
      if (feather > 0) {
        const blur = feather * Math.min(mw, mh) / 3;
        parts.push(
          `<filter id="export-mask-blur"><feGaussianBlur stdDeviation="${blur}"/></filter>`,
        );
        parts.push(
          `<rect x="${cx - mw / 2}" y="${cy - mh / 2}" width="${mw}" height="${mh}" fill="${show}" filter="url(#export-mask-blur)"/>`,
        );
      } else {
        parts.push(
          `<rect x="${cx - mw / 2}" y="${cy - mh / 2}" width="${mw}" height="${mh}" fill="${show}"/>`,
        );
      }
      // Fill the rest with hide color so masked-out areas are transparent
      parts.push(`<rect width="${width}" height="${height}" fill="${hide}"/>`);
    } else {
      // linear: horizontal ramp centred at maskX
      const band = Math.max(1, size * width);
      parts.push(
        `<linearGradient id="export-mask-grad" x1="${cx - band / 2}" y1="0" x2="${cx + band / 2}" y2="0" gradientUnits="userSpaceOnUse">`,
      );
      parts.push(
        `<stop offset="0" stop-color="${hide}" stop-opacity="${hideAlpha}"/><stop offset="0.5" stop-color="${show}" stop-opacity="${showAlpha}"/><stop offset="1" stop-color="${hide}" stop-opacity="${hideAlpha}"/>`,
      );
      parts.push(`</linearGradient>`);
      parts.push(
        `<rect width="${width}" height="${height}" fill="url(#export-mask-grad)"/>`,
      );
    }

    parts.push(`</mask></defs>`);
  }

  // ---- Engine content (masked if applicable) --------------------------
  if (s.maskShape !== 'none') {
    parts.push(`<g mask="url(#export-mask)">`);
    parts.push(inner);
    parts.push(`</g>`);
  } else {
    parts.push(inner);
  }

  // ---- Overlay (drawn on top, not affected by mask) -------------------
  if (s.overlayType !== 'none') {
    const cx = s.overlayX * width;
    const cy = s.overlayY * height;
    const minDim = Math.min(width, height);
    const rot = (s.overlayRotation * Math.PI) / 180;
    const blend = svgBlend(s.overlayBlend);
    const opacity = Math.max(0, Math.min(1, s.overlayOpacity));

    parts.push(
      `<g transform="translate(${cx} ${cy}) rotate(${rot * 180 / Math.PI})" style="mix-blend-mode:${blend};opacity:${opacity}">`,
    );

    if (s.overlayType === 'text' && s.overlayText.trim() !== '') {
      const fontPx = Math.max(1, s.overlaySize * minDim);
      parts.push(
        `<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-weight="700" font-size="${fontPx}" font-family="Noto Sans TC, system-ui, sans-serif" fill="${s.overlayColor}">${s.overlayText}</text>`,
      );
    } else if (s.overlayType === 'sticker') {
      const image = getOverlayImage();
      if (image && image.width > 0) {
        const w = Math.max(1, s.overlaySize * minDim);
        const h = w * (image.height / image.width);
        const dataUrl = image.src;
        parts.push(
          `<image href="${dataUrl}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}"/>`,
        );
      }
    }

    parts.push(`</g>`);
  }

  parts.push(`</svg>`);
  return parts.join('');
}
