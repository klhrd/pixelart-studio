import { applyTone } from './luminance';
import type { BendayResult, Settings } from '../types';

function bilinear(
  plane: Float32Array,
  w: number,
  h: number,
  x: number,
  y: number,
): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  if (x0 < 0 || y0 < 0 || x0 >= w - 1 || y0 >= h - 1) return -1;
  const tx = x - x0;
  const ty = y - y0;
  const i00 = y0 * w + x0;
  return (
    plane[i00] * (1 - tx) * (1 - ty) +
    plane[i00 + 1] * tx * (1 - ty) +
    plane[i00 + w] * (1 - tx) * ty +
    plane[i00 + w + 1] * tx * ty
  );
}

function channelDots(
  plane: Float32Array,
  w: number,
  h: number,
  angleDeg: number,
  pitch: number,
  maxR: number,
): Float32Array {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;

  let dMin = Infinity;
  let dMax = -Infinity;
  let nMin = Infinity;
  let nMax = -Infinity;
  for (const [px, py] of [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ]) {
    const d = px * dx + py * dy;
    const n = px * nx + py * ny;
    dMin = Math.min(dMin, d);
    dMax = Math.max(dMax, d);
    nMin = Math.min(nMin, n);
    nMax = Math.max(nMax, n);
  }

  const dots: number[] = [];
  const iStart = Math.floor(dMin / pitch) - 1;
  const iEnd = Math.ceil(dMax / pitch) + 1;
  const jStart = Math.floor(nMin / pitch) - 1;
  const jEnd = Math.ceil(nMax / pitch) + 1;

  for (let j = jStart; j <= jEnd; j++) {
    for (let i = iStart; i <= iEnd; i++) {
      const x = i * pitch * dx + j * pitch * nx;
      const y = i * pitch * dy + j * pitch * ny;
      if (x < 0 || x >= w - 1 || y < 0 || y >= h - 1) continue;
      const d = bilinear(plane, w, h, x, y);
      if (d <= 0.01) continue;
      const r = maxR * Math.sqrt(Math.min(1, d));
      dots.push(x, y, r);
    }
  }
  return Float32Array.from(dots);
}

export function computeBenday(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): BendayResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const n = w * h;
  const cPlane = new Float32Array(n);
  const mPlane = new Float32Array(n);
  const yPlane = new Float32Array(n);
  const kPlane = new Float32Array(n);

  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const r = tone[i] / 255;
    const g = tone[i + 1] / 255;
    const b = tone[i + 2] / 255;
    const k = 1 - Math.max(r, g, b);
    const denom = 1 - k;
    kPlane[p] = k;
    if (denom <= 0.001) {
      cPlane[p] = 0;
      mPlane[p] = 0;
      yPlane[p] = 0;
    } else {
      cPlane[p] = Math.max(0, Math.min(1, (1 - r - k) / denom));
      mPlane[p] = Math.max(0, Math.min(1, (1 - g - k) / denom));
      yPlane[p] = Math.max(0, Math.min(1, (1 - b - k) / denom));
    }
  }

  const pitch = Math.max(3, Math.round(s.cellSize));
  const maxR = pitch * 0.62 * s.bendayScale;

  return {
    c: channelDots(cPlane, w, h, 15, pitch, maxR),
    m: channelDots(mPlane, w, h, 75, pitch, maxR),
    y: channelDots(yPlane, w, h, 0, pitch, maxR),
    k: channelDots(kPlane, w, h, 45, pitch, maxR),
  };
}
