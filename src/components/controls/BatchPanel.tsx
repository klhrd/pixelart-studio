import { useCallback, useRef, useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { paletteById } from '../../algorithms/palettes';
import { ENGINES, engineMeta } from '../../engines';
import { processBatch } from '../../utils/batch';
import type { BatchItem } from '../../utils/batch';
import type { ExportFormat } from '../../utils/exportImage';
import type { EngineId, EngineResult } from '../../types';

interface BatchPanelProps {
  scale: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  filenameBase: string;
  layers: ({ engine: EngineId; result: EngineResult } | null)[];
}

export function BatchPanel({
  scale,
  format,
  quality,
  transparent,
  filenameBase,
  layers,
}: BatchPanelProps) {
  const { engine, settings, allPalettes } = useSettings();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const resolvePalette = useCallback(
    (paletteId: string | undefined) =>
      paletteById(paletteId ?? settings.paletteId, allPalettes).colors,
    [allPalettes, settings.paletteId],
  );

  const running = progress !== null;
  const included = items.filter((item) => !item.skip).length;

  const updateItem = (index: number, patch: Partial<BatchItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const run = async () => {
    if (included === 0) return;
    setProgress({ done: 0, total: included });
    await processBatch(
      items,
      engine,
      settings,
      resolvePalette,
      { scale, format, quality, transparent, filenameBase, layers },
      (done, total) => setProgress({ done, total }),
    );
    setProgress(null);
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const list = e.target.files;
          if (list) setItems(Array.from(list).map((file) => ({ file })));
          e.target.value = '';
        }}
      />
      <button
        type="button"
        className="btn w-full justify-center"
        onClick={() => inputRef.current?.click()}
      >
        {t('Add images')}
      </button>

      {items.length === 0 ? (
        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t('No images selected')}
        </p>
      ) : (
        <>
          <p className="text-xs text-zinc-400">
            {t('{n} images', { n: included })}
          </p>
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/50 p-2">
            {items.map((item, i) => (
              <li key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <label className="flex shrink-0 items-center gap-1 text-[10px] text-zinc-400">
                    <input
                      type="checkbox"
                      checked={!item.skip}
                      onChange={(e) => updateItem(i, { skip: !e.target.checked })}
                      className="h-3.5 w-3.5 shrink-0 accent-emerald-500"
                    />
                    {t('Include')}
                  </label>
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-400">
                    {item.file.name}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <select
                    value={item.engine ?? ''}
                    disabled={item.skip}
                    aria-label={t('Override engine')}
                    onChange={(e) =>
                      updateItem(i, {
                        engine: e.target.value
                          ? (e.target.value as EngineId)
                          : undefined,
                      })
                    }
                    className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 disabled:opacity-40"
                  >
                    <option value="">{t('Use global')}</option>
                    {ENGINES.map((e) => (
                      <option key={e.id} value={e.id}>
                        {t(engineMeta(e.id).name)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={item.paletteId ?? ''}
                    disabled={item.skip}
                    aria-label={t('Override palette')}
                    onChange={(e) =>
                      updateItem(i, { paletteId: e.target.value || undefined })
                    }
                    className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 disabled:opacity-40"
                  >
                    <option value="">{t('Use global')}</option>
                    {allPalettes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        type="button"
        className="btn-primary w-full justify-center py-3"
        disabled={included === 0 || running}
        onClick={() => void run()}
      >
        {running
          ? `${t('Processing')} ${progress?.done}/${progress?.total}`
          : t('Process all')}
      </button>

      <p className="text-[11px] leading-relaxed text-zinc-500">
        {t('Applies the current engine, settings and palette to every image, then packages all results into a single ZIP file.')}
      </p>
    </div>
  );
}
