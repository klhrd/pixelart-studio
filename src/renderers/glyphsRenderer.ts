import type { GlyphResult, Settings } from '../types';

function glyphPath(shape: string, cx: number, cy: number, r: number): string {
  if (r <= 0.2) return '';
  switch (shape) {
    case 'circle':
      return `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${2 * r},0 a ${r},${r} 0 1,0 ${-2 * r},0 Z`;
    case 'square':
      return `M ${cx - r},${cy - r} h ${2 * r} v ${2 * r} h ${-2 * r} Z`;
    case 'diamond':
      return `M ${cx},${cy - r} L ${cx + r},${cy} L ${cx},${cy + r} L ${cx - r},${cy} Z`;
    case 'triangle':
      return `M ${cx},${cy - r} L ${cx + r * 0.92},${cy + r * 0.7} L ${cx - r * 0.92},${cy + r * 0.7} Z`;
    case 'cross': {
      const t = r * 0.4;
      return `M ${cx - t},${cy - r} L ${cx + t},${cy - r} L ${cx + t},${cy - t} L ${cx + r},${cy - t} L ${cx + r},${cy + t} L ${cx + t},${cy + t} L ${cx + t},${cy + r} L ${cx - t},${cy + r} L ${cx - t},${cy + t} L ${cx - r},${cy + t} L ${cx - r},${cy - t} L ${cx - t},${cy - t} Z`;
    }
    case 'smiley': {
      const er = r * 0.16;
      const ex = r * 0.35;
      const ey = -r * 0.25;
      const mr = r * 0.6;
      const my = r * 0.12;
      return (
        `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${2 * r},0 a ${r},${r} 0 1,0 ${-2 * r},0 Z ` +
        `M ${cx - ex - er},${cy + ey} a ${er},${er} 0 1,0 ${2 * er},0 a ${er},${er} 0 1,0 ${-2 * er},0 Z ` +
        `M ${cx + ex - er},${cy + ey} a ${er},${er} 0 1,0 ${2 * er},0 a ${er},${er} 0 1,0 ${-2 * er},0 Z ` +
        `M ${cx - mr},${cy + my} a ${mr},${mr} 0 0,0 ${2 * mr},0 Z`
      );
    }
    case 'star': {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.42 : r;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        d += `${i === 0 ? 'M' : 'L'} ${px.toFixed(2)},${py.toFixed(2)} `;
      }
      return `${d}Z`;
    }
    default:
      return '';
  }
}

export function renderGlyphs(
  ctx: CanvasRenderingContext2D,
  res: GlyphResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { cols, rows, luminance } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);
  const shape = settings.glyphShape || 'star';

  ctx.fillStyle = palette[palette.length - 1];
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = palette[0];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const L = luminance[r * cols + c];
      const scale = 1 - L;
      if (scale < 0.06) continue;
      const rad = cell * 0.5 * scale;
      const d = glyphPath(shape, c * cw + cw / 2, r * ch + ch / 2, rad);
      if (!d) continue;
      ctx.fill(new Path2D(d), 'evenodd');
    }
  }
}

export function renderGlyphsSVG(
  res: GlyphResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { cols, rows, luminance } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);
  const shape = settings.glyphShape || 'star';

  const parts: string[] = [];
  parts.push(
    `<rect width="${width}" height="${height}" fill="${palette[palette.length - 1]}"/>`,
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const L = luminance[r * cols + c];
      const scale = 1 - L;
      if (scale < 0.06) continue;
      const rad = cell * 0.5 * scale;
      const d = glyphPath(shape, c * cw + cw / 2, r * ch + ch / 2, rad);
      if (!d) continue;
      parts.push(
        `<path d="${d}" fill="${palette[0]}" fill-rule="evenodd"/>`,
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
