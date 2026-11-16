import { ASCII_RAMP } from '../algorithms/ascii';
import type { HanziResult, Settings } from '../types';

const FONT_FAMILY =
  'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace';

export function renderAscii(
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

  // Dark background with a uniform light ink: denser (brighter) cells print
  // more glyph coverage, so bright regions read dense and shadows stay sparse.
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = palette[palette.length - 1];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.floor(cell * 0.95)}px ${FONT_FAMILY}`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const code = chars[row * cols + col];
      const glyph = ASCII_RAMP[code];
      if (glyph === ' ') continue;
      ctx.fillText(glyph, (col + 0.5) * cw, (row + 0.5) * ch);
    }
  }
}

export function renderAsciiSVG(
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
  const fontSize = Math.floor(cell * 0.95);

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const code = chars[row * cols + col];
      const glyph = ASCII_RAMP[code];
      if (glyph === ' ') continue;
      parts.push(
        `<text x="${((col + 0.5) * cw).toFixed(1)}" y="${((row + 0.5) * ch).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace" font-size="${fontSize}" fill="${palette[palette.length - 1]}">${glyph}</text>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
