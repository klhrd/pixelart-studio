import type { ContourResult, Settings } from '../types';

export function renderContour(
  ctx: CanvasRenderingContext2D,
  res: ContourResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const n = palette.length;
  const byLevel: number[][] = Array.from({ length: res.levels }, () => []);
  for (let i = 0; i < res.level.length; i++) {
    byLevel[res.level[i]].push(i * 4);
  }

  for (let li = 0; li < res.levels; li++) {
    const segIdx = byLevel[li];
    if (segIdx.length === 0) continue;
    const colorIdx = Math.min(n - 1, Math.round((li / (res.levels - 1)) * (n - 1)));
    ctx.strokeStyle = palette[colorIdx];
    ctx.lineWidth = li % 5 === 4 ? 1.8 : 1;
    ctx.beginPath();
    for (const base of segIdx) {
      ctx.moveTo(res.segs[base], res.segs[base + 1]);
      ctx.lineTo(res.segs[base + 2], res.segs[base + 3]);
    }
    ctx.stroke();
  }
}
