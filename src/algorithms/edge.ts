import { applyTone, grayscale } from './luminance';
import { sobel } from './sobel';
import { hexToRgb } from './palettes';
import type { EdgeResult, Settings } from '../types';

export function computeEdge(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
  paletteHex: string[],
): EdgeResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const field = sobel(lum, w, h);
  const pal = paletteHex.map(hexToRgb);
  if (pal.length === 0) pal.push([0, 0, 0]);

  const n = pal.length;
  const threshold = Math.max(0, Math.min(255, s.edgeThreshold));
  const scale = 1442 / 255; // max possible Sobel magnitude per 255 threshold unit

  const out = new Uint8ClampedArray(w * h * 4);
  const edge = pal[n - 1];
  const paper = pal[0];
  for (let p = 0; p < w * h; p++) {
    const mag = field.mag[p] / scale;
    const isEdge = mag > threshold;
    const c = isEdge ? edge : paper;
    const o = p * 4;
    out[o] = c[0];
    out[o + 1] = c[1];
    out[o + 2] = c[2];
    out[o + 3] = 255;
  }
  return { width: w, height: h, bytes: out };
}
