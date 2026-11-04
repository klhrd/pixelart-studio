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

export function renderWaveSVG(
  res: WaveResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { colLum } = res;
  const spacing = Math.max(4, settings.cellSize);
  const wavelength = Math.max(2, settings.waveFreq) * spacing * 0.5;
  const amp = settings.waveAmp * spacing;
  const n = palette.length;
  const segLen = 4;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  for (let y0 = -amp * 1.5; y0 < height + amp * 1.5; y0 += spacing) {
    let sum = 0;
    let samples = 0;
    for (let x = 0; x < width; x += 8) {
      sum += colLum[Math.min(width - 1, x)];
      samples++;
    }
    const avgL = samples > 0 ? sum / samples : 0;
    const colorIdx = Math.min(n - 1, Math.round((avgL / 255) * (n - 1)));

    let d = '';
    for (let x = 0; x <= width; x += segLen) {
      const xi = Math.min(width - 1, Math.max(0, Math.round(x)));
      const lum = colLum[xi] / 255;
      const y =
        y0 +
        Math.sin((x / wavelength) * Math.PI * 2 + lum * Math.PI) *
          amp *
          Math.pow(lum, 1.2);
      d += `${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    parts.push(
      `<path d="${d}" fill="none" stroke="${palette[colorIdx]}" stroke-width="1"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
