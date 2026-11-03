import type { Settings, VoronoiResult } from '../types';

export function renderVoronoi(
  ctx: CanvasRenderingContext2D,
  res: VoronoiResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, width, height);

  const { coords, starts, lengths, colors } = res;
  const count = starts.length;

  for (let p = 0; p < count; p++) {
    const start = starts[p];
    const len = lengths[p];
    if (len < 3) continue;

    ctx.beginPath();
    ctx.moveTo(coords[start * 2], coords[start * 2 + 1]);
    for (let v = 1; v < len; v++) {
      ctx.lineTo(coords[(start + v) * 2], coords[(start + v) * 2 + 1]);
    }
    ctx.closePath();

    const ci = p * 3;
    ctx.fillStyle = `rgb(${colors[ci]},${colors[ci + 1]},${colors[ci + 2]})`;
    ctx.fill();

    if (settings.edgeWidth > 0) {
      ctx.strokeStyle = palette[0];
      ctx.lineWidth = settings.edgeWidth;
      ctx.stroke();
    }
  }
}

export function renderVoronoiSVG(
  res: VoronoiResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { coords, starts, lengths, colors } = res;
  const count = starts.length;

  const parts: string[] = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${palette[0]}"/>`);

  for (let p = 0; p < count; p++) {
    const start = starts[p];
    const len = lengths[p];
    if (len < 3) continue;

    let d = `M ${coords[start * 2]} ${coords[start * 2 + 1]}`;
    for (let v = 1; v < len; v++) {
      d += ` L ${coords[(start + v) * 2]} ${coords[(start + v) * 2 + 1]}`;
    }
    d += ' Z';

    const ci = p * 3;
    const fillColor = `rgb(${colors[ci]},${colors[ci + 1]},${colors[ci + 2]})`;

    parts.push(`<path d="${d}" fill="${fillColor}"/>`);

    if (settings.edgeWidth > 0) {
      parts.push(
        `<path d="${d}" fill="none" stroke="${palette[0]}" stroke-width="${settings.edgeWidth}"/>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}
