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
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const sob = sobel(lum, w, h);
  const grid = makeGrid(w, h, s.cellSize);
  const cells = cellLuminance(lum, w, h, grid);
  const { angle, magnitude } = cellGradientStats(sob, w, h, grid);

  const edgeBias = Math.max(0, Math.min(1, s.moonEdgeBias ?? 0));
  const phase = new Float32Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    let p = Math.min(1, Math.max(0, cells[i] / 255));
    if (edgeBias > 0) {
      // Edge site bias: pull phase toward a full moon where the gradient is
      // strong, giving a luminous rim that makes contours clearly visible.
      const e = Math.min(1, magnitude[i] * 3);
      p = Math.min(1, Math.max(0, p + edgeBias * e * (1 - p)));
    }
    phase[i] = p;
  }
  return { cols: grid.cols, rows: grid.rows, phase, angle, magnitude };
}
