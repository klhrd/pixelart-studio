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
  const { cols, rows, chars } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);

  // Light paper with dark ink: denser (darker) characters in the shadows so
  // bright regions read light and dark regions read dark.
  ctx.fillStyle = palette[palette.length - 1];
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = palette[0];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.floor(cell * 1.12)}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Hiragino Sans", sans-serif`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const code = chars[row * cols + col];
      if (code === 255) continue;
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
  const { cols, rows, chars } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);
  const fontSize = Math.floor(cell * 1.12);

  const parts: string[] = [];
  parts.push(
    `<rect width="${width}" height="${height}" fill="${palette[palette.length - 1]}"/>`,
  );

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const code = chars[row * cols + col];
      if (code === 255) continue;
      parts.push(
        `<text x="${((col + 0.5) * cw).toFixed(1)}" y="${((row + 0.5) * ch + cell * 0.04).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif" font-size="${fontSize}" fill="${palette[0]}">${HANZI_RAMP[code]}</text>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
