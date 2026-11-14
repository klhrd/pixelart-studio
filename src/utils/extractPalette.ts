type RGB = [number, number, number];

function toHex([r, g, b]: RGB): string {
  const h = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function luma([r, g, b]: RGB): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Extracts a `count`-colour palette from RGBA pixel data.
 *
 * Seeds centroids from the most frequent coarse (4-bit/channel) colour bins,
 * then refines with k-means. This avoids the local minima that pure median-cut
 * gets on multi-modal images. Result is ordered dark -> light so index 0 works
 * as the background colour in the renderers.
 */
export function extractPalette(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
  count = 6,
): string[] {
  const total = w * h;
  if (total === 0 || bytes.length < total * 4) return [];

  const target = 20000;
  const stride = Math.max(1, Math.floor(Math.sqrt(total / target)));
  const samples: RGB[] = [];
  const hist = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let y = 0; y < h; y += stride) {
    for (let x = 0; x < w; x += stride) {
      const i = (y * w + x) * 4;
      if (bytes[i + 3] < 128) continue;
      const p: RGB = [bytes[i], bytes[i + 1], bytes[i + 2]];
      samples.push(p);
      const key = (p[0] >> 4) * 256 + (p[1] >> 4) * 16 + (p[2] >> 4);
      let e = hist.get(key);
      if (!e) {
        e = { n: 0, r: 0, g: 0, b: 0 };
        hist.set(key, e);
      }
      e.n++;
      e.r += p[0];
      e.g += p[1];
      e.b += p[2];
    }
  }
  if (samples.length === 0) return [];

  const cents: RGB[] = [...hist.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((e) => [Math.round(e.r / e.n), Math.round(e.g / e.n), Math.round(e.b / e.n)]);

  const k = cents.length;
  for (let iter = 0; iter < 10 && k > 1; iter++) {
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (const p of samples) {
      let best = 0;
      let bd = Infinity;
      for (let c = 0; c < k; c++) {
        const dr = p[0] - cents[c][0];
        const dg = p[1] - cents[c][1];
        const db = p[2] - cents[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bd) {
          bd = d;
          best = c;
        }
      }
      sums[best][0] += p[0];
      sums[best][1] += p[1];
      sums[best][2] += p[2];
      sums[best][3]++;
    }
    for (let c = 0; c < k; c++) {
      if (sums[c][3] > 0) {
        cents[c] = [
          Math.round(sums[c][0] / sums[c][3]),
          Math.round(sums[c][1] / sums[c][3]),
          Math.round(sums[c][2] / sums[c][3]),
        ];
      }
    }
  }

  cents.sort((a, b) => luma(a) - luma(b));

  // Drop near-duplicate colours.
  const deduped: RGB[] = [];
  for (const c of cents) {
    const dup = deduped.some((d) => {
      const dr = d[0] - c[0];
      const dg = d[1] - c[1];
      const db = d[2] - c[2];
      return dr * dr + dg * dg + db * db < 900;
    });
    if (!dup) deduped.push(c);
  }

  return deduped.map(toHex);
}
