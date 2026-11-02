import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto('http://localhost:4174', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForSelector('nav button', { timeout: 15000 });
await new Promise((r) => setTimeout(r, 1200));
const btns = await page.$$('nav button');
await btns[1].click();
await new Promise((r) => setTimeout(r, 400));
const cards = await page.$$('div[class*="rounded-t-2xl"] button');
for (const card of cards) { const t = await card.evaluate((el) => el.textContent || ''); if (t.includes('Engine Settings')) { await card.click(); break; } }
await new Promise((r) => setTimeout(r, 400));
const custom = await page.$$('button');
for (const b of custom) { const t = await b.evaluate((el) => el.textContent || ''); if (t.includes('Custom…')) { await b.evaluate((el) => el.scrollIntoView({ block: 'center' })); await new Promise((r2) => setTimeout(r2, 300)); await b.click(); break; } }
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: 'shot-custom-palette.png' });
await browser.close();
console.log('saved');
