import { applyTone, grayscale } from './luminance';
import type { ContourResult, Settings } from '../types';

function boxBlur(
  src: Float32Array,
  w: number,
  h: number,
  radius: number,
): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const span = radius * 2 + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let d = -radius; d <= radius; d++) {
        const xx = Math.min(w - 1, Math.max(0, x + d));
        sum += src[row + xx];
      }
      tmp[row + x] = sum / span;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let d = -radius; d <= radius; d++) {
        const yy = Math.min(h - 1, Math.max(0, y + d));
        sum += tmp[yy * w + x];
      }
      out[y * w + x] = sum / span;
    }
  }
  return out;
}

export function computeContour(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): ContourResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const radius = Math.min(8, Math.max(1, Math.round(s.cellSize / 6)));
  const height = boxBlur(lum, w, h, radius);

  const levels = Math.min(20, Math.max(4, Math.round(s.contourLevels)));
  const segs: number[] = [];
  const segLevel: number[] = [];

  const edgePoint = (
    edge: 't' | 'r' | 'b' | 'l',
    x: number,
    y: number,
    tl: number,
    tr: number,
    br: number,
    bl: number,
    t: number,
  ): [number, number] => {
    switch (edge) {
      case 't':
        return [x + (t - tl) / Math.max(1e-6, tr - tl), y];
      case 'r':
        return [x + 1, y + (t - tr) / Math.max(1e-6, br - tr)];
      case 'b':
        return [x + (t - bl) / Math.max(1e-6, br - bl), y + 1];
      case 'l':
        return [x, y + (t - tl) / Math.max(1e-6, bl - tl)];
    }
  };

  for (let li = 0; li < levels; li++) {
    const t = ((li + 1) / (levels + 1)) * 255;
    for (let y = 0; y < h - 1; y++) {
      const row = y * w;
      const row2 = (y + 1) * w;
      for (let x = 0; x < w - 1; x++) {
        const tl = height[row + x];
        const tr = height[row + x + 1];
        const bl = height[row2 + x];
        const br = height[row2 + x + 1];
        const code =
          (tl > t ? 8 : 0) + (tr > t ? 4 : 0) + (br > t ? 2 : 0) + (bl > t ? 1 : 0);
        if (code === 0 || code === 15) continue;

        const P = (e: 't' | 'r' | 'b' | 'l') =>
          edgePoint(e, x, y, tl, tr, br, bl, t);
        const emit = (a: 't' | 'r' | 'b' | 'l', b: 't' | 'r' | 'b' | 'l') => {
          const [ax, ay] = P(a);
          const [bx, by] = P(b);
          if (
            !isFinite(ax) ||
            !isFinite(ay) ||
            !isFinite(bx) ||
            !isFinite(by)
          ) return;
          segs.push(ax, ay, bx, by);
          segLevel.push(li);
        };

        switch (code) {
          case 1:
            emit('l', 'b');
            break;
          case 2:
            emit('b', 'r');
            break;
          case 3:
            emit('l', 'r');
            break;
          case 4:
            emit('t', 'r');
            break;
          case 5:
            emit('t', 'r');
            emit('l', 'b');
            break;
          case 6:
            emit('t', 'b');
            break;
          case 7:
            emit('t', 'l');
            break;
          case 8:
            emit('t', 'l');
            break;
          case 9:
            emit('t', 'b');
            break;
          case 10:
            emit('t', 'l');
            emit('b', 'r');
            break;
          case 11:
            emit('t', 'r');
            break;
          case 12:
            emit('l', 'r');
            break;
          case 13:
            emit('b', 'r');
            break;
          case 14:
            emit('l', 'b');
            break;
        }
      }
    }
  }

  return {
    segs: Float32Array.from(segs),
    level: Uint8Array.from(segLevel),
    levels,
  };
}
