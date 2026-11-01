import { applyTone, grayscale } from './luminance';
import { cellLuminance, makeGrid } from './cellGrid';
import type { Settings, TruchetResult } from '../types';

export function hashCell(x: number, y: number, seed: number): number {
  let h =
    (Math.imul(x, 374761393) +
      Math.imul(y, 668265263) +
      Math.imul(seed, 974634617)) |
    0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return h >>> 0;
}

export function computeTruchetField(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): TruchetResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const grid = makeGrid(w, h, s.cellSize);
  const cells = cellLuminance(lum, w, h, grid);

  const rotation = new Uint8Array(cells.length);
  const luminance = new Float32Array(cells.length);
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const i = r * grid.cols + c;
      rotation[i] = hashCell(c, r, s.seed) % 4;
      luminance[i] = cells[i] / 255;
    }
  }
  return { cols: grid.cols, rows: grid.rows, rotation, luminance };
}
