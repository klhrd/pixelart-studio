import type { EngineId, Settings } from '../types';
import { getClient } from '../workers/engineClient';
import { bitmapToSource } from './image';
import { downloadBlob, exportFileName, renderResultBlob } from './exportImage';
import type { ExportFormat } from './exportImage';

export interface BatchOptions {
  scale: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  filenameBase: string;
}

function safe(s: string, max: number): string {
  return s.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, max);
}

/**
 * Applies the current engine + settings + palette to every file and downloads
 * each result individually (no zip). Runs sequentially through the worker.
 */
export async function processBatch(
  files: File[],
  engine: EngineId,
  settings: Settings,
  palette: string[],
  opts: BatchOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: number; failed: number }> {
  let ok = 0;
  let failed = 0;
  const total = files.length;
  const base = safe(opts.filenameBase, 40) || 'pixelcraft';
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const bitmap = await createImageBitmap(file);
      const source = bitmapToSource(bitmap);
      bitmap.close();
      const result = await getClient(engine).run({
        width: source.width,
        height: source.height,
        bytes: source.bytes,
        settings,
        palette,
      });
      const blob = await renderResultBlob(source, engine, result, settings, palette, {
        scale: opts.scale,
        format: opts.format,
        quality: opts.quality,
        transparent: opts.transparent,
      });
      const src = safe(file.name.replace(/\.[^.]+$/, ''), 30);
      const name = `${base}-${String(i + 1).padStart(2, '0')}${src ? `-${src}` : ''}`;
      downloadBlob(blob, exportFileName(name, opts.format));
      ok++;
    } catch (err) {
      console.warn('Batch item failed:', file.name, err);
      failed++;
    }
    onProgress?.(i + 1, total);
    // brief pause so the browser can flush each download
    await new Promise((r) => setTimeout(r, 150));
  }
  return { ok, failed };
}
