import puppeteer from 'puppeteer-core';
import { deflateSync } from 'node:zlib';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
function mk(w,h){const ct=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;ct[n]=c;}const crc=(b)=>{let c=-1;for(let i=0;i<b.length;i++)c=ct[(c^b[i])&0xff]^(c>>>8);return(c^-1)>>>0;};const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const tb=Buffer.from(t);const cb=Buffer.alloc(4);cb.writeUInt32BE(crc(Buffer.concat([tb,d])));return Buffer.concat([l,tb,d,cb]);};const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=2;const raw=Buffer.alloc((w*3+1)*h);const cx=w*0.5,cy=h*0.5,R=Math.min(w,h)*0.3;for(let y=0;y<h;y++){raw[y*(w*3+1)]=0;for(let x=0;x<w;x++){const i=y*(w*3+1)+1+x*3;const d=Math.hypot(x-cx,y-cy);const v=d<R?40:220;raw[i]=v;raw[i+1]=v;raw[i+2]=v;}}return Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),ch('IHDR',ih),ch('IDAT',deflateSync(raw)),ch('IEND',Buffer.alloc(0))]);}
const dir=mkdtempSync(join(tmpdir(),'pc-stp2-'));const img=join(dir,'g.png');writeFileSync(img,mk(1024,1024));
const b64=(o)=>Buffer.from(encodeURIComponent(JSON.stringify(o))).toString('base64');
const browser=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:'new',args:['--no-sandbox']});
for(const cs of [2,3,8]){
  const page=await browser.newPage();await page.setViewport({width:1280,height:900});
  await page.goto('http://localhost:5199/#s='+b64({e:'stipple',s:{cellSize:cs,stippleSize:1,stippleSteps:8}}),{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('input[type="file"]',{timeout:15000});await new Promise(r=>setTimeout(r,900));
  const t0=Date.now();await (await page.$('input[type="file"]')).uploadFile(img);
  // wait until export button enabled (result ready)
  await page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(x=>/export png/i.test(x.textContent||''));return b && !b.disabled;},{timeout:120000}).catch(()=>{});
  const dur=Date.now()-t0;await new Promise(r=>setTimeout(r,500));
  await page.screenshot({path:'stp2-'+cs+'.png',clip:{x:300,y:120,width:560,height:400}});
  console.log('cellSize='+cs+' ~'+dur+'ms');await page.close();
}
await browser.close();console.log('DONE');
