import { applyTone } from './luminance';
import type { HexDumpResult, Settings } from '../types';

export function computeHexDump(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): HexDumpResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  // Cell size maps directly to the monospace font size so the 7-character
  // hex strings (#RRGGBB) tile tightly with minimal gaps.
  const f = Math.max(2, Math.round(s.cellSize));
  const cw = Math.max(3, Math.round(f * 4.2));
  const ch = Math.max(2, Math.round(f * 1.05));
  const cols = Math.max(1, Math.round(w / cw));
  const rows = Math.max(1, Math.round(h / ch));
  const cellW = w / cols;
  const cellH = h / rows;

  const rgb = new Uint8Array(cols * rows * 3);
  const luma = new Float32Array(cols * rows);

  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor(r * cellH);
    const y1 = Math.min(h, Math.ceil((r + 1) * cellH));
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * cellW);
      const x1 = Math.min(w, Math.ceil((c + 1) * cellW));
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        const row = y * w;
        for (let x = x0; x < x1; x++) {
          const i = (row + x) * 4;
          sr += tone[i];
          sg += tone[i + 1];
          sb += tone[i + 2];
          count++;
        }
      }
      const o = (r * cols + c) * 3;
      rgb[o] = sr / count;
      rgb[o + 1] = sg / count;
      rgb[o + 2] = sb / count;
      luma[r * cols + c] =
        (0.299 * rgb[o] + 0.587 * rgb[o + 1] + 0.114 * rgb[o + 2]) / 255;
    }
  }
  return { cols, rows, rgb, luma };
}
