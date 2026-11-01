export function applyTone(
  bytes: Uint8ClampedArray,
  brightness: number,
  contrast: number,
  saturation: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(bytes.length);
  const b = brightness * 1.28;
  const c = (259 * (contrast * 2.55 + 255)) / (255 * (259 - contrast * 2.55));
  const s = 1 + saturation / 100;
  for (let i = 0; i < bytes.length; i += 4) {
    const r = (bytes[i] - 128) * c + 128 + b;
    const g = (bytes[i + 1] - 128) * c + 128 + b;
    const bl = (bytes[i + 2] - 128) * c + 128 + b;
    const l = 0.299 * r + 0.587 * g + 0.114 * bl;
    out[i] = l + (r - l) * s;
    out[i + 1] = l + (g - l) * s;
    out[i + 2] = l + (bl - l) * s;
    out[i + 3] = bytes[i + 3];
  }
  return out;
}

export function grayscale(bytes: Uint8ClampedArray): Float32Array {
  const n = bytes.length >> 2;
  const out = new Float32Array(n);
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    out[p] = 0.299 * bytes[i] + 0.587 * bytes[i + 1] + 0.114 * bytes[i + 2];
  }
  return out;
}
