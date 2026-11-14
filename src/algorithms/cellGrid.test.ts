import { describe, it, expect } from 'vitest';
import { cellLuminance, makeGrid } from './cellGrid';

describe('makeGrid', () => {
  it('derives cols/rows from the cell size', () => {
    const g = makeGrid(100, 50, 10);
    expect(g.cols).toBe(10);
    expect(g.rows).toBe(5);
    expect(g.cellW).toBeCloseTo(10, 6);
    expect(g.cellH).toBeCloseTo(10, 6);
  });

  it('keeps at least one row/col', () => {
    const g = makeGrid(4, 4, 100);
    expect(g.cols).toBe(1);
    expect(g.rows).toBe(1);
  });
});

describe('cellLuminance', () => {
  it('averages each cell', () => {
    const w = 4;
    const h = 2;
    const lum = new Float32Array(w * h);
    for (let x = 0; x < w; x++) {
      lum[x] = 100; // top row
      lum[w + x] = 200; // bottom row
    }
    const grid = makeGrid(w, h, 2); // 2x1 cells
    const cells = cellLuminance(lum, w, h, grid);
    expect(cells.length).toBe(2);
    expect(cells[0]).toBeCloseTo(150, 6);
    expect(cells[1]).toBeCloseTo(150, 6);
  });
});
