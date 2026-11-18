import { applyTone } from './luminance';
import type { PixelateResult, Settings } from '../types';

export function computePixelate(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): PixelateResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const scale = Math.max(1, Math.round(s.cellSize));

  const out = new Uint8ClampedArray(w * h * 4);
  for (let by = 0; by < h; by += scale) {
    for (let bx = 0; bx < w; bx += scale) {
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let count = 0;
      const yEnd = Math.min(by + scale, h);
      const xEnd = Math.min(bx + scale, w);
      for (let y = by; y < yEnd; y++) {
        for (let x = bx; x < xEnd; x++) {
          const o = (y * w + x) * 4;
          sr += tone[o];
          sg += tone[o + 1];
          sb += tone[o + 2];
          count++;
        }
      }
      const ar = Math.round(sr / count);
      const ag = Math.round(sg / count);
      const ab = Math.round(sb / count);
      for (let y = by; y < yEnd; y++) {
        for (let x = bx; x < xEnd; x++) {
          const o = (y * w + x) * 4;
          out[o] = ar;
          out[o + 1] = ag;
          out[o + 2] = ab;
          out[o + 3] = 255;
        }
      }
    }
  }
  return { width: w, height: h, bytes: out };
}
