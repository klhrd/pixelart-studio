import { applyTone } from './luminance';
import type { DitherResult, Settings } from '../types';

export function computeKaleidoscope(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  s: Settings,
): DitherResult {
  const tone = applyTone(bytes, s.brightness, s.contrast, s.saturation);

  const edge = Math.max(3, Math.min(32, Math.round(s.kaleidoSegments)));
  const wedge = (Math.PI * 2) / edge;
  const half = wedge / 2;
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;

  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy);
      let ang = Math.atan2(dy, dx);
      ang = ((ang % wedge) + wedge) % wedge;
      if (ang > half) ang = wedge - ang;

      let sx = Math.round(cx + Math.cos(ang) * r);
      let sy = Math.round(cy + Math.sin(ang) * r);
      sx = Math.max(0, Math.min(w - 1, sx));
      sy = Math.max(0, Math.min(h - 1, sy));

      const si = (sy * w + sx) * 4;
      const o = (row + x) * 4;
      out[o] = tone[si];
      out[o + 1] = tone[si + 1];
      out[o + 2] = tone[si + 2];
      out[o + 3] = 255;
    }
  }

  return { width: w, height: h, bytes: out };
}
