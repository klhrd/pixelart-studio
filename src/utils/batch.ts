import { zipSync } from 'fflate';
import type { EngineId, EngineResult, Settings } from '../types';
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
  layers?: ({ engine: EngineId; result: EngineResult } | null)[];
}

function safe(s: string, max: number): string {
  return s.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, max);
}

/**
 * Applies the current engine + settings + palette to every file, then packages
 * all results into a single ZIP download (no repeated download prompts).
 */
export async function processBatch(
  files: File[],
  engine: EngineId,
  settings: Settings,
  palette: string[],
  opts: BatchOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: number; failed: number; fileName: string | null }> {
  let ok = 0;
  let failed = 0;
  const total = files.length;
  const base = safe(opts.filenameBase, 40) || 'pixelcraft';
  const entries: Record<string, Uint8Array> = {};

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
        layers: opts.layers ?? [],
      });
      const src = safe(file.name.replace(/\.[^.]+$/, ''), 30);
      let name = exportFileName(
        `${base}-${String(i + 1).padStart(2, '0')}${src ? `-${src}` : ''}`,
        opts.format,
      );
      while (entries[name]) {
        name = name.replace(/(\.[^.]+)$/, `-${Math.random().toString(36).slice(2, 5)}$1`);
      }
      entries[name] = new Uint8Array(await blob.arrayBuffer());
      ok++;
    } catch (err) {
      console.warn('Batch item failed:', file.name, err);
      failed++;
    }
    onProgress?.(i + 1, total);
    // brief pause to keep the UI responsive between items
    await new Promise((r) => setTimeout(r, 0));
  }

  let fileName: string | null = null;
  if (ok > 0) {
    const zipped = zipSync(entries, { level: 0 });
    fileName = `${base}.zip`;
    downloadBlob(new Blob([zipped], { type: 'application/zip' }), fileName);
  }
  return { ok, failed, fileName };
}
