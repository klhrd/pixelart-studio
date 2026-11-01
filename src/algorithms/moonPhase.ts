import { applyTone, grayscale } from './luminance';
import { sobel } from './sobel';
import { cellGradientStats, cellLuminance, makeGrid } from './cellGrid';
import type { MoonResult, Settings } from '../types';

export function computeMoonField(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): MoonResult {
  const tone = applyTone(bytes, s.brightness, s.contrast);
  const lum = grayscale(tone);
  const sob = sobel(lum, w, h);
  const grid = makeGrid(w, h, s.cellSize);
  const cells = cellLuminance(lum, w, h, grid);
  const { angle, magnitude } = cellGradientStats(sob, w, h, grid);

  const phase = new Float32Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    phase[i] = Math.min(1, Math.max(0, cells[i] / 255));
  }
  return { cols: grid.cols, rows: grid.rows, phase, angle, magnitude };
}
