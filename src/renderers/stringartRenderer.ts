import type { Settings, StringArtResult } from '../types';

export function renderStringArt(
  ctx: CanvasRenderingContext2D,
  res: StringArtResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { linesX1, linesY1, linesX2, linesY2, lineCount } = res;
  ctx.fillStyle = palette[palette.length - 1];
  ctx.fillRect(0, 0, width, height);
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

export function renderStringArtSVG(
  res: StringArtResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { linesX1, linesY1, linesX2, linesY2, lineCount } = res;
  const bg = palette[palette.length - 1];
  const ink = palette[0];

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${bg}"/>`);

  const lineWidth = Math.max(0.5, settings.cellSize / 24);

  for (let i = 0; i < lineCount; i++) {
    parts.push(
      `<line x1="${linesX1[i]}" y1="${linesY1[i]}" x2="${linesX2[i]}" y2="${linesY2[i]}" stroke="${ink}" stroke-width="${lineWidth}" stroke-linecap="round"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
