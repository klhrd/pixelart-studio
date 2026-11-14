import type { Settings } from '../types';
import { getBrushMask } from './brushMask';

export function sourceToCanvas(
  bytes: Uint8ClampedArray,
  w: number,
  h: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')?.putImageData(new ImageData(bytes, w, h), 0, 0);
  return canvas;
}

function drawMaskShape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  s: Settings,
): void {
  const cx = s.maskX * width;
  const cy = s.maskY * height;
  const size = Math.min(1, Math.max(0.02, s.maskSize));
  const feather = Math.min(1, Math.max(0, s.maskFeather));

  if (s.maskShape === 'ellipse') {
    const r = size * Math.min(width, height) * 0.9 + 1;
    const inner = Math.max(0, r * (1 - feather));
    const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, r);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (s.maskShape === 'rect') {
    const w = size * width;
    const h = size * height;
    ctx.fillStyle = '#ffffff';
    if (feather > 0) {
      ctx.filter = `blur(${(feather * Math.min(w, h)) / 3}px)`;
    }
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.filter = 'none';
    return;
  }

  // linear: horizontal ramp centred at maskX, transition band = size * width
  const band = Math.max(1, size * width);
  const g = ctx.createLinearGradient(cx - band / 2, 0, cx + band / 2, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Composites the styled canvas with the original image according to the mask:
 * inside the mask the styled result is kept, outside the original shows through
 * (feathered edges blend smoothly). `source` may be any size; it is scaled.
 */
export function applyMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  source: HTMLCanvasElement,
  s: Settings,
): void {
  if (s.maskShape === 'none') return;

  const shape = document.createElement('canvas');
  shape.width = width;
  shape.height = height;
  const sctx = shape.getContext('2d');
  if (!sctx) return;
  if (s.maskShape === 'brush') {
    const brush = getBrushMask();
    if (!brush) return;
    sctx.drawImage(brush, 0, 0, width, height);
  } else {
    drawMaskShape(sctx, width, height, s);
  }

  let mask = shape;
  if (s.maskInvert) {
    const inv = document.createElement('canvas');
    inv.width = width;
    inv.height = height;
    const ictx = inv.getContext('2d');
    if (!ictx) return;
    ictx.fillStyle = '#ffffff';
    ictx.fillRect(0, 0, width, height);
    ictx.globalCompositeOperation = 'destination-out';
    ictx.drawImage(shape, 0, 0);
    mask = inv;
  }

  const orig = document.createElement('canvas');
  orig.width = width;
  orig.height = height;
  const octx = orig.getContext('2d');
  if (!octx) return;
  octx.drawImage(source, 0, 0, width, height);
  octx.globalCompositeOperation = 'destination-out';
  octx.drawImage(mask, 0, 0);

  ctx.drawImage(orig, 0, 0);
}
