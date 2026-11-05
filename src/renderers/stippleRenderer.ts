import type { Settings, StippleResult } from '../types';

export function renderStipple(
  ctx: CanvasRenderingContext2D,
  res: StippleResult,
  _settings: Settings,
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

  for (let k = 0; k < radii.length; k++) {
    ctx.beginPath();
    ctx.arc(points[k * 2], points[k * 2 + 1], radii[k], 0, Math.PI * 2, false);
    ctx.fill();
  }
}

export function renderStippleSVG(
  res: StippleResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { points, radii } = res;
  const bg = palette[palette.length - 1];
  const ink = palette[0];

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${bg}"/>`);

  for (let k = 0; k < radii.length; k++) {
    parts.push(
      `<circle cx="${points[k * 2]}" cy="${points[k * 2 + 1]}" r="${radii[k].toFixed(2)}" fill="${ink}"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
