import { applyTone, grayscale } from './luminance';
import type { Settings, TuringResult } from '../types';

export function computeTuring(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): TuringResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const n = w * h;

  let A = new Float32Array(n);
  let B = new Float32Array(n);
  let nextA = new Float32Array(n);
  let nextB = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    A[i] = 1;
    B[i] = (255 - lum[i]) / 255 * 0.06 + (Math.random() * 0.02);
  }

  const Da = 1.0;
  const Db = 0.5;
  const feed = s.turingFeed;
  const k = s.turingKill;
  const frames = Math.round(s.turingFrames);

  for (let f = 0; f < frames; f++) {
    for (let y = 1; y < h - 1; y++) {
      const row = y * w;
      const rowP = (y - 1) * w;
      const rowN = (y + 1) * w;
      for (let x = 1; x < w - 1; x++) {
        const i = row + x;
        const a = A[i];
        const b = B[i];
        const ab2 = a * b * b;

        const lapA =
          A[rowP + x - 1] + A[rowP + x] + A[rowP + x + 1] +
          A[row + x - 1] + A[row + x + 1] +
          A[rowN + x - 1] + A[rowN + x] + A[rowN + x + 1] - 8 * a;
        const lapB =
          B[rowP + x - 1] + B[rowP + x] + B[rowP + x + 1] +
          B[row + x - 1] + B[row + x + 1] +
          B[rowN + x - 1] + B[rowN + x] + B[rowN + x + 1] - 8 * b;

        nextA[i] = a + Da * lapA - ab2 + feed * (1 - a);
        nextB[i] = b + Db * lapB + ab2 - (f + k) * b;
      }
    }
    const tmp = A; A = nextA; nextA = tmp;
    const tmpB = B; B = nextB; nextB = tmpB;
  }

  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const v = Math.max(0, Math.min(1, B[i])) * 255;
    const o = i * 4;
    out[o] = v;
    out[o + 1] = v;
    out[o + 2] = v;
    out[o + 3] = 255;
  }
  return { width: w, height: h, bytes: out };
}
