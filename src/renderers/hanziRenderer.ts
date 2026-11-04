import { HANZI_RAMP } from '../algorithms/hanzi';
import type { HanziResult, Settings } from '../types';

export function renderHanzi(
  ctx: CanvasRenderingContext2D,
  res: HanziResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { cols, rows, chars, luma } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);
  const n = palette.length;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.floor(cell * 0.94)}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Hiragino Sans", sans-serif`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const code = chars[i];
      if (code === 255) continue;
      const t = 1 - luma[i];
      const colorIdx = Math.min(n - 1, Math.round(t * (n - 1)));
      ctx.fillStyle = palette[colorIdx];
      ctx.fillText(
        HANZI_RAMP[code],
        (col + 0.5) * cw,
        (row + 0.5) * ch + cell * 0.04,
      );
    }
  }
}

export function renderHanziSVG(
  res: HanziResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { cols, rows, chars, luma } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);
  const n = palette.length;
  const fontSize = Math.floor(cell * 0.94);

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const code = chars[i];
      if (code === 255) continue;
      const t = 1 - luma[i];
      const colorIdx = Math.min(n - 1, Math.round(t * (n - 1)));
      parts.push(
        `<text x="${((col + 0.5) * cw).toFixed(1)}" y="${((row + 0.5) * ch + cell * 0.04).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif" font-size="${fontSize}" fill="${palette[colorIdx]}">${HANZI_RAMP[code]}</text>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
