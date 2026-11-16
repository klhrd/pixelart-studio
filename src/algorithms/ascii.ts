import { applyTone, grayscale } from './luminance';
import { cellLuminance, makeGrid } from './cellGrid';
import type { HanziResult, Settings } from '../types';

export const ASCII_RAMP: readonly string[] = [
  ' ',
  '.',
  ':',
  '-',
  '=',
  '+',
  '*',
  '#',
  '%',
  '@',
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function computeAscii(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): HanziResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const grid = makeGrid(w, h, s.cellSize);
  const cells = cellLuminance(lum, w, h, grid);

  const chars = new Uint8Array(cells.length);
  const luma = new Float32Array(cells.length);
  const n = ASCII_RAMP.length;
  for (let i = 0; i < cells.length; i++) {
    const l = clamp01(cells[i] / 255);
    luma[i] = l;
    chars[i] = Math.min(n - 1, Math.floor(l * n));
  }
  return { cols: grid.cols, rows: grid.rows, chars, luma };
}
