import { applyTone, grayscale } from './luminance';
import type { Settings, TuringResult } from '../types';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function computeTuring(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): TuringResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);

  // Simulate on a bounded grid so the reaction scale is consistent (and fast)
  // regardless of the source resolution; upscale the pattern afterwards.
  const maxSide = 200;
  const k = Math.min(1, maxSide / Math.max(w, h));
  const sw = Math.max(8, Math.round(w * k));
  const sh = Math.max(8, Math.round(h * k));
  const sn = sw * sh;

  const lumS = new Float32Array(sn);
  for (let y = 0; y < sh; y++) {
    const y0 = Math.floor((y * h) / sh);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * h) / sh));
    for (let x = 0; x < sw; x++) {
      const x0 = Math.floor((x * w) / sw);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * w) / sw));
      let sum = 0;
      let count = 0;
      for (let yy = y0; yy < y1; yy++) {
        const row = yy * w;
        for (let xx = x0; xx < x1; xx++) {
          sum += lum[row + xx];
          count++;
        }
      }
      lumS[y * sw + x] = sum / count;
    }
  }

  // A=1 / B=0 pinned on the border ring (never updated) so the field does not
  // bleed to zero; pre-fill the scratch buffers to keep that across swaps.
  let A = new Float32Array(sn).fill(1);
  let B = new Float32Array(sn);
  let nextA = new Float32Array(sn).fill(1);
  let nextB = new Float32Array(sn);
  // Jittered lattice of active seeds: even coverage without a regular grid.
  for (let i = 0; i < sn; i++) B[i] = Math.random() * 0.05;
  for (let gy = 8; gy < sh - 8; gy += 16) {
    for (let gx = 8; gx < sw - 8; gx += 16) {
      const px = Math.min(sw - 2, Math.max(1, gx + Math.floor((Math.random() - 0.5) * 9)));
      const py = Math.min(sh - 2, Math.max(1, gy + Math.floor((Math.random() - 0.5) * 9)));
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          B[(py + dy) * sw + (px + dx)] = 1;
        }
      }
    }
  }

  const Da = 1.0;
  const Db = 0.5;
  const feed = s.turingFeed;
  const kill = s.turingKill;
  const frames = Math.max(1, Math.round(s.turingFrames));

  for (let f = 0; f < frames; f++) {
    for (let y = 1; y < sh - 1; y++) {
      const row = y * sw;
      const rowP = (y - 1) * sw;
      const rowN = (y + 1) * sw;
      for (let x = 1; x < sw - 1; x++) {
        const i = row + x;
        const a = A[i];
        const b = B[i];
        const ab2 = a * b * b;
        const lapA =
          0.2 * (A[rowP + x] + A[rowN + x] + A[row + x - 1] + A[row + x + 1]) +
          0.05 *
            (A[rowP + x - 1] + A[rowP + x + 1] + A[rowN + x - 1] + A[rowN + x + 1]) -
          a;
        const lapB =
          0.2 * (B[rowP + x] + B[rowN + x] + B[row + x - 1] + B[row + x + 1]) +
          0.05 *
            (B[rowP + x - 1] + B[rowP + x + 1] + B[rowN + x - 1] + B[rowN + x + 1]) -
          b;
        nextA[i] = clamp01(a + (Da * lapA - ab2 + feed * (1 - a)));
        nextB[i] = clamp01(b + (Db * lapB + ab2 - (feed + kill) * b));
      }
    }
    const tmp = A; A = nextA; nextA = tmp;
    const tmpB = B; B = nextB; nextB = tmpB;
  }

  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(sh - 1, Math.floor((y * sh) / h));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(sw - 1, Math.floor((x * sw) / w));
      const pattern = Math.min(1, B[sy * sw + sx] * 2.6);
      const i = y * w + x;
      // Luminance stays the base image; the reaction veins darken it.
      const v = lum[i] * (1 - 0.6 * pattern);
      const o = i * 4;
      out[o] = v;
      out[o + 1] = v;
      out[o + 2] = v;
      out[o + 3] = 255;
    }
  }
  return { width: w, height: h, bytes: out };
}
