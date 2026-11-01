import { Delaunay } from 'd3-delaunay';
import { applyTone, grayscale } from './luminance';
import { sobel } from './sobel';
import type { Settings, VoronoiResult } from '../types';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function computeVoronoi(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): VoronoiResult {
  const tone = applyTone(bytes, s.brightness, s.contrast);
  const lum = grayscale(tone);
  const sob = sobel(lum, w, h);
  const rand = mulberry32(Math.imul(s.seed, 2654435761));

  const target = s.pointDensity;
  const aspect = w / h;
  const gx = Math.max(2, Math.round(Math.sqrt(target * aspect)));
  const gy = Math.max(2, Math.round(target / gx));

  const pts: number[] = [];
  const seen = new Set<number>();
  const push = (x: number, y: number) => {
    const xi = Math.max(0, Math.min(w - 1, Math.round(x)));
    const yi = Math.max(0, Math.min(h - 1, Math.round(y)));
    const key = yi * w + xi;
    if (seen.has(key)) return;
    seen.add(key);
    pts.push(xi, yi);
  };

  const cw = w / gx;
  const ch = h / gy;
  for (let iy = 0; iy < gy; iy++) {
    for (let ix = 0; ix < gx; ix++) {
      push((ix + 0.15 + rand() * 0.7) * cw, (iy + 0.15 + rand() * 0.7) * ch);
    }
  }

  const extraCount = Math.round(target * 0.6);
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
        for (let x = x0; x < x1; x++) sum += sob.mag[row + x];
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
  for (let k = 0; k < extraCount; k++) {
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
    push((bx + rand()) * bw, (by + rand()) * bh);
  }

  const n = pts.length >> 1;
  const coords = new Float64Array(pts);
  const del = new Delaunay(coords);

  const sumR = new Float64Array(n);
  const sumG = new Float64Array(n);
  const sumB = new Float64Array(n);
  const cnt = new Float64Array(n);
  const stride = w * h > 400000 ? 2 : 1;
  let hint = 0;
  for (let y = 0; y < h; y += stride) {
    for (let x = 0; x < w; x += stride) {
      const k = del.find(x, y, hint);
      hint = k;
      const i = (y * w + x) * 4;
      sumR[k] += tone[i];
      sumG[k] += tone[i + 1];
      sumB[k] += tone[i + 2];
      cnt[k] += 1;
    }
  }

  const flat: number[] = [];
  const starts: number[] = [];
  const lengths: number[] = [];
  const colors: number[] = [];

  const commitCell = (verts: number[], rgb: [number, number, number]) => {
    starts.push(flat.length >> 1);
    lengths.push(verts.length >> 1);
    for (const v of verts) flat.push(v);
    colors.push(Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2]));
  };

  if (s.voronoiMode === 'voronoi') {
    const vor = del.voronoi([0, 0, w, h]);
    for (let i = 0; i < n; i++) {
      const poly = vor.cellPolygon(i);
      if (!poly) continue;
      const verts: number[] = [];
      for (let v = 0; v < poly.length - 1; v++) {
        verts.push(poly[v][0], poly[v][1]);
      }
      if (verts.length < 6) continue;
      const c = cnt[i];
      const rgb: [number, number, number] =
        c > 0
          ? [sumR[i] / c, sumG[i] / c, sumB[i] / c]
          : [0, 0, 0];
      commitCell(verts, rgb);
    }
  } else {
    for (const t of del.trianglePolygons()) {
      const cx = (t[0][0] + t[1][0] + t[2][0]) / 3;
      const cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
      const xi = Math.max(0, Math.min(w - 1, Math.round(cx)));
      const yi = Math.max(0, Math.min(h - 1, Math.round(cy)));
      const i = (yi * w + xi) * 4;
      commitCell(
        [t[0][0], t[0][1], t[1][0], t[1][1], t[2][0], t[2][1]],
        [tone[i], tone[i + 1], tone[i + 2]],
      );
    }
  }

  return {
    coords: Float32Array.from(flat),
    starts: Uint32Array.from(starts),
    lengths: Uint32Array.from(lengths),
    colors: Uint8Array.from(colors),
  };
}
