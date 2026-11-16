import { applyTone } from './luminance';
import { hexToRgb } from './palettes';
import type { DitherResult, Settings } from '../types';

export function computeChladni(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
  paletteHex: string[] = [],
): DitherResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);
  const m = Math.max(1, Math.min(12, Math.round(s.chladniM)));
  const n = Math.max(1, Math.min(12, Math.round(s.chladniN)));
  const out = new Uint8ClampedArray(w * h * 4);

  const pal = paletteHex.map(hexToRgb);
  const paper = pal[0] ?? [0, 0, 0];
  const ink = pal.length > 0 ? pal[pal.length - 1] : [0, 0, 0];

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const row = y * w;
    const snV = Math.sin(n * Math.PI * v);
    const smV = Math.sin(m * Math.PI * v);
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const base =
        Math.sin(n * Math.PI * u) * smV + Math.sin(m * Math.PI * u) * snV;

      const i = (row + x) * 4;
      const l = (0.299 * tone[i] + 0.587 * tone[i + 1] + 0.114 * tone[i + 2]) / 255;
      const val = Math.abs(base + (l - 0.5) * 1.2);
      const on = val < 0.08;

      const c = on ? ink : paper;
      out[i] = c[0];
      out[i + 1] = c[1];
      out[i + 2] = c[2];
      out[i + 3] = 255;
    }
  }

  return { width: w, height: h, bytes: out };
}
