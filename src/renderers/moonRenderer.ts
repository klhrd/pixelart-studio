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

function drawMoonPhaseSVG(
  cx: number,
  cy: number,
  r: number,
  f: number,
  rot: number,
): string {
  const k = Math.cos(Math.PI * f);
  // outer arc: right semicircle from top to bottom
  let d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`;
  if (k >= 0) {
    // crescent: inner arc from bottom to top via right side (counter-clockwise in SVG = sweep=0)
    d += ` A ${Math.max(k * r, 0.001)} ${r} 0 0 0 ${cx} ${cy - r}`;
  } else {
    // gibbous: inner arc from bottom to top via left side (clockwise = sweep=1)
    d += ` A ${Math.max(-k * r, 0.001)} ${r} 0 0 1 ${cx} ${cy - r}`;
  }
  return `<path d="${d}" transform="rotate(${rot * 180 / Math.PI} ${cx} ${cy})" />`;
}

export function renderMoonSVG(
  res: MoonResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { cols, rows, phase, angle, magnitude } = res;
  const cw = width / cols;
  const ch = height / rows;
  const r = (Math.min(cw, ch) / 2) * 0.98;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  const baseTilt = -Math.PI / 4;
  for (let row = 0; row < rows; row++) {
    const staggered =
      settings.staggered && row % 2 === 1 ? 0.5 : 0;
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      let f = phase[i] + settings.animOffset;
      f -= Math.floor(f);
      if (f <= 0.002) continue;

      const w = settings.edgeSensitivity * Math.min(1, magnitude[i] * 2.5);
      const rot = blendAngle(baseTilt, angle[i], w);
      const cx = ((col + 0.5 + staggered) * cw) % width;
      const cy = (row + 0.5) * ch;

      parts.push(
        drawMoonPhaseSVG(cx, cy, r, f, rot).replace(
          '/>',
          ` fill="${palette[palette.length - 1]}"/>`,
        ),
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
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
    const staggered =
      settings.staggered && row % 2 === 1 ? 0.5 : 0;
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      let f = phase[i] + settings.animOffset;
      f -= Math.floor(f);
      if (f <= 0.002) continue;

      const w = settings.edgeSensitivity * Math.min(1, magnitude[i] * 2.5);
      const rot = blendAngle(baseTilt, angle[i], w);

      const cx = ((col + 0.5 + staggered) * cw) % width;
      const cy = (row + 0.5) * ch;
      drawMoonPhase(ctx, cx, cy, r, f, rot);
    }
  }
}
