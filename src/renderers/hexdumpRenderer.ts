import type { HexDumpResult, Settings } from '../types';

function hex2(v: number): string {
  return Math.max(0, Math.min(255, Math.round(v)))
    .toString(16)
    .toUpperCase()
    .padStart(2, '0');
}

export function renderHexDump(
  ctx: CanvasRenderingContext2D,
  res: HexDumpResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { cols, rows, rgb, luma } = res;
  const cellH = height / rows;
  const n = palette.length;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${Math.max(6, Math.floor(cellH * 0.68))}px ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const li = luma[i];
      const colorIdx = Math.min(n - 1, Math.round(li * (n - 1)));
      ctx.fillStyle = palette[colorIdx];
      const o = i * 3;
      ctx.fillText(
        `#${hex2(rgb[o])}${hex2(rgb[o + 1])}${hex2(rgb[o + 2])}`,
        ((col + 0.5) * width) / cols,
        ((row + 0.5) * height) / rows,
      );
    }
  }
}

export function renderHexDumpSVG(
  res: HexDumpResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { cols, rows, rgb, luma } = res;
  const cellH = height / rows;
  const n = palette.length;
  const fontSize = Math.max(6, Math.floor(cellH * 0.68));

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const colorIdx = Math.min(n - 1, Math.round(luma[i] * (n - 1)));
      const o = i * 3;
      parts.push(
        `<text x="${(((col + 0.5) * width) / cols).toFixed(1)}" y="${(((row + 0.5) * height) / rows).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="${fontSize}" fill="${palette[colorIdx]}">#${hex2(rgb[o])}${hex2(rgb[o + 1])}${hex2(rgb[o + 2])}</text>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
