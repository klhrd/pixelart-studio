import type { Settings, TuringResult } from '../types';

export function renderTuring(
  ctx: CanvasRenderingContext2D,
  res: TuringResult,
  _settings: Settings,
  _palette: string[],
  _width: number,
  _height: number,
): void {
  const img = new ImageData(res.bytes, res.width, res.height);
  ctx.putImageData(img, 0, 0);
}

export function renderTuringSVG(
  res: TuringResult,
  _settings: Settings,
  _palette: string[],
  width: number,
  height: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = res.width;
  canvas.height = res.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.putImageData(new ImageData(res.bytes, res.width, res.height), 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" width="${width}" height="${height}"/></svg>`;
}
