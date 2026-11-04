import { applyTone, grayscale } from './luminance';
import type { BrailleResult, Settings } from '../types';

const DOT_BITS: readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
] = [
  [0, 1, 2, 6],
  [3, 4, 5, 7],
];

// Dispersed rank per braille dot (bit index) for ordered dithering, so the
// lit-dot density ramps smoothly with luminance instead of a hard threshold.
const DOT_RANK = [0, 5, 2, 7, 3, 6, 1, 4];
const DOT_THRESHOLD = DOT_RANK.map((r) => ((r + 0.5) / 8) * 255);

export function computeBraille(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): BrailleResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const charW = Math.max(2, Math.round(s.cellSize));
  const charH = charW * 2;
  const cols = Math.max(1, Math.floor(w / charW));
  const rows = Math.max(1, Math.floor(h / charH));
  const bits = new Uint8Array(cols * rows);
  const bias = 128 - s.threshold;

  for (let r = 0; r < rows; r++) {
    const y0 = r * charH;
    const y1 = Math.min(h, y0 + charH);
    for (let c = 0; c < cols; c++) {
      const x0 = c * charW;
      const x1 = Math.min(w, x0 + charW);
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        const row = y * w;
        for (let x = x0; x < x1; x++) {
          sum += lum[row + x];
          count++;
        }
      }
      const level = count > 0 ? sum / count + bias : bias;

      let pattern = 0;
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 4; i++) {
          const bit = DOT_BITS[j][i];
          const thr = DOT_THRESHOLD[bit];
          // Dark blocks light most of the dots; bright blocks light few.
          const on = s.invert ? level < thr : level >= thr;
          if (on) pattern |= 1 << bit;
        }
      }
      bits[r * cols + c] = pattern;
    }
  }
  return { cols, rows, bits };
}
