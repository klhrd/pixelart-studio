import type { FlowResult, Settings } from '../types';

export function renderFlow(
  ctx: CanvasRenderingContext2D,
  res: FlowResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { coords, starts, lengths, shade } = res;
  const n = palette.length;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = 'round';

  for (let p = 0; p < starts.length; p++) {
    const start = starts[p];
    const len = lengths[p];
    if (len < 2) continue;

    const sh = shade[p];
    const colorIdx = Math.min(n - 1, Math.round(sh * (n - 1)));
    ctx.strokeStyle = palette[colorIdx];
    ctx.lineWidth = Math.max(
      0.5,
      settings.flowWidth * (0.5 + 0.9 * sh),
    );

    ctx.beginPath();
    ctx.moveTo(coords[start * 2], coords[start * 2 + 1]);
    for (let v = 1; v < len; v++) {
      ctx.lineTo(coords[(start + v) * 2], coords[(start + v) * 2 + 1]);
    }
    ctx.stroke();
  }
}
