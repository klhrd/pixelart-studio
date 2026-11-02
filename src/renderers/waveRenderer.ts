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
  const segLen = 4;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = 'round';

  for (let y0 = -amp * 1.5; y0 < height + amp * 1.5; y0 += spacing) {
    let prevX: number | null = null;
    let prevY: number | null = null;
    for (let x = 0; x <= width; x += segLen) {
      const xi = Math.min(width - 1, Math.max(0, Math.round(x)));
      const lum = colLum[xi] / 255;
      const y =
        y0 +
        Math.sin((x / wavelength) * Math.PI * 2 + lum * Math.PI) *
          amp *
          Math.pow(lum, 1.2);
      if (prevX != null && prevY != null) {
        ctx.strokeStyle = palette[Math.min(n - 1, Math.round(lum * (n - 1)))];
        ctx.lineWidth = 0.6 + lum * 1.4;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      prevX = x;
      prevY = y;
    }
  }
}
