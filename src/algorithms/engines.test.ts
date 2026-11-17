import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS } from '../store/settingsContext';
import { computeBraille } from './braille';
import { computeHexDump } from './hexdump';
import { computePosterize } from './posterize';

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

describe('computeBraille', () => {
  const base = { ...DEFAULT_SETTINGS, cellSize: 8, threshold: 128, invert: false };

  it('lights every dot for a white image', () => {
    const res = computeBraille(solid(16, 16, 255, 255, 255), 16, 16, base);
    expect(res.bits.length).toBe(res.cols * res.rows);
    for (const v of res.bits) expect(v).toBe(0xff);
  });

  it('clears every dot for a black image', () => {
    const res = computeBraille(solid(16, 16, 0, 0, 0), 16, 16, base);
    for (const v of res.bits) expect(v).toBe(0);
  });
});

describe('computeHexDump', () => {
  it('reports the average color of a uniform image', () => {
    const neutral = { ...DEFAULT_SETTINGS, contrast: 0, brightness: 0, saturation: 0 };
    const res = computeHexDump(solid(32, 32, 100, 150, 200), 32, 32, neutral);
    expect(res.cols).toBeGreaterThan(0);
    expect(res.rows).toBeGreaterThan(0);
    expect(res.rgb[0]).toBeCloseTo(100, 4);
    expect(res.rgb[1]).toBeCloseTo(150, 4);
    expect(res.rgb[2]).toBeCloseTo(200, 4);
    const expected = (0.299 * 100 + 0.587 * 150 + 0.114 * 200) / 255;
    expect(res.luma[0]).toBeCloseTo(expected, 5);
  });
});

describe('computePosterize', () => {
  const base = { ...DEFAULT_SETTINGS, posterBands: 2 };
  const palette = ['#000000', '#ffffff'];

  it('maps black to the first palette band', () => {
    const res = computePosterize(solid(16, 16, 0, 0, 0), 16, 16, base, palette);
    for (let p = 0, i = 0; p < 16 * 16; p++, i += 4) {
      expect(res.bytes[i]).toBe(0);
      expect(res.bytes[i + 1]).toBe(0);
      expect(res.bytes[i + 2]).toBe(0);
    }
  });

  it('maps white to the last palette band', () => {
    const res = computePosterize(solid(16, 16, 255, 255, 255), 16, 16, base, palette);
    for (let p = 0, i = 0; p < 16 * 16; p++, i += 4) {
      expect(res.bytes[i]).toBe(255);
      expect(res.bytes[i + 1]).toBe(255);
      expect(res.bytes[i + 2]).toBe(255);
    }
  });

  it('clamps bands to the configured maximum', () => {
    const many = { ...DEFAULT_SETTINGS, posterBands: 100 };
    const res = computePosterize(solid(8, 8, 128, 128, 128), 8, 8, many, palette);
    expect(res.width).toBe(8);
    expect(res.height).toBe(8);
    expect(res.bytes.length).toBe(8 * 8 * 4);
  });
});
