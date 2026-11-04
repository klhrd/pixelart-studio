import type { BendayResult, Settings } from '../types';

const INKS = [
  { color: '#fff200', dots: 'y' },
  { color: '#00a3dd', dots: 'c' },
  { color: '#ec008c', dots: 'm' },
  { color: '#1a1a1a', dots: 'k' },
] as const;

export function renderBenday(
  ctx: CanvasRenderingContext2D,
  res: BendayResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  ctx.fillStyle = palette[palette.length - 1];
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  for (const ink of INKS) {
    const data = res[ink.dots];
    ctx.fillStyle = ink.color;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i + 2];
      if (r < 0.3) continue;
      ctx.beginPath();
      ctx.arc(data[i], data[i + 1], r, 0, Math.PI * 2, false);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function renderBendaySVG(
  res: BendayResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const parts: string[] = [];
  parts.push(
    `<rect width="${width}" height="${height}" fill="${palette[palette.length - 1]}"/>`,
  );
  for (const ink of INKS) {
    const data = res[ink.dots];
    const circles: string[] = [];
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i + 2];
      if (r < 0.3) continue;
      circles.push(
        `<circle cx="${data[i].toFixed(1)}" cy="${data[i + 1].toFixed(1)}" r="${r.toFixed(2)}"/>`,
      );
    }
    parts.push(
      `<g fill="${ink.color}" style="mix-blend-mode:multiply">${circles.join('')}</g>`,
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
