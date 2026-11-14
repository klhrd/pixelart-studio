import type {
  EngineId,
  EngineResult,
  Settings,
  SourceImage,
} from '../types';
import { renderResult } from '../renderers';
import { applyMask, sourceToCanvas } from '../renderers/mask';

export type ExportFormat = 'png' | 'jpeg' | 'webp';

const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const EXT: Record<ExportFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
};

export interface RasterExportOptions {
  scale: number;
  filename: string;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
}

function renderToCanvas(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  scale: number,
  transparent: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width * scale;
  canvas.height = source.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.scale(scale, scale);
  renderResult(engine, ctx, result, settings, palette, source.width, source.height);
  if (settings.maskShape !== 'none') {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    applyMask(
      ctx,
      canvas.width,
      canvas.height,
      sourceToCanvas(source.bytes, source.width, source.height),
      settings,
    );
  }
  if (transparent) chromaKeyBackground(canvas, palette[0]);
  return canvas;
}

/** Turns pixels matching the background colour into transparent ones. */
function chromaKeyBackground(canvas: HTMLCanvasElement, bg: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(bg.trim());
  if (!m) return;
  const br = parseInt(m[1], 16);
  const bgc = parseInt(m[2], 16);
  const bb = parseInt(m[3], 16);
  const tol = 8;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (
      Math.abs(d[i] - br) <= tol &&
      Math.abs(d[i + 1] - bgc) <= tol &&
      Math.abs(d[i + 2] - bb) <= tol
    ) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
      mime,
      quality,
    );
  });
}

function safeBaseName(filename: string): string {
  return (
    filename
      .trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .slice(0, 60) || 'pixelcraft'
  );
}

export async function exportRaster(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  opts: RasterExportOptions,
): Promise<void> {
  const transparent = opts.transparent && opts.format !== 'jpeg';
  const canvas = renderToCanvas(
    source,
    engine,
    result,
    settings,
    palette,
    opts.scale,
    transparent,
  );
  const quality =
    opts.format === 'png' ? undefined : Math.min(1, Math.max(0.1, opts.quality));
  const blob = await canvasToBlob(canvas, MIME[opts.format], quality);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeBaseName(opts.filename)}.${EXT[opts.format]}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyImageToClipboard(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  scale: number,
  transparent: boolean,
): Promise<void> {
  const canvas = renderToCanvas(
    source,
    engine,
    result,
    settings,
    palette,
    scale,
    transparent,
  );
  const blob = await canvasToBlob(canvas, 'image/png');
  const ClipboardItemCtor = (
    window as unknown as { ClipboardItem?: typeof ClipboardItem }
  ).ClipboardItem;
  if (!navigator.clipboard?.write || !ClipboardItemCtor) {
    throw new Error('Clipboard not supported');
  }
  await navigator.clipboard.write([new ClipboardItemCtor({ 'image/png': blob })]);
}
