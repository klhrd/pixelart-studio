import { applyTone, grayscale } from './luminance';
import type { SolarizeResult, Settings } from '../types';

export function computeSolarize(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): SolarizeResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const threshold = Math.max(0, Math.min(255, s.solarizeThreshold));

  const out = new Uint8ClampedArray(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const o = p * 4;
    const isSolarized = lum[p] > threshold;
    out[o] = isSolarized ? 255 - tone[o] : tone[o];
    out[o + 1] = isSolarized ? 255 - tone[o + 1] : tone[o + 1];
    out[o + 2] = isSolarized ? 255 - tone[o + 2] : tone[o + 2];
    out[o + 3] = 255;
  }
  return { width: w, height: h, bytes: out };
}
