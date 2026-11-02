import type { Settings, StippleResult } from '../types';

export function renderStipple(
  ctx: CanvasRenderingContext2D,
  res: StippleResult,
  settings: Settings,
  palette: string[],
  _width: number,
  _height: number,
): void {
  const { points, radii } = res;
  const bg = palette[palette.length - 1];
  const ink = palette[0];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, _width, _height);
  ctx.fillStyle = ink;

  const scale = Math.max(0.4, settings.cellSize / 14);
  for (let k = 0; k < radii.length; k++) {
    const r = radii[k] * scale;
    ctx.beginPath();
    ctx.arc(points[k * 2], points[k * 2 + 1], r, 0, Math.PI * 2, false);
    ctx.fill();
  }
}
