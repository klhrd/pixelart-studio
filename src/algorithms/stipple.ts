import { Delaunay } from 'd3-delaunay';
import { applyTone, grayscale } from './luminance';
import { mulberry32 } from './random';
import type { Settings, StippleResult } from '../types';

export function computeStipple(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): StippleResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const rand = mulberry32(Math.imul(s.seed, 40503));
  // Point count is driven by Cell Size: smaller cells => more points (inverse).
  const cell = Math.max(1, Math.round(s.cellSize));
  const area = w * h;
  const n = Math.max(200, Math.min(60000, Math.round(area / (cell * cell))));

  const BX = 32;
  const BY = Math.max(2, Math.round((BX * h) / w));
  const bw = Math.ceil(w / BX);
  const bh = Math.ceil(h / BY);
  const blockCount = BX * BY;
  const weights = new Float64Array(blockCount);
  let total = 0;
  for (let by = 0; by < BY; by++) {
    for (let bx = 0; bx < BX; bx++) {
      let sum = 0;
      const y0 = by * bh;
      const y1 = Math.min(h, y0 + bh);
      const x0 = bx * bw;
      const x1 = Math.min(w, x0 + bw);
      for (let y = y0; y < y1; y++) {
        const row = y * w;
        for (let x = x0; x < x1; x++) sum += 255 - lum[row + x];
      }
      weights[by * BX + bx] = sum;
      total += sum;
    }
  }
  if (total <= 0) {
    weights.fill(1);
    total = blockCount;
  }
  const cdf = new Float64Array(blockCount);
  let acc = 0;
  for (let i = 0; i < blockCount; i++) {
    acc += weights[i];
    cdf[i] = acc / total;
  }

  const coords = new Float64Array(n * 2);
  for (let k = 0; k < n; k++) {
    const t = rand();
    let lo = 0;
    let hi = blockCount - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < t) lo = mid + 1;
      else hi = mid;
    }
    const bx = lo % BX;
    const by = Math.floor(lo / BX);
    coords[k * 2] = Math.min(w - 1, (bx + rand()) * bw);
    coords[k * 2 + 1] = Math.min(h - 1, (by + rand()) * bh);
  }

  const del = new Delaunay(coords);
  // Sample a bounded number of pixels per relaxation pass so the cost stays
  // flat even with tens of thousands of points (Delaunay.find is the hotspot).
  const stride = Math.max(1, Math.round(Math.sqrt(area / 12000)));
  const sx = new Float64Array(n);
  const sy = new Float64Array(n);
  const sw = new Float64Array(n);
  const iterations = Math.max(1, Math.round(s.stippleSteps));

  for (let it = 0; it < iterations; it++) {
    sx.fill(0);
    sy.fill(0);
    sw.fill(0);
    let hint = 0;
    for (let y = 0; y < h; y += stride) {
      const row = y * w;
      for (let x = 0; x < w; x += stride) {
        const k = del.find(x, y, hint);
        hint = k;
        const wt = 255 - lum[row + x];
        sx[k] += x * wt;
        sy[k] += y * wt;
        sw[k] += wt;
      }
    }
    for (let k = 0; k < n; k++) {
      if (sw[k] > 0) {
        coords[k * 2] = Math.max(0, Math.min(w - 1, sx[k] / sw[k]));
        coords[k * 2 + 1] = Math.max(0, Math.min(h - 1, sy[k] / sw[k]));
      }
    }
    del.update();
  }

  const radii = new Float32Array(n);
  let swAvg = 0;
  let posCount = 0;
  for (let k = 0; k < n; k++) {
    if (sw[k] > 0) {
      swAvg += sw[k];
      posCount++;
    }
  }
  swAvg = posCount > 0 ? swAvg / posCount : 1;
  const size = Math.max(0.2, s.stippleSize);
  for (let k = 0; k < n; k++) {
    const norm = Math.min(1, sw[k] / (swAvg * 2));
    radii[k] = (0.9 + 2.9 * Math.sqrt(norm)) * size;
  }

  return {
    points: Float32Array.from(coords),
    radii,
  };
}
