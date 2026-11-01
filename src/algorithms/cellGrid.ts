import type { SobelField } from './sobel';

export interface GridInfo {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
}

export function makeGrid(w: number, h: number, cell: number): GridInfo {
  const cols = Math.max(1, Math.round(w / cell));
  const rows = Math.max(1, Math.round(h / cell));
  return { cols, rows, cellW: w / cols, cellH: h / rows };
}

export function cellLuminance(
  lum: Float32Array,
  w: number,
  h: number,
  grid: GridInfo,
): Float32Array {
  const { cols, rows, cellW, cellH } = grid;
  const out = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor(r * cellH);
    const y1 = Math.min(h, Math.ceil((r + 1) * cellH));
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * cellW);
      const x1 = Math.min(w, Math.ceil((c + 1) * cellW));
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        const row = y * w;
        for (let x = x0; x < x1; x++) {
          sum += lum[row + x];
          count++;
        }
      }
      out[r * cols + c] = count > 0 ? sum / count : 0;
    }
  }
  return out;
}

export interface GradientStats {
  angle: Float32Array;
  magnitude: Float32Array;
}

export function cellGradientStats(
  sob: SobelField,
  w: number,
  h: number,
  grid: GridInfo,
): GradientStats {
  const { cols, rows, cellW, cellH } = grid;
  const angle = new Float32Array(cols * rows);
  const magnitude = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor(r * cellH);
    const y1 = Math.min(h, Math.ceil((r + 1) * cellH));
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * cellW);
      const x1 = Math.min(w, Math.ceil((c + 1) * cellW));
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        const row = y * w;
        for (let x = x0; x < x1; x++) {
          sumX += sob.gx[row + x];
          sumY += sob.gy[row + x];
          count++;
        }
      }
      const i = r * cols + c;
      if (count === 0 || (sumX === 0 && sumY === 0)) {
        angle[i] = 0;
        magnitude[i] = 0;
      } else {
        angle[i] = Math.atan2(sumY, sumX);
        magnitude[i] = Math.min(
          1,
          Math.sqrt(sumX * sumX + sumY * sumY) / (count * 255),
        );
      }
    }
  }
  return { angle, magnitude };
}
