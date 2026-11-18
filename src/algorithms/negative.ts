import { applyTone } from './luminance';
import type { NegativeResult, Settings } from '../types';

export function computeNegative(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): NegativeResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const invert = s.negativeInvert;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const o = p * 4;
    out[o] = invert ? 255 - tone[o] : tone[o];
    out[o + 1] = invert ? 255 - tone[o + 1] : tone[o + 1];
    out[o + 2] = invert ? 255 - tone[o + 2] : tone[o + 2];
    out[o + 3] = 255;
  }
  return { width: w, height: h, bytes: out };
}
