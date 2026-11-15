import type { EngineId, EngineResult, Settings } from '../types';
import { renderResult } from './index';
import { applyMask } from './mask';

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

  if (settings.maskShape !== 'none') {
    applyMask(ctx, width, height, sourceCanvas, settings);
  }
}
