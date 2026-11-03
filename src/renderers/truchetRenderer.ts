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

export function renderTruchetSVG(
  res: TruchetResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { cols, rows, rotation, luminance } = res;
  const cw = width / cols;
  const ch = height / rows;
  const n = palette.length;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

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
      const rot = rotation[i] * Math.PI / 2;

      // arc 1: center (-s/2,-s/2), radius s/2, angle 0 to PI/2
      const d1 = `M ${cx} ${cy - s / 2} A ${s / 2} ${s / 2} 0 0 1 ${cx - s / 2} ${cy}`;
      // arc 2: center (s/2,s/2), radius s/2, angle PI to 3PI/2
      const d2 = `M ${cx - s / 2} ${cy} A ${s / 2} ${s / 2} 0 0 1 ${cx} ${cy + s / 2}`;
      const d = d1 + ' ' + d2;

      parts.push(
        `<path d="${d}" transform="rotate(${rot * 180 / Math.PI} ${cx} ${cy})" fill="none" stroke="${palette[colorIdx]}" stroke-width="${Math.max(1, s * settings.strokeWidth * (0.4 + 0.6 * t))}" stroke-linecap="butt"/>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
