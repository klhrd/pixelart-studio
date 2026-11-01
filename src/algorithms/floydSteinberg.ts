import { applyTone } from './luminance';
import { hexToRgb } from './palettes';
import type { DitherResult, Settings } from '../types';

type RGB = [number, number, number];

function diffuse(
  buf: Float32Array,
  w: number,
  h: number,
  pal: RGB[],
  serpentine: boolean,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 3);

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
    const serp = serpentine && (y & 1) === 1;
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

      out[o] = pr;
      out[o + 1] = pg;
      out[o + 2] = pb;

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
  return out;
}

function toRgba(rgb: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let p = 0, i = 0, o = 0; p < w * h; p++, i += 3, o += 4) {
    out[o] = rgb[i];
    out[o + 1] = rgb[i + 1];
    out[o + 2] = rgb[i + 2];
    out[o + 3] = 255;
  }
  return out;
}

export function ditherImage(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
  paletteHex: string[],
): DitherResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const pal = paletteHex.map(hexToRgb);
  if (pal.length === 0) pal.push([0, 0, 0]);
  const scale = Math.max(1, Math.round(s.cellSize));

  if (scale === 1) {
    const buf = new Float32Array(w * h * 3);
    for (let p = 0, i = 0, o = 0; p < w * h; p++, i += 4, o += 3) {
      buf[o] = tone[i];
      buf[o + 1] = tone[i + 1];
      buf[o + 2] = tone[i + 2];
    }
    const rgb = diffuse(buf, w, h, pal, s.serpentine);
    return { width: w, height: h, bytes: toRgba(rgb, w, h) };
  }

  const dw = Math.max(1, Math.floor(w / scale));
  const dh = Math.max(1, Math.floor(h / scale));
  const buf = new Float32Array(dw * dh * 3);
  for (let dy = 0; dy < dh; dy++) {
    const y0 = Math.floor((dy * h) / dh);
    const y1 = Math.max(y0 + 1, Math.floor(((dy + 1) * h) / dh));
    for (let dx = 0; dx < dw; dx++) {
      const x0 = Math.floor((dx * w) / dw);
      const x1 = Math.max(x0 + 1, Math.floor(((dx + 1) * w) / dw));
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        const row = y * w;
        for (let x = x0; x < x1; x++) {
          const i = (row + x) * 4;
          sr += tone[i];
          sg += tone[i + 1];
          sb += tone[i + 2];
          count++;
        }
      }
      const o = (dy * dw + dx) * 3;
      buf[o] = sr / count;
      buf[o + 1] = sg / count;
      buf[o + 2] = sb / count;
    }
  }

  const rgb = diffuse(buf, dw, dh, pal, s.serpentine);
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(dh - 1, Math.floor((y * dh) / h));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(dw - 1, Math.floor((x * dw) / w));
      const si = (sy * dw + sx) * 3;
      const o = (y * w + x) * 4;
      out[o] = rgb[si];
      out[o + 1] = rgb[si + 1];
      out[o + 2] = rgb[si + 2];
      out[o + 3] = 255;
    }
  }
  return { width: w, height: h, bytes: out };
}
