import { applyTone, grayscale } from './luminance';
import type { Settings, StringArtResult } from '../types';

export function computeStringArt(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): StringArtResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const weight = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) weight[i] = 255 - lum[i];

  const n = Math.max(8, Math.min(400, Math.round(s.stringPoints)));
  const anchorsX = new Float32Array(n);
  const anchorsY = new Float32Array(n);
  // Classic string-art: nails evenly spaced on a circle, so threads cross the
  // interior instead of hugging the frame. Coordinates are integers so the
  // Bresenham walk terminates exactly on the endpoint.
  const cx0 = (w - 1) / 2;
  const cy0 = (h - 1) / 2;
  const radius = Math.min(w, h) / 2 - 1;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    anchorsX[i] = Math.round(cx0 + Math.cos(a) * radius);
    anchorsY[i] = Math.round(cy0 + Math.sin(a) * radius);
  }

  // Precompute every nail-to-nail line once (symmetric, so only i<j) as a flat
  // list of pixel indices. The greedy loop then only sums floats, which is fast
  // enough for thousands of threads.
  const pairIdx = new Int32Array(n * n).fill(-1);
  const pairLen = new Int32Array(n * n);
  const flat: number[] = [];
  const pair = (i: number, j: number) => i * n + j;
  for (let i = 0; i < n; i++) {
    const x0 = anchorsX[i];
    const y0 = anchorsY[i];
    for (let j = i + 1; j < n; j++) {
      const x1 = anchorsX[j];
      const y1 = anchorsY[j];
      const start = flat.length;
      let x = x0;
      let y = y0;
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      let count = 0;
      for (;;) {
        if (x >= 0 && x < w && y >= 0 && y < h) {
          flat.push(y * w + x);
          count++;
        }
        if (x === x1 && y === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x += sx;
        }
        if (e2 < dx) {
          err += dx;
          y += sy;
        }
      }
      pairIdx[pair(i, j)] = start;
      pairLen[pair(i, j)] = count;
    }
  }
  const flatArr = Int32Array.from(flat);

  const lineCountTarget = Math.max(1, Math.min(40000, Math.round(s.stringLines)));
  const linesX1 = new Float32Array(lineCountTarget);
  const linesY1 = new Float32Array(lineCountTarget);
  const linesX2 = new Float32Array(lineCountTarget);
  const linesY2 = new Float32Array(lineCountTarget);
  let lineCount = 0;
  let cur = 0;
  const remaining = new Float32Array(weight);
  // With many threads a pixel must absorb several crossings before it is
  // "used up", so dark regions keep drawing threads and the image emerges.
  const costScale = 3.2;

  for (let step = 0; step < lineCountTarget; step++) {
    let best = -1;
    let bestScore = -1;
    const cx = anchorsX[cur];
    const cy = anchorsY[cur];
    for (let t = 0; t < n; t++) {
      if (t === cur) continue;
      const key = t < cur ? pair(t, cur) : pair(cur, t);
      const start = pairIdx[key];
      if (start < 0) continue;
      const len = pairLen[key];
      if (len === 0) continue;
      let score = 0;
      const end = start + len;
      for (let k = start; k < end; k++) score += remaining[flatArr[k]];
      score /= len;
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    }
    if (best < 0 || bestScore <= 0.2) break;

    const key = best < cur ? pair(best, cur) : pair(cur, best);
    const start = pairIdx[key];
    const end = start + pairLen[key];
    for (let k = start; k < end; k++) {
      const idx = flatArr[k];
      remaining[idx] = Math.max(0, remaining[idx] - costScale);
    }

    linesX1[lineCount] = cx;
    linesY1[lineCount] = cy;
    linesX2[lineCount] = anchorsX[best];
    linesY2[lineCount] = anchorsY[best];
    lineCount++;
    cur = best;
  }

  return {
    anchorsX: Float32Array.from(anchorsX),
    anchorsY: Float32Array.from(anchorsY),
    linesX1: linesX1.slice(0, lineCount),
    linesY1: linesY1.slice(0, lineCount),
    linesX2: linesX2.slice(0, lineCount),
    linesY2: linesY2.slice(0, lineCount),
    lineCount,
  };
}
