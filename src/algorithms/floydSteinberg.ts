import { applyTone } from './luminance';
import { hexToRgb } from './palettes';
import type { DitherResult, Settings } from '../types';

export function ditherImage(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
  paletteHex: string[],
): DitherResult {
  const tone = applyTone(bytes, s.brightness, s.contrast);
  const pal = paletteHex.map(hexToRgb);
  if (pal.length === 0) pal.push([0, 0, 0]);

  const buf = new Float32Array(w * h * 3);
  for (let p = 0, i = 0, o = 0; p < w * h; p++, i += 4, o += 3) {
    buf[o] = tone[i];
    buf[o + 1] = tone[i + 1];
    buf[o + 2] = tone[i + 2];
  }

  const out = new Uint8ClampedArray(w * h * 4);

  const distribute = (
    x: number,
    y: number,
    er: number,
    eg: number,
    eb: number,
    f: number,
  ) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const o = (y * w + x) * 3;
    buf[o] += er * f;
    buf[o + 1] += eg * f;
    buf[o + 2] += eb * f;
  };

  for (let y = 0; y < h; y++) {
    const serp = s.serpentine && (y & 1) === 1;
    for (let xi = 0; xi < w; xi++) {
      const x = serp ? w - 1 - xi : xi;
      const o = (y * w + x) * 3;
      const r = buf[o];
      const g = buf[o + 1];
      const b = buf[o + 2];

      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k < pal.length; k++) {
        const dr = r - pal[k][0];
        const dg = g - pal[k][1];
        const db = b - pal[k][2];
        const d = dr * dr * 2 + dg * dg * 4 + db * db * 3;
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      }

      const pr = pal[best][0];
      const pg = pal[best][1];
      const pb = pal[best][2];
      const er = r - pr;
      const eg = g - pg;
      const eb = b - pb;

      const p4 = (y * w + x) * 4;
      out[p4] = pr;
      out[p4 + 1] = pg;
      out[p4 + 2] = pb;
      out[p4 + 3] = 255;

      if (serp) {
        distribute(x - 1, y, er, eg, eb, 7 / 16);
        distribute(x + 1, y + 1, er, eg, eb, 3 / 16);
        distribute(x, y + 1, er, eg, eb, 5 / 16);
        distribute(x - 1, y + 1, er, eg, eb, 1 / 16);
      } else {
        distribute(x + 1, y, er, eg, eb, 7 / 16);
        distribute(x - 1, y + 1, er, eg, eb, 3 / 16);
        distribute(x, y + 1, er, eg, eb, 5 / 16);
        distribute(x + 1, y + 1, er, eg, eb, 1 / 16);
      }
    }
  }

  return { width: w, height: h, bytes: out };
}
