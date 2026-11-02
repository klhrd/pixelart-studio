import { applyTone, grayscale } from './luminance';
import type { Settings, WaveResult } from '../types';

export function computeWave(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): WaveResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const colLum = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = 0; y < h; y++) sum += lum[y * w + x];
    colLum[x] = sum / h;
  }
  return { colLum };
}
