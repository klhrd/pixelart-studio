import { applyTone, grayscale } from './luminance';
import { hexToRgb } from './palettes';
import type { DuotoneResult, Settings } from '../types';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function computeDuotone(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): DuotoneResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const c1 = hexToRgb(s.duotoneColor1);
  const c2 = hexToRgb(s.duotoneColor2);

  const out = new Uint8ClampedArray(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const t = lum[p] / 255;
    const r = Math.round(lerp(c1[0], c2[0], t));
    const g = Math.round(lerp(c1[1], c2[1], t));
    const b = Math.round(lerp(c1[2], c2[2], t));
    const o = p * 4;
    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    out[o + 3] = 255;
  }
  return { width: w, height: h, bytes: out };
}
