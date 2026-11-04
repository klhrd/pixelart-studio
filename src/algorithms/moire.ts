import { applyTone, grayscale } from './luminance';
import { hexToRgb } from './palettes';
import type { DitherResult, Settings } from '../types';

export function computeMoire(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
  paletteHex: string[],
): DitherResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const pal = paletteHex.map(hexToRgb);
  if (pal.length === 0) pal.push([0, 0, 0]);
  const ink = pal[0];
  const paper = pal[pal.length - 1];

  const sizeScale = 14 / Math.max(1, s.cellSize);
  const freq = s.moireFreq * 0.5 * sizeScale;
  const phase = s.moirePhase * Math.PI;
  const cx = w / 2;
  const cy = h / 2;

  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const l = lum[y * w + x] / 255;
      let arg: number;
      if (s.moirePattern === 'lines') {
        arg = x * freq + phase * l;
      } else if (s.moirePattern === 'rings') {
        arg = Math.hypot(x - cx, y - cy) * freq + phase * l;
      } else {
        const dx = x - cx;
        const dy = y - cy;
        arg = Math.hypot(dx, dy) * freq + Math.atan2(dy, dx) * 6 + phase * l;
      }
      const c = Math.sin(arg) > 0 ? ink : paper;
      const o = (y * w + x) * 4;
      out[o] = c[0];
      out[o + 1] = c[1];
      out[o + 2] = c[2];
      out[o + 3] = 255;
    }
  }
  return { width: w, height: h, bytes: out };
}
