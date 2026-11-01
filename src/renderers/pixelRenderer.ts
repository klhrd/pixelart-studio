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
