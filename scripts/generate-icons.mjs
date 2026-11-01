import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [9, 9, 11, 255];
const FG = [52, 211, 153, 255];
const FG_DIM = [16, 110, 84, 255];
const GRID = 16;

function iconPixel(x, y) {
  const px = x + 0.5;
  const py = y + 0.5;
  const inCircle = (cx, cy, r) => (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
  if (inCircle(7.4, 8.2, 5.4) && !inCircle(9.9, 6.4, 4.7)) return FG;
  if (inCircle(12.6, 3.4, 1.15)) return FG;
  if (
    inCircle(3.2, 3.9, 0.75) ||
    inCircle(2.4, 12.6, 0.75) ||
    inCircle(13.4, 11.8, 0.75)
  ) {
    return FG_DIM;
  }
  return BG;
}

function renderIcon(size, cell) {
  const offset = (size - GRID * cell) / 2;
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - offset) / cell);
      const gy = Math.floor((y - offset) / cell);
      const color =
        gx >= 0 && gx < GRID && gy >= 0 && gy < GRID ? iconPixel(gx, gy) : BG;
      const i = (y * size + x) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = color[3];
    }
  }
  return encodePng(size, rgba);
}

const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'pwa-192.png'), renderIcon(192, 12));
writeFileSync(join(outDir, 'pwa-512.png'), renderIcon(512, 32));
writeFileSync(join(outDir, 'maskable-512.png'), renderIcon(512, 24));
console.log('Icons written to public/icons');
