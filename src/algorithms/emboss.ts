import { applyTone, grayscale } from './luminance';
import type { EmbossResult, Settings } from '../types';

const KERNEL: number[][] = [
  [-1, -1, 0],
  [-1, 0, 1],
  [0, 1, 1],
];

export function computeEmboss(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): EmbossResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const strength = Math.max(0, Math.min(4, s.embossStrength));
  const offset = 128;

  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      let v = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const ny = Math.min(h - 1, Math.max(0, y + ky));
          const nx = Math.min(w - 1, Math.max(0, x + kx));
          const np = ny * w + nx;
          v += lum[np] * KERNEL[ky + 1][kx + 1];
        }
      }
      let val = offset + v * strength;
      if (val < 0) val = 0;
      if (val > 255) val = 255;
      const o = p * 4;
      out[o] = val;
      out[o + 1] = val;
      out[o + 2] = val;
      out[o + 3] = 255;
    }
  }
  return { width: w, height: h, bytes: out };
}
