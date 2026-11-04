import type { DitherResult, Settings } from '../types';

let tempCanvas: HTMLCanvasElement | null = null;

export function renderPixels(
  ctx: CanvasRenderingContext2D,
  res: DitherResult,
  _settings: Settings,
  _palette: string[],
  width: number,
  height: number,
): void {
  if (
    !tempCanvas ||
    tempCanvas.width !== res.width ||
    tempCanvas.height !== res.height
  ) {
    tempCanvas = tempCanvas ?? document.createElement('canvas');
    tempCanvas.width = res.width;
    tempCanvas.height = res.height;
  }
  const tctx = tempCanvas.getContext('2d');
  if (!tctx) return;
  const img = new ImageData(res.bytes, res.width, res.height);
  tctx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
}

export function renderImageSVG(
  res: DitherResult,
  _settings: Settings,
  _palette: string[],
  width: number,
  height: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = res.width;
  canvas.height = res.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.putImageData(new ImageData(res.bytes, res.width, res.height), 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" width="${width}" height="${height}" preserveAspectRatio="none"/></svg>`;
}
