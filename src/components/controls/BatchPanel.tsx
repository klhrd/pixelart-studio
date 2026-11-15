import { useRef, useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { processBatch } from '../../utils/batch';
import type { ExportFormat } from '../../utils/exportImage';
import type { EngineId, EngineResult } from '../../types';

interface BatchPanelProps {
  scale: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  filenameBase: string;
  secondary: { engine: EngineId; result: EngineResult } | null;
}

export function BatchPanel({
  scale,
  format,
  quality,
  transparent,
  filenameBase,
  secondary,
}: BatchPanelProps) {
  const { engine, settings, palette } = useSettings();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const running = progress !== null;

  const run = async () => {
    if (files.length === 0) return;
    setProgress({ done: 0, total: files.length });
    await processBatch(
      files,
      engine,
      settings,
      palette,
      { scale, format, quality, transparent, filenameBase, secondary },
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
          if (list) setFiles(Array.from(list));
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

      {files.length === 0 ? (
        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t('No images selected')}
        </p>
      ) : (
        <>
          <p className="text-xs text-zinc-400">
            {t('{n} images', { n: files.length })}
          </p>
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/50 p-2">
            {files.map((f, i) => (
              <li key={i} className="truncate font-mono text-[11px] text-zinc-400">
                {f.name}
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        type="button"
        className="btn-primary w-full justify-center py-3"
        disabled={files.length === 0 || running}
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
