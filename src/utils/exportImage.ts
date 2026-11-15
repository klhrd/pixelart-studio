import type {
  EngineId,
  EngineResult,
  Settings,
  SourceImage,
} from '../types';
import { sourceToCanvas } from '../renderers/mask';
import { renderComposite } from '../renderers/composite';
import { GIFEncoder, applyPalette, quantize } from 'gifenc';

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
  layers?: ({ engine: EngineId; result: EngineResult } | null)[];
}

function renderToCanvas(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  scale: number,
  transparent: boolean,
  layers: ({ engine: EngineId; result: EngineResult } | null)[],
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width * scale;
  canvas.height = source.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  renderComposite(
    ctx,
    canvas.width,
    canvas.height,
    scale,
    sourceToCanvas(source.bytes, source.width, source.height),
    engine,
    result,
    settings,
    palette,
    source.width,
    source.height,
    layers,
  );
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

export interface RasterBlobOptions {
  scale: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  layers?: ({ engine: EngineId; result: EngineResult } | null)[];
}

export async function renderResultBlob(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  opts: RasterBlobOptions,
): Promise<Blob> {
  const transparent = opts.transparent && opts.format !== 'jpeg';
  const canvas = renderToCanvas(
    source,
    engine,
    result,
    settings,
    palette,
    opts.scale,
    transparent,
    opts.layers ?? [],
  );
  const quality =
    opts.format === 'png' ? undefined : Math.min(1, Math.max(0.1, opts.quality));
  return canvasToBlob(canvas, MIME[opts.format], quality);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportFileName(filename: string, format: ExportFormat): string {
  return `${safeBaseName(filename)}.${EXT[format]}`;
}

export async function exportRaster(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  opts: RasterExportOptions,
): Promise<void> {
  const blob = await renderResultBlob(
    source,
    engine,
    result,
    settings,
    palette,
    opts,
  );
  downloadBlob(blob, exportFileName(opts.filename, opts.format));
}

export interface AnimationExportOptions {
  scale: number;
  filename: string;
  frames: number;
  fps: number;
}

function renderAnimationFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  sourceCanvas: HTMLCanvasElement,
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  scale: number,
  animOffset: number,
  layers: ({ engine: EngineId; result: EngineResult } | null)[],
): void {
  const frameSettings: Settings = { ...settings, animOffset, animate: false };
  renderComposite(
    ctx,
    canvas.width,
    canvas.height,
    scale,
    sourceCanvas,
    engine,
    result,
    frameSettings,
    palette,
    source.width,
    source.height,
    layers,
  );
}

export function isAnimationExportSupported(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function'
  );
}

/**
 * Renders one full loop of the engine animation (animOffset 0 -> 1) into a
 * WebM video using the browser's MediaRecorder + canvas.captureStream (no deps).
 */
export async function exportAnimationWebM(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  opts: AnimationExportOptions,
): Promise<void> {
  if (!isAnimationExportSupported()) {
    throw new Error('Animation export is not supported in this browser');
  }
  const canvas = document.createElement('canvas');
  canvas.width = source.width * opts.scale;
  canvas.height = source.height * opts.scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const stream = canvas.captureStream(opts.fps);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 12_000_000,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });
  recorder.start();

  const sourceCanvas = sourceToCanvas(source.bytes, source.width, source.height);
  const frameDelay = 1000 / opts.fps;
  const frames = Math.max(2, opts.frames);
  for (let i = 0; i < frames; i++) {
    renderAnimationFrame(
      ctx,
      canvas,
      sourceCanvas,
      source,
      engine,
      result,
      settings,
      palette,
      opts.scale,
      i / frames,
      [],
    );
    await new Promise((r) => setTimeout(r, frameDelay));
  }

  recorder.stop();
  await stopped;
  stream.getTracks().forEach((t) => t.stop());

  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeBaseName(opts.filename)}.webm`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Renders one animation loop to an animated GIF (gifenc, no worker). */
export async function exportAnimationGif(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  opts: AnimationExportOptions,
): Promise<void> {
  const scale = opts.scale;
  const width = source.width * scale;
  const height = source.height * scale;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const sourceCanvas = sourceToCanvas(source.bytes, source.width, source.height);
  const frames = Math.max(2, opts.frames);
  const delay = Math.max(20, Math.round(1000 / opts.fps));
  const gif = GIFEncoder();
  let pal: number[][] | null = null;
  for (let i = 0; i < frames; i++) {
    renderAnimationFrame(
      ctx,
      canvas,
      sourceCanvas,
      source,
      engine,
      result,
      settings,
      palette,
      scale,
      i / frames,
      [],
    );
    const { data } = ctx.getImageData(0, 0, width, height);
    if (!pal) pal = quantize(data, 256, { format: 'rgb565' });
    const index = applyPalette(data, pal, 'rgb565');
    if (i === 0) gif.writeFrame(index, width, height, { palette: pal, delay });
    else gif.writeFrame(index, width, height, { delay });
  }
  gif.finish();
  const bytes = gif.bytes();
  downloadBlob(new Blob([bytes], { type: 'image/gif' }), `${safeBaseName(opts.filename)}.gif`);
}

export async function copyImageToClipboard(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  scale: number,
  transparent: boolean,
  layers: ({ engine: EngineId; result: EngineResult } | null)[],
): Promise<void> {
  const canvas = renderToCanvas(
    source,
    engine,
    result,
    settings,
    palette,
    scale,
    transparent,
    layers,
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
