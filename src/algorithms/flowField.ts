import { applyTone, grayscale } from './luminance';
import { sobel } from './sobel';
import { mulberry32 } from './random';
import type { FlowResult, Settings } from '../types';

function valueNoise2D(seed: number): (x: number, y: number) => number {
  const hash = (ix: number, iy: number) => {
    let h =
      Math.imul(ix, 374761393) ^
      Math.imul(iy, 668265263) ^
      Math.imul(seed, 974634617);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  return (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

export function computeFlowField(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): FlowResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const sob = sobel(lum, w, h);
  const rand = mulberry32(Math.imul(s.seed, 2246822519));

  const res = Math.max(2, Math.round(s.cellSize / 2));
  const gw = Math.ceil(w / res) + 1;
  const gh = Math.ceil(h / res) + 1;
  const vx = new Float32Array(gw * gh);
  const vy = new Float32Array(gw * gh);
  const noise = valueNoise2D(Math.imul(s.seed, 2654435761));
  const k = s.flowNoise;

  for (let iy = 0; iy < gh; iy++) {
    for (let ix = 0; ix < gw; ix++) {
      const px = Math.min(w - 1, ix * res);
      const py = Math.min(h - 1, iy * res);
      const si = py * w + px;
      const thetaG = Math.atan2(sob.gy[si], sob.gx[si]) + Math.PI / 2;
      const thetaN = noise(ix * 0.09, iy * 0.09) * Math.PI * 4;
      vx[iy * gw + ix] = (1 - k) * Math.cos(thetaG) + k * Math.cos(thetaN);
      vy[iy * gw + ix] = (1 - k) * Math.sin(thetaG) + k * Math.sin(thetaN);
    }
  }

  const sampleVx = (x: number, y: number): number => {
    const fx = Math.max(0, Math.min(gw - 1.001, x / res));
    const fy = Math.max(0, Math.min(gh - 1.001, y / res));
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const i00 = y0 * gw + x0;
    const v00 = vx[i00];
    const v = (
      v00 * (1 - tx) * (1 - ty) +
      vx[i00 + 1] * tx * (1 - ty) +
      vx[i00 + gw] * (1 - tx) * ty +
      vx[i00 + gw + 1] * tx * ty
    );
    return v;
  };
  const sampleVy = (x: number, y: number): number => {
    const fx = Math.max(0, Math.min(gw - 1.001, x / res));
    const fy = Math.max(0, Math.min(gh - 1.001, y / res));
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const i00 = y0 * gw + x0;
    const v = (
      vy[i00] * (1 - tx) * (1 - ty) +
      vy[i00 + 1] * tx * (1 - ty) +
      vy[i00 + gw] * (1 - tx) * ty +
      vy[i00 + gw + 1] * tx * ty
    );
    return v;
  };

  const count = Math.round(s.flowParticles);
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

  const stepLen = Math.max(1.5, res * 0.45);
  const steps = Math.max(4, Math.round(s.flowSteps));
  const coords: number[] = [];
  const starts: number[] = [];
  const lengths: number[] = [];
  const shades: number[] = [];

  for (let p = 0; p < count; p++) {
    const t = rand();
    let lo = 0;
    let hi = blockCount - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < t) lo = mid + 1;
      else hi = mid;
    }
    let x = Math.min(w - 1, (lo % BX + rand()) * bw);
    let y = Math.min(h - 1, (Math.floor(lo / BX) + rand()) * bh);

    starts.push(coords.length / 2);
    let len = 0;
    let lumSum = 0;
    for (let t2 = 0; t2 < steps; t2++) {
      coords.push(x, y);
      len++;
      const px = Math.max(0, Math.min(w - 1, Math.round(x)));
      const py = Math.max(0, Math.min(h - 1, Math.round(y)));
      lumSum += lum[py * w + px];
      const dx = sampleVx(x, y);
      const dy = sampleVy(x, y);
      const mag = Math.hypot(dx, dy) || 1;
      x += (dx / mag) * stepLen;
      y += (dy / mag) * stepLen;
      if (x < 0 || x >= w || y < 0 || y >= h) break;
    }
    if (len < 4) {
      coords.length = starts.pop()! * 2;
      continue;
    }
    lengths.push(len);
    shades.push(1 - lumSum / (len * 255));
  }

  return {
    coords: Float32Array.from(coords),
    starts: Uint32Array.from(starts),
    lengths: Uint32Array.from(lengths),
    shade: Float32Array.from(shades),
  };
}
