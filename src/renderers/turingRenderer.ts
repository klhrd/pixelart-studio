import type { Settings, TuringResult } from '../types';

export function renderTuring(
  ctx: CanvasRenderingContext2D,
  res: TuringResult,
  _settings: Settings,
  _palette: string[],
  _width: number,
  _height: number,
): void {
  const img = new ImageData(res.bytes, res.width, res.height);
  ctx.putImageData(img, 0, 0);
}
