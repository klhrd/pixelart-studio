import type { Settings, PixelSortResult } from '../types';

export function renderPixelSort(
  ctx: CanvasRenderingContext2D,
  res: PixelSortResult,
  _settings: Settings,
  _palette: string[],
  _width: number,
  _height: number,
): void {
  const img = new ImageData(res.bytes, res.width, res.height);
  ctx.putImageData(img, 0, 0);
}
