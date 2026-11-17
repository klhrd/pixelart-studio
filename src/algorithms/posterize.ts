import { applyTone, grayscale } from './luminance';
import { hexToRgb } from './palettes';
import type { PosterizeResult, Settings } from '../types';

const BANDS_MIN = 2;
const BANDS_MAX = 16;

export function computePosterize(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
  paletteHex: string[],
): PosterizeResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const pal = paletteHex.map(hexToRgb);
  if (pal.length === 0) pal.push([0, 0, 0]);

  const n = pal.length;
  const bands = Math.max(BANDS_MIN, Math.min(BANDS_MAX, Math.round(s.posterBands)));
  const step = 256 / bands;

  const out = new Uint8ClampedArray(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const l = lum[p];
    const band = Math.min(bands - 1, Math.floor(l / step));
    const k = band % n;
    const o = p * 4;
    out[o] = pal[k][0];
    out[o + 1] = pal[k][1];
    out[o + 2] = pal[k][2];
    out[o + 3] = 255;
  }
  return { width: w, height: h, bytes: out };
}
