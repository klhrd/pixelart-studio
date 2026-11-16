import { applyTone } from './luminance';
import type { DitherResult, Settings } from '../types';

export function computeQuadtree(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): DitherResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const maxDepth = Math.max(1, Math.min(9, Math.round(s.quadtreeDepth)));
  const out = new Uint8ClampedArray(w * h * 4);

  const fill = (x0: number, y0: number, x1: number, y1: number, depth: number): void => {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumL = 0;
    let sumL2 = 0;
    let count = 0;

    for (let y = y0; y < y1; y++) {
      let i = (y * w + x0) * 4;
      for (let x = x0; x < x1; x++, i += 4) {
        const r = tone[i];
        const g = tone[i + 1];
        const b = tone[i + 2];
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        sumR += r;
        sumG += g;
        sumB += b;
        sumL += l;
        sumL2 += l * l;
        count++;
      }
    }

    const meanL = sumL / count;
    const variance = sumL2 / count - meanL * meanL;

    const quadW = x1 - x0;
    const quadH = y1 - y0;
    const canSplit = quadW > 1 && quadH > 1;
    const split = variance > 140 / (depth + 1);

    if (depth >= maxDepth || !canSplit || !split) {
      const r = Math.round(sumR / count);
      const g = Math.round(sumG / count);
      const b = Math.round(sumB / count);
      for (let y = y0; y < y1; y++) {
        let o = (y * w + x0) * 4;
        for (let x = x0; x < x1; x++, o += 4) {
          out[o] = r;
          out[o + 1] = g;
          out[o + 2] = b;
          out[o + 3] = 255;
        }
      }
      return;
    }

    const mx = (x0 + x1) >> 1;
    const my = (y0 + y1) >> 1;
    fill(x0, y0, mx, my, depth + 1);
    fill(mx, y0, x1, my, depth + 1);
    fill(x0, my, mx, y1, depth + 1);
    fill(mx, my, x1, y1, depth + 1);
  };

  fill(0, 0, w, h, 0);

  return { width: w, height: h, bytes: out };
}
