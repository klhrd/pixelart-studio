import { describe, it, expect } from 'vitest';
import { extractPalette } from './extractPalette';

function solid(w: number, h: number, r: number, g: number, b: number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = 255;
  }
  return px;
}

describe('extractPalette', () => {
  it('returns a single colour for a solid image', () => {
    const out = extractPalette(solid(16, 16, 200, 100, 50), 16, 16, 4);
    expect(out.length).toBe(1);
    expect(out[0]).toBe('#c86432');
  });

  it('recovers distinct colours and orders them dark -> light', () => {
    const w = 40;
    const h = 10;
    const px = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        // four equal monochrome stripes: 0, 85, 170, 255
        const v = x < 10 ? 0 : x < 20 ? 85 : x < 30 ? 170 : 255;
        px[i] = v;
        px[i + 1] = v;
        px[i + 2] = v;
        px[i + 3] = 255;
      }
    }
    const out = extractPalette(px, w, h, 4);
    expect(out).toEqual(['#000000', '#555555', '#aaaaaa', '#ffffff']);
  });

  it('ignores fully transparent pixels', () => {
    const px = new Uint8ClampedArray(4 * 4 * 4);
    // all transparent
    const out = extractPalette(px, 4, 4, 4);
    expect(out.length).toBe(0);
  });
});
