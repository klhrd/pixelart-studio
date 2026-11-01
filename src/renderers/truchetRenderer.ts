import type { Settings, TruchetResult } from '../types';

export function renderTruchet(
  ctx: CanvasRenderingContext2D,
  res: TruchetResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { cols, rows, rotation, luminance } = res;
  const cw = width / cols;
  const ch = height / rows;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = 'butt';

  const n = palette.length;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const l = luminance[i];
      if (l > settings.blankThreshold) continue;

      const s = Math.min(cw, ch);
      const cx = col * cw + cw / 2;
      const cy = row * ch + ch / 2;

      const t = 1 - l;
      const colorIdx = Math.min(n - 1, Math.round(t * (n - 1)));
      ctx.strokeStyle = palette[colorIdx];
      ctx.lineWidth = Math.max(
        1,
        s * settings.strokeWidth * (0.4 + 0.6 * t),
      );

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotation[i] * Math.PI) / 2);
      ctx.beginPath();
      ctx.arc(-s / 2, -s / 2, s / 2, 0, Math.PI / 2, false);
      ctx.arc(s / 2, s / 2, s / 2, Math.PI, (Math.PI * 3) / 2, false);
      ctx.stroke();
      ctx.restore();
    }
  }
}
