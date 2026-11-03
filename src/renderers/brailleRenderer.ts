import type { BrailleResult, Settings } from '../types';

const DOT_POS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [0, 3],
  [1, 3],
];

export function renderBraille(
  ctx: CanvasRenderingContext2D,
  res: BrailleResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { cols, rows, bits } = res;
  const cell = settings.cellSize;
  const dot = cell / 2;
  const radius = dot * 0.36;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = palette[palette.length - 1];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pattern = bits[row * cols + col];
      if (pattern === 0) continue;
      const x0 = col * cell;
      const y0 = row * cell * 2;
      for (let k = 0; k < 8; k++) {
        if ((pattern & (1 << k)) === 0) continue;
        const [j, i] = DOT_POS[k];
        const cx = x0 + (2 * j + 1) * dot;
        const cy = y0 + (2 * i + 1) * dot;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
        ctx.fill();
      }
    }
  }
}

export function renderBrailleSVG(
  res: BrailleResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { cols, rows, bits } = res;
  const cell = settings.cellSize;
  const dot = cell / 2;
  const radius = dot * 0.36;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pattern = bits[row * cols + col];
      if (pattern === 0) continue;
      const x0 = col * cell;
      const y0 = row * cell * 2;
      for (let k = 0; k < 8; k++) {
        if ((pattern & (1 << k)) === 0) continue;
        const [j, i] = DOT_POS[k];
        const cx = x0 + (2 * j + 1) * dot;
        const cy = y0 + (2 * i + 1) * dot;
        parts.push(
          `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${palette[palette.length - 1]}"/>`,
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
