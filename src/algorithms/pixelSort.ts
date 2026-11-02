import { applyTone, grayscale } from './luminance';
import type { Settings } from '../types';

export function computePixelSort(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): { width: number; height: number; bytes: Uint8ClampedArray } {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const out = new Uint8ClampedArray(bytes.length);
  out.set(bytes);

  const threshold = s.pixelSortThreshold;
  const asc = s.pixelSortMode === 'asc';

  if (s.pixelSortDirection === 'vertical') {
    for (let x = 0; x < w; x++) {
      let y = 0;
      while (y < h) {
        let start = -1;
        while (y < h) {
          const v = lum[y * w + x];
          const inSeg = asc ? v < threshold : v > threshold;
          if (inSeg && start < 0) start = y;
          if (!inSeg && start >= 0) break;
          y++;
        }
        if (start < 0) break;
        const end = y;
        const len = end - start;
        const vals: number[] = [];
        for (let yy = start; yy < end; yy++) vals.push(lum[yy * w + x]);
        vals.sort((a, b) => asc ? a - b : b - a);
        for (let k = 0; k < len; k++) {
          const targetLum = vals[k];
          // 找原圖中對應像素：以亮度最接近的換入（簡化：直接寫入灰度，保留色相）
          const o = ((start + k) * w + x) * 4;
          out[o] = targetLum;
          out[o + 1] = targetLum;
          out[o + 2] = targetLum;
        }
      }
    }
  } else {
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        let start = -1;
        while (x < w) {
          const v = lum[y * w + x];
          const inSeg = asc ? v < threshold : v > threshold;
          if (inSeg && start < 0) start = x;
          if (!inSeg && start >= 0) break;
          x++;
        }
        if (start < 0) break;
        const end = x;
        const len = end - start;
        const vals: number[] = [];
        for (let xx = start; xx < end; xx++) vals.push(lum[y * w + xx]);
        vals.sort((a, b) => asc ? a - b : b - a);
        for (let k = 0; k < len; k++) {
          const targetLum = vals[k];
          const o = (y * w + start + k) * 4;
          out[o] = targetLum;
          out[o + 1] = targetLum;
          out[o + 2] = targetLum;
        }
      }
    }
  }
  return { width: w, height: h, bytes: out };
}
