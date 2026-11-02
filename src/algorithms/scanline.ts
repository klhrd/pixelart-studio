import { applyTone } from './luminance';
import { mulberry32 } from './random';
import type { DitherResult, Settings } from '../types';

export function computeScanline(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): DitherResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const pitch = Math.max(3, Math.round(s.cellSize));
  const ab = Math.round(s.scanAberration);
  const gapStrength = 0.35 + 0.45 * s.scanGlow;

  const rowLum = new Float32Array(h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let x = 0; x < w; x++) {
      sum +=
        0.299 * tone[(row + x) * 4] +
        0.587 * tone[(row + x) * 4 + 1] +
        0.114 * tone[(row + x) * 4 + 2];
    }
    rowLum[y] = sum / w;
  }

  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const avg = rowLum[y] / 255;
    const phase = y % pitch;
    const gapFrac = 0.25 + 0.35 * (1 - avg);
    const gapStart = pitch * (1 - gapFrac);
    const inGap = phase >= gapStart;
    const mult = inGap
      ? 1 - gapStrength
      : 1 + 0.15 * s.scanGlow * (1 - phase / Math.max(1, gapStart));

    const row = y * w;
    for (let x = 0; x < w; x++) {
      const xr = Math.min(w - 1, x + ab);
      const xb = Math.max(0, x - ab);
      const o = (row + x) * 4;
      out[o] = tone[(row + xr) * 4] * mult;
      out[o + 1] = tone[(row + x) * 4 + 1] * mult;
      out[o + 2] = tone[(row + xb) * 4 + 2] * mult;
      out[o + 3] = 255;
    }
  }

  const rand = mulberry32(Math.imul(s.seed, 668265263));
  const blockCount = Math.round(s.scanGlitch * ((w * h) / (90 * 90)));
  const rowBuf = new Uint8ClampedArray(w * 4);
  for (let b = 0; b < blockCount; b++) {
    const bw = Math.round(30 + rand() * 140);
    const bh = Math.round(2 + rand() * 10);
    const bx = Math.round(rand() * (w - bw));
    const by = Math.round(rand() * (h - bh));
    const shift = Math.round((rand() * 2 - 1) * pitch * 2);
    const tint = rand();

    for (let y = by; y < Math.min(h, by + bh); y++) {
      const row = y * w;
      rowBuf.set(out.subarray(row * 4, (row + 1) * 4));
      for (let x = 0; x < w; x++) {
        const o = (row + x) * 4;
        if (x >= bx && x < bx + bw) {
          const src = Math.max(0, Math.min(w - 1, x - shift));
          const si = src * 4;
          out[o] = rowBuf[si];
          out[o + 1] = rowBuf[si + 1];
          out[o + 2] = rowBuf[si + 2];
          out[o + 3] = 255;
          if (tint > 0.8) out[o] = Math.min(255, out[o] + 70);
          else if (tint < 0.2) out[o + 1] = Math.min(255, out[o + 1] + 60);
        } else {
          const si = x * 4;
          out[o] = rowBuf[si];
          out[o + 1] = rowBuf[si + 1];
          out[o + 2] = rowBuf[si + 2];
          out[o + 3] = 255;
        }
      }
    }
  }

  return { width: w, height: h, bytes: out };
}
