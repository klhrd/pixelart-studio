import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS } from '../store/settingsContext';
import { computeBraille } from './braille';
import { computeHexDump } from './hexdump';
import { computePosterize } from './posterize';
import { computeEdge } from './edge';
import { computeDuotone } from './duotone';
import { computeSolarize } from './solarize';
import { computeEmboss } from './emboss';
import { computeNegative } from './negative';
import { computePixelate } from './pixelate';

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

describe('computeEdge', () => {
  const base = { ...DEFAULT_SETTINGS, edgeThreshold: 100 };
  const palette = ['#000000', '#ffffff'];

  it('draws no edges on a uniform black image', () => {
    const res = computeEdge(solid(16, 16, 0, 0, 0), 16, 16, base, palette);
    for (let p = 0, i = 0; p < 16 * 16; p++, i += 4) {
      expect(res.bytes[i]).toBe(0);
      expect(res.bytes[i + 1]).toBe(0);
      expect(res.bytes[i + 2]).toBe(0);
    }
  });

  it('draws no edges on a uniform white image', () => {
    const res = computeEdge(solid(16, 16, 255, 255, 255), 16, 16, base, palette);
    for (let p = 0, i = 0; p < 16 * 16; p++, i += 4) {
      expect(res.bytes[i]).toBe(0);
      expect(res.bytes[i + 1]).toBe(0);
      expect(res.bytes[i + 2]).toBe(0);
    }
  });

  it('draws edges on a sharp black-white boundary', () => {
    const px = new Uint8ClampedArray(16 * 16 * 4);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4;
        const v = x < 8 ? 0 : 255;
        px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
      }
    }
    const res = computeEdge(px, 16, 16, base, palette);
    // Boundary column (x=7/8) should have high gradient => edge color (white)
    const edgeIdx = (7 * 16 + 7) * 4;
    expect(res.bytes[edgeIdx]).toBe(255);
    expect(res.bytes[edgeIdx + 1]).toBe(255);
    expect(res.bytes[edgeIdx + 2]).toBe(255);
  });

  it('clamps threshold and produces valid output', () => {
    const many = { ...DEFAULT_SETTINGS, edgeThreshold: 999 };
    const res = computeEdge(solid(8, 8, 128, 128, 128), 8, 8, many, palette);
    expect(res.width).toBe(8);
    expect(res.height).toBe(8);
    expect(res.bytes.length).toBe(8 * 8 * 4);
  });
});

describe('computeDuotone', () => {
  const base = {
    ...DEFAULT_SETTINGS,
    duotoneColor1: '#000000',
    duotoneColor2: '#ffffff',
  };

  it('maps black to color1 and white to color2', () => {
    const black = computeDuotone(solid(4, 4, 0, 0, 0), 4, 4, base);
    const white = computeDuotone(solid(4, 4, 255, 255, 255), 4, 4, base);
    for (let p = 0, i = 0; p < 4 * 4; p++, i += 4) {
      expect(black.bytes[i]).toBe(0);
      expect(black.bytes[i + 1]).toBe(0);
      expect(black.bytes[i + 2]).toBe(0);
      expect(white.bytes[i]).toBe(255);
      expect(white.bytes[i + 1]).toBe(255);
      expect(white.bytes[i + 2]).toBe(255);
    }
  });

  it('interpolates mid gray between colors', () => {
    const mid = computeDuotone(solid(4, 4, 128, 128, 128), 4, 4, base);
    for (let p = 0, i = 0; p < 4 * 4; p++, i += 4) {
      expect(mid.bytes[i]).toBe(128);
      expect(mid.bytes[i + 1]).toBe(128);
      expect(mid.bytes[i + 2]).toBe(128);
    }
  });

  it('uses custom palette colors', () => {
    const custom = {
      ...base,
      duotoneColor1: '#ff0000',
      duotoneColor2: '#0000ff',
    };
    const black = computeDuotone(solid(2, 2, 0, 0, 0), 2, 2, custom);
    const white = computeDuotone(solid(2, 2, 255, 255, 255), 2, 2, custom);
    expect(black.bytes[0]).toBe(255);
    expect(black.bytes[1]).toBe(0);
    expect(black.bytes[2]).toBe(0);
    expect(white.bytes[0]).toBe(0);
    expect(white.bytes[1]).toBe(0);
    expect(white.bytes[2]).toBe(255);
  });
});

describe('computeSolarize', () => {
  const base = {
    ...DEFAULT_SETTINGS,
    contrast: 0,
    solarizeThreshold: 128,
  };

  it('inverts pixels above threshold', () => {
    const px = new Uint8ClampedArray(4 * 4 * 4);
    for (let p = 0, i = 0; p < 4 * 4; p++, i += 4) {
      const v = p < 8 ? 0 : 255;
      px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
    }
    const res = computeSolarize(px, 4, 4, base);
    // First half: dark (below threshold), unchanged
    expect(res.bytes[0]).toBe(0);
    expect(res.bytes[1]).toBe(0);
    expect(res.bytes[2]).toBe(0);
    // Second half: bright (above threshold), inverted -> 0
    const brightIdx = 8 * 4;
    expect(res.bytes[brightIdx]).toBe(0);
    expect(res.bytes[brightIdx + 1]).toBe(0);
    expect(res.bytes[brightIdx + 2]).toBe(0);
  });

  it('does not invert pixels below threshold', () => {
    const px = new Uint8ClampedArray(4 * 4 * 4);
    for (let i = 0; i < px.length; i += 4) {
      px[i] = 100; px[i + 1] = 100; px[i + 2] = 100; px[i + 3] = 255;
    }
    const res = computeSolarize(px, 4, 4, base);
    for (let i = 0; i < px.length; i += 4) {
      expect(res.bytes[i]).toBe(100);
      expect(res.bytes[i + 1]).toBe(100);
      expect(res.bytes[i + 2]).toBe(100);
    }
  });

  it('clamps threshold and produces valid output', () => {
    const many = { ...DEFAULT_SETTINGS, solarizeThreshold: 999 };
    const res = computeSolarize(solid(8, 8, 128, 128, 128), 8, 8, many);
    expect(res.width).toBe(8);
    expect(res.height).toBe(8);
    expect(res.bytes.length).toBe(8 * 8 * 4);
  });
});

describe('computeEmboss', () => {
  const base = {
    ...DEFAULT_SETTINGS,
    contrast: 0,
    embossStrength: 1,
  };

  it('produces gray background for uniform image', () => {
    const res = computeEmboss(solid(16, 16, 128, 128, 128), 16, 16, base);
    for (let p = 0, i = 0; p < 16 * 16; p++, i += 4) {
      expect(res.bytes[i]).toBe(128);
      expect(res.bytes[i + 1]).toBe(128);
      expect(res.bytes[i + 2]).toBe(128);
    }
  });

  it('detects edge between black and white regions', () => {
    const px = new Uint8ClampedArray(16 * 16 * 4);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4;
        const v = x < 8 ? 0 : 255;
        px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
      }
    }
    const res = computeEmboss(px, 16, 16, base);
    // Edge region should produce non-128 values (embossed contrast)
    let hasEdge = false;
    for (let p = 0; p < 16 * 16; p++) {
      if (res.bytes[p * 4] !== 128) {
        hasEdge = true;
        break;
      }
    }
    expect(hasEdge).toBe(true);
  });

  it('clamps strength and produces valid output', () => {
    const many = { ...DEFAULT_SETTINGS, embossStrength: 999 };
    const res = computeEmboss(solid(8, 8, 128, 128, 128), 8, 8, many);
    expect(res.width).toBe(8);
    expect(res.height).toBe(8);
    expect(res.bytes.length).toBe(8 * 8 * 4);
  });
});

describe('computeNegative', () => {
  const base = {
    ...DEFAULT_SETTINGS,
    contrast: 0,
    brightness: 0,
    saturation: 0,
    negativeInvert: true,
  };

  it('inverts white to black', () => {
    const res = computeNegative(solid(4, 4, 255, 255, 255), 4, 4, base);
    for (let p = 0, i = 0; p < 4 * 4; p++, i += 4) {
      expect(res.bytes[i]).toBe(0);
      expect(res.bytes[i + 1]).toBe(0);
      expect(res.bytes[i + 2]).toBe(0);
      expect(res.bytes[i + 3]).toBe(255);
    }
  });

  it('inverts black to white', () => {
    const res = computeNegative(solid(4, 4, 0, 0, 0), 4, 4, base);
    for (let p = 0, i = 0; p < 4 * 4; p++, i += 4) {
      expect(res.bytes[i]).toBe(255);
      expect(res.bytes[i + 1]).toBe(255);
      expect(res.bytes[i + 2]).toBe(255);
      expect(res.bytes[i + 3]).toBe(255);
    }
  });

  it('passes through unchanged when invert is false', () => {
    const off = { ...base, negativeInvert: false };
    const px = solid(4, 4, 10, 20, 30);
    const res = computeNegative(px, 4, 4, off);
    for (let p = 0, i = 0; p < 4 * 4; p++, i += 4) {
      expect(res.bytes[i]).toBe(10);
      expect(res.bytes[i + 1]).toBe(20);
      expect(res.bytes[i + 2]).toBe(30);
      expect(res.bytes[i + 3]).toBe(255);
    }
  });

  it('produces valid output dimensions', () => {
    const res = computeNegative(solid(8, 8, 128, 128, 128), 8, 8, base);
    expect(res.width).toBe(8);
    expect(res.height).toBe(8);
    expect(res.bytes.length).toBe(8 * 8 * 4);
  });
});

describe('computePixelate', () => {
  const base = {
    ...DEFAULT_SETTINGS,
    contrast: 0,
    brightness: 0,
    saturation: 0,
    cellSize: 4,
  };

  it('averages a uniform image to the same colour', () => {
    const res = computePixelate(solid(8, 8, 100, 150, 200), 8, 8, base);
    for (let p = 0, i = 0; p < 8 * 8; p++, i += 4) {
      expect(res.bytes[i]).toBe(100);
      expect(res.bytes[i + 1]).toBe(150);
      expect(res.bytes[i + 2]).toBe(200);
      expect(res.bytes[i + 3]).toBe(255);
    }
  });

  it('creates distinct blocks for a checkerboard pattern', () => {
    const px = new Uint8ClampedArray(8 * 8 * 4);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const i = (y * 8 + x) * 4;
        const v = (x < 4 && y < 4) || (x >= 4 && y >= 4) ? 255 : 0;
        px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
      }
    }
    const res = computePixelate(px, 8, 8, base);
    const topLeft = res.bytes[0];
    const topRight = res.bytes[4 * 4]; // pixel (0, 4)
    expect(topLeft).toBe(255);
    expect(topRight).toBe(0);
  });

  it('clamps cellSize and produces valid output', () => {
    const many = { ...DEFAULT_SETTINGS, cellSize: 999 };
    const res = computePixelate(solid(8, 8, 128, 128, 128), 8, 8, many);
    expect(res.width).toBe(8);
    expect(res.height).toBe(8);
    expect(res.bytes.length).toBe(8 * 8 * 4);
  });
});
