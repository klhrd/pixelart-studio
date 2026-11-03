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
    ctx.lineWidth = li % 5 === 4 ? 2.2 : 1.4;
    ctx.beginPath();
      for (const base of segIdx) {
        const x1 = res.segs[base];
        const y1 = res.segs[base + 1];
        const x2 = res.segs[base + 2];
        const y2 = res.segs[base + 3];
        if (
          !isFinite(x1) ||
          !isFinite(y1) ||
          !isFinite(x2) ||
          !isFinite(y2) ||
          x1 < 0 ||
          x1 > width ||
          x2 < 0 ||
          x2 > width ||
          y1 < 0 ||
          y1 > height ||
          y2 < 0 ||
          y2 > height
        ) continue;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
    ctx.stroke();
  }
}

export function renderContourSVG(
  res: ContourResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { segs, level, levels } = res;
  const n = palette.length;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  const byLevel: number[][] = Array.from({ length: levels }, () => []);
  for (let i = 0; i < level.length; i++) {
    byLevel[level[i]].push(i * 4);
  }

  for (let li = 0; li < levels; li++) {
    const segIdx = byLevel[li];
    if (segIdx.length === 0) continue;
    const colorIdx = Math.min(n - 1, Math.round((li / (levels - 1)) * (n - 1)));

    for (const base of segIdx) {
      parts.push(
        `<path d="M ${segs[base]} ${segs[base + 1]} L ${segs[base + 2]} ${segs[base + 3]}" fill="none" stroke="${palette[colorIdx]}" stroke-width="${li % 5 === 4 ? 2.2 : 1.4}"/>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
