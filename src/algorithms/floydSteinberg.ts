import { applyTone } from './luminance';
import { hexToRgb } from './palettes';
import type { DitherResult, Settings } from '../types';

function diffuse(
  buf: Float32Array,
  w: number,
  h: number,
  palR: Float32Array,
  palG: Float32Array,
  palB: Float32Array,
  serpentine: boolean,
): Uint8ClampedArray {
  const n = palR.length;
  const out = new Uint8ClampedArray(w * h * 3);

  for (let y = 0; y < h; y++) {
    const serp = serpentine && (y & 1) === 1;
    const row = y * w;
    for (let xi = 0; xi < w; xi++) {
      const x = serp ? w - 1 - xi : xi;
      const o = (row + x) * 3;
      const r = buf[o];
      const g = buf[o + 1];
      const b = buf[o + 2];

      let bestIdx = 0;
      let bestD = Infinity;
      for (let k = 0; k < n; k++) {
        const dr = r - palR[k];
        const dg = g - palG[k];
        const db = b - palB[k];
        const d = dr * dr * 2 + dg * dg * 4 + db * db * 3;
        if (d < bestD) {
          bestD = d;
          bestIdx = k;
        }
      }

      const pr = palR[bestIdx];
      const pg = palG[bestIdx];
      const pb = palB[bestIdx];
      const er = r - pr;
      const eg = g - pg;
      const eb = b - pb;

      out[o] = pr;
      out[o + 1] = pg;
      out[o + 2] = pb;

      if (serp) {
        if (x > 0) {
          const i = (row + x - 1) * 3;
          buf[i] += er * 0.4375;
          buf[i + 1] += eg * 0.4375;
          buf[i + 2] += eb * 0.4375;
        }
        if (x < w - 1 && y < h - 1) {
          const i = ((y + 1) * w + x + 1) * 3;
          buf[i] += er * 0.1875;
          buf[i + 1] += eg * 0.1875;
          buf[i + 2] += eb * 0.1875;
        }
        if (y < h - 1) {
          const i = ((y + 1) * w + x) * 3;
          buf[i] += er * 0.3125;
          buf[i + 1] += eg * 0.3125;
          buf[i + 2] += eb * 0.3125;
        }
        if (x > 0 && y < h - 1) {
          const i = ((y + 1) * w + x - 1) * 3;
          buf[i] += er * 0.0625;
          buf[i + 1] += eg * 0.0625;
          buf[i + 2] += eb * 0.0625;
        }
      } else {
        if (x < w - 1) {
          const i = (row + x + 1) * 3;
          buf[i] += er * 0.4375;
          buf[i + 1] += eg * 0.4375;
          buf[i + 2] += eb * 0.4375;
        }
        if (x > 0 && y < h - 1) {
          const i = ((y + 1) * w + x - 1) * 3;
          buf[i] += er * 0.1875;
          buf[i + 1] += eg * 0.1875;
          buf[i + 2] += eb * 0.1875;
        }
        if (y < h - 1) {
          const i = ((y + 1) * w + x) * 3;
          buf[i] += er * 0.3125;
          buf[i + 1] += eg * 0.3125;
          buf[i + 2] += eb * 0.3125;
        }
        if (x < w - 1 && y < h - 1) {
          const i = ((y + 1) * w + x + 1) * 3;
          buf[i] += er * 0.0625;
          buf[i + 1] += eg * 0.0625;
          buf[i + 2] += eb * 0.0625;
        }
      }
    }
  }
  return out;
}

function toRgba(
  rgb: Uint8ClampedArray,
  w: number,
  h: number,
): Uint8ClampedArray {
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

  const n = pal.length;
  const palR = new Float32Array(n);
  const palG = new Float32Array(n);
  const palB = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    palR[i] = pal[i][0];
    palG[i] = pal[i][1];
    palB[i] = pal[i][2];
  }

  // The shared Cell Size default (14) maps to full resolution so classic
  // fine-grained dithering is the default; larger values yield chunkier output.
  const scale = Math.max(1, Math.round(s.cellSize) - 13);

  if (scale === 1) {
    const buf = new Float32Array(w * h * 3);
    for (let p = 0, i = 0, o = 0; p < w * h; p++, i += 4, o += 3) {
      buf[o] = tone[i];
      buf[o + 1] = tone[i + 1];
      buf[o + 2] = tone[i + 2];
    }
    const rgb = diffuse(buf, w, h, palR, palG, palB, s.serpentine);
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

  const rgb = diffuse(buf, dw, dh, palR, palG, palB, s.serpentine);
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
