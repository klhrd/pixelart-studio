import { describe, it, expect } from 'vitest';
import { applyTone, grayscale } from './luminance';

describe('grayscale', () => {
  it('uses Rec.601 luma weights', () => {
    const px = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]);
    const g = grayscale(px);
    expect(g.length).toBe(3);
    expect(g[0]).toBeCloseTo(0.299 * 255, 3);
    expect(g[1]).toBeCloseTo(0.587 * 255, 3);
    expect(g[2]).toBeCloseTo(0.114 * 255, 3);
  });

  it('returns one value per pixel', () => {
    const px = new Uint8ClampedArray(16); // 4 px
    expect(grayscale(px).length).toBe(4);
  });
});

describe('applyTone', () => {
  it('is identity with neutral settings', () => {
    const px = new Uint8ClampedArray([10, 20, 30, 255, 200, 150, 100, 128]);
    const out = applyTone(px, 0, 0, 0);
    for (let i = 0; i < px.length; i++) expect(out[i]).toBe(px[i]);
  });

  it('preserves alpha and brightens', () => {
    const px = new Uint8ClampedArray([100, 100, 100, 77]);
    const out = applyTone(px, 20, 0, 0);
    expect(out[3]).toBe(77);
    expect(out[0]).toBeGreaterThan(100);
  });

  it('desaturating fully produces gray', () => {
    const px = new Uint8ClampedArray([200, 50, 50, 255]);
    const out = applyTone(px, 0, 0, -100);
    expect(out[0]).toBeCloseTo(out[1], 0);
    expect(out[1]).toBeCloseTo(out[2], 0);
  });

  it('keeps the output clamped to 0-255', () => {
    const px = new Uint8ClampedArray([250, 250, 250, 255]);
    const out = applyTone(px, 100, 100, 0);
    expect(out[0]).toBe(255);
  });
});
