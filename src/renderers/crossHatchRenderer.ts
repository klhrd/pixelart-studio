import type { HatchResult, Settings } from '../types';

const ANGLES = [0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4];

function clipRay(
  px: number,
  py: number,
  dx: number,
  dy: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): [number, number, number, number] | null {
  let tmin = -Infinity;
  let tmax = Infinity;
  if (Math.abs(dx) < 1e-9) {
    if (px < minX || px > maxX) return null;
  } else {
    let t1 = (minX - px) / dx;
    let t2 = (maxX - px) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  if (Math.abs(dy) < 1e-9) {
    if (py < minY || py > maxY) return null;
  } else {
    let t1 = (minY - py) / dy;
    let t2 = (maxY - py) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  return [px + tmin * dx, py + tmin * dy, px + tmax * dx, py + tmax * dy];
}

interface CellHatch {
  layers: number;
  spacing: number;
}

function cellHatch(L: number, cell: number): CellHatch {
  if (L >= 0.9) return { layers: 0, spacing: cell };
  const layers = Math.max(1, Math.min(4, Math.ceil((1 - L) * 4)));
  const density = 1 - L;
  const spacing = Math.max(1.4, cell / (2 + density * 7));
  return { layers, spacing };
}

export function renderCrossHatch(
  ctx: CanvasRenderingContext2D,
  res: HatchResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  const { cols, rows, luminance } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);
  const halfDiag = Math.hypot(cw, ch) / 2;

  ctx.fillStyle = palette[palette.length - 1];
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = palette[0];
  ctx.lineCap = 'butt';
  ctx.lineWidth = Math.max(0.5, cell * 0.055);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const L = luminance[r * cols + c];
      const { layers, spacing } = cellHatch(L, cell);
      if (layers === 0) continue;
      const cx = c * cw + cw / 2;
      const cy = r * ch + ch / 2;
      const minX = c * cw;
      const minY = r * ch;
      const maxX = minX + cw;
      const maxY = minY + ch;
      ctx.beginPath();
      for (let k = 0; k < layers; k++) {
        const ang = ANGLES[k];
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        const nx = -dy;
        const ny = dx;
        for (let off = -halfDiag; off <= halfDiag; off += spacing) {
          const seg = clipRay(
            cx + nx * off,
            cy + ny * off,
            dx,
            dy,
            minX,
            minY,
            maxX,
            maxY,
          );
          if (!seg) continue;
          ctx.moveTo(seg[0], seg[1]);
          ctx.lineTo(seg[2], seg[3]);
        }
      }
      ctx.stroke();
    }
  }
}

export function renderCrossHatchSVG(
  res: HatchResult,
  _settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  const { cols, rows, luminance } = res;
  const cw = width / cols;
  const ch = height / rows;
  const cell = Math.min(cw, ch);
  const halfDiag = Math.hypot(cw, ch) / 2;

  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const L = luminance[r * cols + c];
      const { layers, spacing } = cellHatch(L, cell);
      if (layers === 0) continue;
      const cx = c * cw + cw / 2;
      const cy = r * ch + ch / 2;
      const minX = c * cw;
      const minY = r * ch;
      const maxX = minX + cw;
      const maxY = minY + ch;
      for (let k = 0; k < layers; k++) {
        const ang = ANGLES[k];
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        const nx = -dy;
        const ny = dx;
        for (let off = -halfDiag; off <= halfDiag; off += spacing) {
          const seg = clipRay(
            cx + nx * off,
            cy + ny * off,
            dx,
            dy,
            minX,
            minY,
            maxX,
            maxY,
          );
          if (!seg) continue;
          lines.push(
            `<line x1="${seg[0].toFixed(1)}" y1="${seg[1].toFixed(1)}" x2="${seg[2].toFixed(1)}" y2="${seg[3].toFixed(1)}"/>`,
          );
        }
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${palette[palette.length - 1]}"/><g stroke="${palette[0]}" stroke-width="${Math.max(0.5, cell * 0.055).toFixed(2)}">${lines.join('')}</g></svg>`;
}
