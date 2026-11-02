import type { Settings, StringArtResult } from '../types';

export function renderStringArt(
  ctx: CanvasRenderingContext2D,
  res: StringArtResult,
  settings: Settings,
  palette: string[],
  _width: number,
  _height: number,
): void {
  const { linesX1, linesY1, linesX2, linesY2, lineCount } = res;
  ctx.fillStyle = palette[palette.length - 1];
  ctx.fillRect(0, 0, _width, _height);
  ctx.strokeStyle = palette[0];
  ctx.lineWidth = Math.max(0.5, settings.cellSize / 24);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < lineCount; i++) {
    ctx.moveTo(linesX1[i], linesY1[i]);
    ctx.lineTo(linesX2[i], linesY2[i]);
  }
  ctx.stroke();
}
