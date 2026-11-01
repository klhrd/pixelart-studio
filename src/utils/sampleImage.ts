import type { SourceImage } from '../types';

export function makeSampleImage(): SourceImage {
  const w = 960;
  const h = 640;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0b1020');
  sky.addColorStop(0.55, '#22304a');
  sky.addColorStop(0.75, '#7a5c3a');
  sky.addColorStop(1, '#10131c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 140; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h * 0.5;
    const r = Math.random() * 1.4 + 0.3;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.6})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const sunX = w * 0.68;
  const sunY = h * 0.42;
  const sun = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 130);
  sun.addColorStop(0, '#fff3c4');
  sun.addColorStop(0.55, '#f0a848');
  sun.addColorStop(1, 'rgba(240,140,60,0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 62, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1c2740';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  ctx.lineTo(w * 0.18, h * 0.5);
  ctx.lineTo(w * 0.34, h * 0.68);
  ctx.lineTo(w * 0.52, h * 0.44);
  ctx.lineTo(w * 0.7, h * 0.7);
  ctx.lineTo(w * 0.88, h * 0.55);
  ctx.lineTo(w, h * 0.72);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0d1424';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.lineTo(w * 0.22, h * 0.68);
  ctx.lineTo(w * 0.46, h * 0.84);
  ctx.lineTo(w * 0.72, h * 0.66);
  ctx.lineTo(w, h * 0.8);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const water = ctx.createLinearGradient(0, h * 0.8, 0, h);
  water.addColorStop(0, 'rgba(120,160,200,0.35)');
  water.addColorStop(1, 'rgba(10,14,26,0.9)');
  ctx.fillStyle = water;
  ctx.fillRect(0, h * 0.8, w, h * 0.2);

  const data = ctx.getImageData(0, 0, w, h);
  return { width: w, height: h, bytes: data.data };
}
