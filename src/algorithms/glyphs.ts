import { applyTone, grayscale } from './luminance';
import { cellLuminance, makeGrid } from './cellGrid';
import type { GlyphResult, Settings } from '../types';

export function computeGlyphs(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): GlyphResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const grid = makeGrid(w, h, s.cellSize);
  const cells = cellLuminance(lum, w, h, grid);
  const luminance = new Float32Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    luminance[i] = Math.min(1, Math.max(0, cells[i] / 255));
  }
  return { cols: grid.cols, rows: grid.rows, luminance };
}
