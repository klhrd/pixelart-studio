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
