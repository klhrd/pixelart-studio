import puppeteer from 'puppeteer-core';
import { deflateSync } from 'node:zlib';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
function makeTestPng(w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const i = y * (w * 3 + 1) + 1 + x * 3;
      raw[i] = (x / w) * 255;
      raw[i + 1] = (y / h) * 255;
      raw[i + 2] = 128;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = mkdtempSync(join(tmpdir(), 'pixelcraft-prod-'));
const pngPath = join(dir, 'photo.png');
writeFileSync(pngPath, makeTestPng(1400, 900));

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const logs = [];
page.on('console', (m) => {
  if (m.type() === 'error') logs.push(`[console.error] ${m.text()}`);
});
page.on('pageerror', (err) => {
  logs.push(`[pageerror] ${err.message}\n  ${(err.stack || '').split('\n').slice(1, 5).join('\n  ')}`);
});

await page.goto('http://localhost:4174', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForSelector('button', { timeout: 15000 });
await new Promise((r) => setTimeout(r, 1500));
await page.reload({ waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 1500));

const fileInput = await page.$('input[type="file"]');
await fileInput.uploadFile(pngPath);
await new Promise((r) => setTimeout(r, 3000));
console.log('upload:', JSON.stringify(await page.evaluate(() => ({
  boundary: document.body.innerText.includes('Render error'),
  canvas: !!document.querySelector('canvas'),
}))));
if (logs.length) { console.log('-- errors:'); for (const l of logs) console.log(l); }
logs.length = 0;

const engines = ['Truchet Tiling', 'Voronoi / Low-Poly', 'Braille Raster', 'Error Diffusion'];
for (const name of engines) {
  const btns = await page.$$('nav button');
  await btns[0].click();
  await page.waitForFunction(() => document.body.innerText.includes('Moon Phase Halftone'), { timeout: 5000 });
  const cards = await page.$$('div[class*="rounded-t-2xl"] button');
  for (const card of cards) {
    const t = await card.evaluate((el) => el.textContent || '');
    if (t.includes(name)) { await card.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 2200));
  const err = await page.evaluate(() => document.body.innerText.includes('Render error'));
  console.log(`switch→${name}: ${err ? 'CRASH' : 'ok'}`);
  if (logs.length) { console.log('-- errors:'); for (const l of logs) console.log(l); }
  logs.length = 0;
}

const swState = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? { active: !!reg.active, scope: reg.scope } : null;
});
console.log('service worker:', JSON.stringify(swState));

await browser.close();
console.log('PROD SMOKE DONE');
