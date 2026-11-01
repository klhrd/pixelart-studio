import { applyTone, grayscale } from './luminance';
import type { BrailleResult, Settings } from '../types';

const DOT_BITS: readonly [readonly [number, number, number, number], readonly [number, number, number, number]] = [
  [0, 1, 2, 6],
  [3, 4, 5, 7],
];

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

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let pattern = 0;
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 4; i++) {
          const px = c * charW + (j + 0.5) * (charW / 2);
          const py = r * charH + (i + 0.5) * (charH / 4);
          const xi = Math.min(w - 1, Math.max(0, Math.round(px)));
          const yi = Math.min(h - 1, Math.max(0, Math.round(py)));
          const l = lum[yi * w + xi];
          const on = s.invert ? l >= s.threshold : l < s.threshold;
          if (on) pattern |= 1 << DOT_BITS[j][i];
        }
      }
      bits[r * cols + c] = pattern;
    }
  }
  return { cols, rows, bits };
}
