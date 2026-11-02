import { applyTone, grayscale } from './luminance';
import { cellLuminance, makeGrid } from './cellGrid';
import type { HanziResult, Settings } from '../types';

export const HANZI_RAMP: readonly string[] = [
  '一',
  '二',
  '三',
  '十',
  '口',
  '王',
  '田',
  '目',
  '回',
  '森',
  '晶',
  '鑫',
];

const BLANK = 255;

export function computeHanzi(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): HanziResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const lum = grayscale(tone);
  const grid = makeGrid(w, h, s.cellSize);
  const cells = cellLuminance(lum, w, h, grid);

  const chars = new Uint8Array(cells.length);
  const luma = new Float32Array(cells.length);
  const n = HANZI_RAMP.length;
  for (let i = 0; i < cells.length; i++) {
    const l = Math.min(1, Math.max(0, cells[i] / 255));
    luma[i] = l;
    if (l > s.blankThreshold) {
      chars[i] = BLANK;
    } else {
      const idx = Math.min(n - 1, Math.floor((1 - l) * n));
      chars[i] = idx;
    }
  }
  return { cols: grid.cols, rows: grid.rows, chars, luma };
}
