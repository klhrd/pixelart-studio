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

  const buf = new Float32Array(w * h * 3);
  for (let p = 0, i = 0, o = 0; p < w * h; p++, i += 4, o += 3) {
    buf[o] = tone[i];
    buf[o + 1] = tone[i + 1];
    buf[o + 2] = tone[i + 2];
  }

  const out = new Uint8ClampedArray(w * h * 4);
  const serpentine = s.serpentine;

  for (let y = 0; y < h; y++) {
    const serp = serpentine && (y & 1) === 1;
    const row = y * w;
    for (let xi = 0; xi < w; xi++) {
      const x = serp ? w - 1 - xi : xi;
      const o = row * 3 + x * 3;
      const r = buf[o];
      const g = buf[o + 1];
      const b = buf[o + 2];

      // Find nearest palette color (inline, no function call)
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

      const p4 = row * 4 + x * 4;
      out[p4] = pr;
      out[p4 + 1] = pg;
      out[p4 + 2] = pb;
      out[p4 + 3] = 255;

      // Inline error diffusion (no function call overhead)
      if (serp) {
        if (x > 0) {
          const idx = row * 3 + (x - 1) * 3;
          buf[idx] += er * 0.4375;
          buf[idx + 1] += eg * 0.4375;
          buf[idx + 2] += eb * 0.4375;
        }
        if (x < w - 1 && y < h - 1) {
          const idx = (y + 1) * w * 3 + (x + 1) * 3;
          buf[idx] += er * 0.1875;
          buf[idx + 1] += eg * 0.1875;
          buf[idx + 2] += eb * 0.1875;
        }
        if (y < h - 1) {
          const idx = (y + 1) * w * 3 + x * 3;
          buf[idx] += er * 0.3125;
          buf[idx + 1] += eg * 0.3125;
          buf[idx + 2] += eb * 0.3125;
        }
        if (x > 0 && y < h - 1) {
          const idx = (y + 1) * w * 3 + (x - 1) * 3;
          buf[idx] += er * 0.0625;
          buf[idx + 1] += eg * 0.0625;
          buf[idx + 2] += eb * 0.0625;
        }
      } else {
        if (x < w - 1) {
          const idx = row * 3 + (x + 1) * 3;
          buf[idx] += er * 0.4375;
          buf[idx + 1] += eg * 0.4375;
          buf[idx + 2] += eb * 0.4375;
        }
        if (x > 0 && y < h - 1) {
          const idx = (y + 1) * w * 3 + (x - 1) * 3;
          buf[idx] += er * 0.1875;
          buf[idx + 1] += eg * 0.1875;
          buf[idx + 2] += eb * 0.1875;
        }
        if (y < h - 1) {
          const idx = (y + 1) * w * 3 + x * 3;
          buf[idx] += er * 0.3125;
          buf[idx + 1] += eg * 0.3125;
          buf[idx + 2] += eb * 0.3125;
        }
        if (x < w - 1 && y < h - 1) {
          const idx = (y + 1) * w * 3 + (x + 1) * 3;
          buf[idx] += er * 0.0625;
          buf[idx + 1] += eg * 0.0625;
          buf[idx + 2] += eb * 0.0625;
        }
      }
    }
  }

  return { width: w, height: h, bytes: out };
}
