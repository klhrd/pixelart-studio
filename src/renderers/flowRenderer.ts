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

  const rot = settings.animOffset * Math.PI;
  const animate = rot !== 0;
  const cx = width / 2;
  const cy = height / 2;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

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
    if (animate) {
      const ox = coords[start * 2] - cx;
      const oy = coords[start * 2 + 1] - cy;
      ctx.moveTo(cx + ox * cos - oy * sin, cy + ox * sin + oy * cos);
      for (let v = 1; v < len; v++) {
        const px = coords[(start + v) * 2];
        const py = coords[(start + v) * 2 + 1];
        const rx = px - cx;
        const ry = py - cy;
        ctx.lineTo(cx + rx * cos - ry * sin, cy + rx * sin + ry * cos);
      }
    } else {
      ctx.moveTo(coords[start * 2], coords[start * 2 + 1]);
      for (let v = 1; v < len; v++) {
        ctx.lineTo(coords[(start + v) * 2], coords[(start + v) * 2 + 1]);
      }
    }
    ctx.stroke();
  }
}

export function renderFlowSVG(
  res: FlowResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { coords, starts, lengths, shade } = res;
  const n = palette.length;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  for (let p = 0; p < starts.length; p++) {
    const start = starts[p];
    const len = lengths[p];
    if (len < 2) continue;

    const sh = shade[p];
    const colorIdx = Math.min(n - 1, Math.round(sh * (n - 1)));

    let d = `M ${coords[start * 2]} ${coords[start * 2 + 1]}`;
    for (let v = 1; v < len; v++) {
      d += ` L ${coords[(start + v) * 2]} ${coords[(start + v) * 2 + 1]}`;
    }

    parts.push(
      `<path d="${d}" fill="none" stroke="${palette[colorIdx]}" stroke-width="${Math.max(0.5, settings.flowWidth * (0.5 + 0.9 * sh))}"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
