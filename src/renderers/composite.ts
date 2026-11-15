import type { EngineId, EngineResult, Settings } from '../types';
import { renderResult } from './index';
import { applyMask } from './mask';
import { getOverlayImage } from './overlayImage';

/** Canvas blend modes offered as the "layer blend mode". */
export const BLEND_MODES: { value: string; label: string }[] = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
];

export function blendOp(mode: string): GlobalCompositeOperation {
  return (mode || 'source-over') as GlobalCompositeOperation;
}

let temp: HTMLCanvasElement | null = null;
function styledCanvas(width: number, height: number): HTMLCanvasElement {
  if (!temp) temp = document.createElement('canvas');
  if (temp.width !== width) temp.width = width;
  if (temp.height !== height) temp.height = height;
  return temp;
}

let temp2: HTMLCanvasElement | null = null;
function styledCanvas2(width: number, height: number): HTMLCanvasElement {
  if (!temp2) temp2 = document.createElement('canvas');
  if (temp2.width !== width) temp2.width = width;
  if (temp2.height !== height) temp2.height = height;
  return temp2;
}

/**
 * Renders the styled result onto an offscreen layer, then composites it over the
 * original image on `ctx` using the chosen blend mode + opacity, and finally
 * applies the mask. `scale` maps logical (source) size to the device pixels of
 * `ctx` (1 for the preview, the upscale factor for export).
 */
export function renderComposite(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  sourceCanvas: HTMLCanvasElement,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  logicalW: number,
  logicalH: number,
  layers: ({ engine: EngineId; result: EngineResult } | null)[],
): void {
  const styled = styledCanvas(width, height);
  const sctx = styled.getContext('2d');
  if (!sctx) return;
  sctx.setTransform(1, 0, 0, 1, 0, 0);
  sctx.globalCompositeOperation = 'source-over';
  sctx.globalAlpha = 1;
  sctx.clearRect(0, 0, width, height);
  sctx.scale(scale, scale);
  renderResult(engine, sctx, result, settings, palette, logicalW, logicalH);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(sourceCanvas, 0, 0, width, height);
  ctx.globalCompositeOperation = blendOp(settings.blendMode);
  ctx.globalAlpha = Math.max(0, Math.min(1, settings.blendOpacity));
  ctx.drawImage(styled, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  for (let i = 0; i < settings.layers.length; i++) {
    if (settings.layers[i].visible === false) continue;
    const entry = layers[i];
    if (!entry) continue;
    const canvas2 = styledCanvas2(width, height);
    const sctx2 = canvas2.getContext('2d');
    if (!sctx2) continue;
    sctx2.setTransform(1, 0, 0, 1, 0, 0);
    sctx2.globalCompositeOperation = 'source-over';
    sctx2.globalAlpha = 1;
    sctx2.clearRect(0, 0, width, height);
    sctx2.scale(scale, scale);
    renderResult(
      entry.engine,
      sctx2,
      entry.result,
      settings,
      palette,
      logicalW,
      logicalH,
    );
    ctx.globalCompositeOperation = blendOp(settings.layers[i].blend);
    ctx.globalAlpha = Math.max(0, Math.min(1, settings.layers[i].opacity));
    ctx.drawImage(canvas2, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  if (settings.maskShape !== 'none') {
    applyMask(ctx, width, height, sourceCanvas, settings);
  }

  if (settings.overlayType !== 'none') {
    const cx = settings.overlayX * width;
    const cy = settings.overlayY * height;
    const minDim = Math.min(width, height);
    const rot = (settings.overlayRotation * Math.PI) / 180;
    ctx.save();
    ctx.globalCompositeOperation = blendOp(settings.overlayBlend);
    ctx.globalAlpha = Math.max(0, Math.min(1, settings.overlayOpacity));
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    if (settings.overlayType === 'text' && settings.overlayText.trim() !== '') {
      const fontPx = Math.max(1, settings.overlaySize * minDim);
      ctx.font = `700 ${fontPx}px "Noto Sans TC", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = settings.overlayColor;
      ctx.fillText(settings.overlayText, 0, 0);
    } else if (settings.overlayType === 'sticker') {
      const image = getOverlayImage();
      if (image && image.width > 0) {
        const w = Math.max(1, settings.overlaySize * minDim);
        const h = w * (image.height / image.width);
        ctx.drawImage(image, -w / 2, -h / 2, w, h);
      }
    }
    ctx.restore();
  }
}
