import type { MoonResult, Settings } from '../types';

function drawMoonPhase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  f: number,
  rot: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const k = Math.cos(Math.PI * f);
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
  if (k >= 0) {
    ctx.ellipse(0, 0, Math.max(k * r, 0.001), r, 0, Math.PI / 2, -Math.PI / 2, true);
  } else {
    ctx.ellipse(0, 0, Math.max(-k * r, 0.001), r, 0, Math.PI / 2, (Math.PI * 3) / 2, false);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function blendAngle(base: number, target: number, t: number): number {
  if (t <= 0) return base;
  const bx = Math.cos(base);
  const by = Math.sin(base);
  const tx = Math.cos(target);
  const ty = Math.sin(target);
  return Math.atan2(by + (ty - by) * t, bx + (tx - bx) * t);
}

export function renderMoon(
  ctx: CanvasRenderingContext2D,
  res: MoonResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { cols, rows, phase, angle, magnitude } = res;
  const cw = width / cols;
  const ch = height / rows;
  const r = (Math.min(cw, ch) / 2) * 0.98;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = palette[palette.length - 1];

  const baseTilt = -Math.PI / 4;
  for (let row = 0; row < rows; row++) {
    const stagger =
      settings.staggered && row % 2 === 1 ? 0.5 : 0;
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      let f = phase[i] + settings.animOffset;
      f -= Math.floor(f);
      if (f <= 0.002) continue;

      const w = settings.edgeSensitivity * Math.min(1, magnitude[i] * 2.5);
      const rot = blendAngle(baseTilt, angle[i], w);

      const cx = ((col + 0.5 + stagger) * cw) % width;
      const cy = (row + 0.5) * ch;
      drawMoonPhase(ctx, cx, cy, r, f, rot);
    }
  }
}
