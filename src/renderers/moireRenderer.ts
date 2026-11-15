import type { MoireResult, Settings } from '../types';
import { moirePixels } from '../algorithms/moire';

let tempCanvas: HTMLCanvasElement | null = null;

export function renderMoire(
  ctx: CanvasRenderingContext2D,
  res: MoireResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const out = moirePixels(
    res.lum,
    res.width,
    res.height,
    settings,
    palette,
    settings.animOffset,
  );

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
  tctx.putImageData(new ImageData(out, res.width, res.height), 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
}
