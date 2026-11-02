import type { Settings, WaveResult } from '../types';

export function renderWave(
  ctx: CanvasRenderingContext2D,
  res: WaveResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { colLum } = res;
  const spacing = Math.max(4, settings.cellSize);
  const wavelength = Math.max(2, settings.waveFreq) * spacing * 0.5;
  const amp = settings.waveAmp * spacing;
  const n = palette.length;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';

  for (let y0 = -amp; y0 < height + amp; y0 += spacing) {
    let sum = 0;
    for (let x = 0; x < width; x += 8) sum += colLum[x];
    const avgL = sum / Math.max(1, Math.ceil(width / 8));
    ctx.strokeStyle = palette[Math.min(n - 1, Math.round(avgL * (n - 1)))];

    ctx.beginPath();
    for (let x = 0; x <= width; x += 2) {
      const lum = colLum[Math.min(width - 1, x)] / 255;
      const y = y0 + Math.sin((x / wavelength) * Math.PI * 2) * amp * lum;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
