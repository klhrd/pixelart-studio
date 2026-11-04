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

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = palette[palette.length - 1];
  ctx.lineWidth = Math.max(1, spacing * 0.14);
  ctx.lineCap = 'round';

  for (let y0 = -amp; y0 < height + amp; y0 += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += 2) {
      const xi = Math.min(width - 1, x);
      const lum = colLum[xi] / 255;
      const y =
        y0 +
        Math.sin((x / wavelength) * Math.PI * 2 + lum * Math.PI * 0.5) *
          amp *
          lum;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
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

  const paths: string[] = [];
  for (let y0 = -amp; y0 < height + amp; y0 += spacing) {
    let d = '';
    for (let x = 0; x <= width; x += 2) {
      const xi = Math.min(width - 1, x);
      const lum = colLum[xi] / 255;
      const y =
        y0 +
        Math.sin((x / wavelength) * Math.PI * 2 + lum * Math.PI * 0.5) *
          amp *
          lum;
      d += `${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    paths.push(`<path d="${d}"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${palette[0]}"/><g fill="none" stroke="${palette[palette.length - 1]}" stroke-width="${Math.max(1, spacing * 0.14).toFixed(2)}" stroke-linecap="round">${paths.join('')}</g></svg>`;
}
