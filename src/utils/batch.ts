import { zipSync } from 'fflate';
import type { EngineId, EngineResult, Settings } from '../types';
import { getClient } from '../workers/engineClient';
import { bitmapToSource } from './image';
import { downloadBlob, renderResultBlob } from './exportImage';
import type { ExportFormat } from './exportImage';
import { EXT } from './exportImage';

export type BatchFolderStructure = 'flat' | 'per-image' | 'by-engine' | 'by-date';

export interface BatchOptions {
  scale: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  filenameBase: string;
  folderStructure: BatchFolderStructure;
  nameTemplate: string;
  layers?: ({ engine: EngineId; result: EngineResult } | null)[];
}

export interface BatchItem {
  file: File;
  skip?: boolean;
  engine?: EngineId;
  paletteId?: string;
}

function safe(s: string, max: number): string {
  return s.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, max);
}

const BATCH_DATE = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

export function renderTemplate(
  template: string,
  ctx: {
    engine: string;
    name: string;
    date: string;
    index: number;
    ext: string;
    scale: number;
  },
): string {
  return template
    .replace(/\{engine\}/g, ctx.engine)
    .replace(/\{name\}/g, ctx.name)
    .replace(/\{date\}/g, ctx.date)
    .replace(/\{index\}/g, String(ctx.index).padStart(2, '0'))
    .replace(/\{ext\}/g, ctx.ext)
    .replace(/\{scale\}/g, String(ctx.scale));
}

export function folderPrefix(
  structure: BatchFolderStructure,
  ctx: { engine: string; name: string; date: string },
): string {
  switch (structure) {
    case 'per-image':
      return `${safe(ctx.name, 40)}/`;
    case 'by-engine':
      return `${safe(ctx.engine, 40)}/`;
    case 'by-date':
      return `${ctx.date}/`;
    default:
      return '';
  }
}

/**
 * Applies the current engine + settings + palette to every file, then packages
 * all results into a single ZIP download (no repeated download prompts).
 */
export async function processBatch(
  items: BatchItem[],
  engine: EngineId,
  settings: Settings,
  resolvePalette: (paletteId: string | undefined) => string[],
  opts: BatchOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: number; failed: number; fileName: string | null }> {
  let ok = 0;
  let failed = 0;
  let done = 0;
  const total = items.reduce((n, item) => (item.skip ? n : n + 1), 0);
  const base = safe(opts.filenameBase, 40) || 'pixelcraft';
  const ext = EXT[opts.format];
  const entries: Record<string, Uint8Array> = {};
  let itemIndex = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.skip) continue;
    const file = item.file;
    const effEngine = item.engine ?? engine;
    const effPalette = resolvePalette(item.paletteId);
    try {
      const bitmap = await createImageBitmap(file);
      const source = bitmapToSource(bitmap);
      bitmap.close();
      const result = await getClient(effEngine).run({
        width: source.width,
        height: source.height,
        bytes: source.bytes,
        settings,
        palette: effPalette,
      });
      const blob = await renderResultBlob(source, effEngine, result, settings, effPalette, {
        scale: opts.scale,
        format: opts.format,
        quality: opts.quality,
        transparent: opts.transparent,
        layers: opts.layers ?? [],
      });
      const src = safe(file.name.replace(/\.[^.]+$/, ''), 30);
      const fileExt = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1) : '';
      const rendered = renderTemplate(opts.nameTemplate, {
        engine: effEngine,
        name: src,
        date: BATCH_DATE,
        index: itemIndex + 1,
        ext: fileExt,
        scale: opts.scale,
      });
      const name = safe(rendered, 60) || `${base}-${String(itemIndex + 1).padStart(2, '0')}`;
      const prefix = folderPrefix(opts.folderStructure, {
        engine: effEngine,
        name: src,
        date: BATCH_DATE,
      });
      let entryName = `${prefix}${name}.${ext}`;
      while (entries[entryName]) {
        entryName = entryName.replace(/(\.[^.]+)$/, `-${Math.random().toString(36).slice(2, 5)}$1`);
      }
      entries[entryName] = new Uint8Array(await blob.arrayBuffer());
      ok++;
    } catch (err) {
      console.warn('Batch item failed:', file.name, err);
      failed++;
    }
    itemIndex++;
    done++;
    onProgress?.(done, total);
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
