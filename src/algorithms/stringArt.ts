import { applyTone, grayscale } from './luminance';
import type { Settings, StringArtResult } from '../types';

function* bresenham(x0: number, y0: number, x1: number, y1: number): Generator<[number, number]> {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  while (true) {
    yield [x, y];
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

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

  const n = Math.max(4, Math.round(s.stringPoints));
  const anchorsX = new Float32Array(n);
  const anchorsY = new Float32Array(n);
  const perimeter = 2 * (w + h);
  const step = perimeter / n;
  let dist = 0;
  for (let i = 0; i < n; i++) {
    // Anchor coordinates must be integers: Bresenham terminates only when the
    // running pixel lands exactly on the endpoint.
    const d = Math.round(dist);
    if (d < w) { anchorsX[i] = d; anchorsY[i] = 0; }
    else if (d < w + h) { anchorsX[i] = w - 1; anchorsY[i] = d - w; }
    else if (d < 2 * w + h) { anchorsX[i] = w - 1 - (d - w - h); anchorsY[i] = h - 1; }
    else { anchorsX[i] = 0; anchorsY[i] = h - 1 - (d - 2 * w - h); }
    dist += step;
  }

  const linesX1 = new Float32Array(n);
  const linesY1 = new Float32Array(n);
  const linesX2 = new Float32Array(n);
  const linesY2 = new Float32Array(n);
  let lineCount = 0;
  let cur = 0;
  const remaining = new Float32Array(weight);

  const lineCountTarget = Math.round(s.stringLines);
  const costScale = 0.5;

  for (let step = 0; step < lineCountTarget; step++) {
    let best = -1;
    let bestScore = -1;
    const cx = anchorsX[cur];
    const cy = anchorsY[cur];
    for (let t = 0; t < n; t++) {
      if (t === cur) continue;
      let score = 0;
      let count = 0;
      for (const [lx, ly] of bresenham(cx, cy, anchorsX[t], anchorsY[t])) {
        if (lx < 0 || lx >= w || ly < 0 || ly >= h) continue;
        score += remaining[ly * w + lx];
        count++;
      }
      if (count > 0) score /= count;
      if (score > bestScore) { bestScore = score; best = t; }
    }
    if (best < 0 || bestScore <= 0.5) break;

    for (const [lx, ly] of bresenham(cx, cy, anchorsX[best], anchorsY[best])) {
      if (lx < 0 || lx >= w || ly < 0 || ly >= h) continue;
      const idx = ly * w + lx;
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
    anchorsX: Float32Array.from(anchorsX.slice(0, n)),
    anchorsY: Float32Array.from(anchorsY.slice(0, n)),
    linesX1: Float32Array.from(linesX1.slice(0, lineCount)),
    linesY1: Float32Array.from(linesY1.slice(0, lineCount)),
    linesX2: Float32Array.from(linesX2.slice(0, lineCount)),
    linesY2: Float32Array.from(linesY2.slice(0, lineCount)),
    lineCount,
  };
}
