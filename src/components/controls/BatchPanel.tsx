import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { paletteById } from '../../algorithms/palettes';
import { ENGINES, engineMeta } from '../../engines';
import { processBatch } from '../../utils/batch';
import type { BatchFolderStructure, BatchItem } from '../../utils/batch';
import type { ExportFormat } from '../../utils/exportImage';
import type { EngineId, EngineResult } from '../../types';
import { Segmented } from './Segmented';

interface BatchPanelProps {
  scale: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  filenameBase: string;
  layers: ({ engine: EngineId; result: EngineResult } | null)[];
}

const TEMPLATE_STORAGE_KEY = 'pixelcraft-batch-template';
const FOLDER_STORAGE_KEY = 'pixelcraft-batch-folder';
const DEFAULT_TEMPLATE = '{name}-{engine}-{index}';

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
  const [folderStructure, setFolderStructure] = useState<BatchFolderStructure>(
    'flat',
  );
  const [nameTemplate, setNameTemplate] = useState(DEFAULT_TEMPLATE);
  const [batchFormat, setBatchFormat] = useState<ExportFormat>(format);

  useEffect(() => {
    try {
      const tpl = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (tpl) setNameTemplate(tpl);
      const fld = localStorage.getItem(FOLDER_STORAGE_KEY);
      if (fld && ['flat', 'per-image', 'by-engine', 'by-date'].includes(fld))
        setFolderStructure(fld as BatchFolderStructure);
      const bf = localStorage.getItem('pixelcraft-batch-format');
      if (bf && ['png', 'jpeg', 'webp', 'svg'].includes(bf))
        setBatchFormat(bf as ExportFormat);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const persist = () => {
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, nameTemplate);
      localStorage.setItem(FOLDER_STORAGE_KEY, folderStructure);
      localStorage.setItem('pixelcraft-batch-format', batchFormat);
    } catch {
      /* storage unavailable */
    }
  };

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
    persist();
    setProgress({ done: 0, total: included });
    await processBatch(
      items,
      engine,
      settings,
      resolvePalette,
      { scale, format: batchFormat, quality, transparent, filenameBase, folderStructure, nameTemplate, layers },
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

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-3">
        <span className="block text-xs text-zinc-400">{t('Format')}</span>
        <Segmented
          value={batchFormat}
          onChange={(v) => setBatchFormat(v as ExportFormat)}
          options={[
            { value: 'png', label: t('PNG') },
            { value: 'jpeg', label: t('JPEG') },
            { value: 'webp', label: t('WebP') },
            { value: 'svg', label: t('SVG') },
          ]}
        />
        <span className="block text-xs text-zinc-400">
          {t('Folder Structure')}
        </span>
        <Segmented
          value={folderStructure}
          onChange={(v) => setFolderStructure(v as BatchFolderStructure)}
          options={[
            { value: 'flat', label: t('Flat') },
            { value: 'per-image', label: t('Per Image') },
            { value: 'by-engine', label: t('By Engine') },
            { value: 'by-date', label: t('By Date') },
          ]}
        />
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-400">
            {t('Naming Template')}
          </span>
          <input
            type="text"
            value={nameTemplate}
            onChange={(e) => setNameTemplate(e.target.value)}
            placeholder={DEFAULT_TEMPLATE}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm font-mono text-zinc-200 outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-zinc-500 mt-1">
            {t('Tokens: {engine}, {name}, {date}, {index}, {ext}, {scale}')}
          </p>
        </label>
      </div>

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
