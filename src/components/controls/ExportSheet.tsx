import { useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { buildShareHash } from '../../utils/shareLink';

interface ExportSheetProps {
  scale: number;
  onScale: (scale: number) => void;
  filename: string;
  onFilenameChange: (name: string) => void;
  onExport: () => void;
  onExportSvg: () => void;
  onUpload: () => void;
  disabled: boolean;
  outputWidth: number;
  outputHeight: number;
}

const SCALES = [1, 2, 3, 4];

export function ExportSheet({
  scale,
  onScale,
  filename,
  onFilenameChange,
  onExport,
  onExportSvg,
  onUpload,
  disabled,
  outputWidth,
  outputHeight,
}: ExportSheetProps) {
  const { engine, settings, customPalettes } = useSettings();
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [linkState, setLinkState] = useState<'idle' | 'copied' | 'shared'>(
    'idle',
  );

  const handleExport = () => {
    onExport();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportSvg = () => {
    onExportSvg();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = async () => {
    const custom = settings.paletteId.startsWith('custom-')
      ? customPalettes.find((p) => p.id === settings.paletteId)
      : null;
    const hash = buildShareHash(
      engine,
      settings,
      custom ? { name: custom.name, colors: custom.colors } : null,
    );
    const url = `${location.origin}${location.pathname}${location.search}${hash}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PixelCraft Studio', url });
        setLinkState('shared');
      } else {
        await navigator.clipboard.writeText(url);
        setLinkState('copied');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setLinkState('copied');
      } catch {
        return;
      }
    }
    setTimeout(() => setLinkState('idle'), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {t('Output')}
        </div>
        <div className="mt-1 font-mono text-lg text-zinc-100">
          {outputWidth} ? {outputHeight} px
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs text-zinc-400">
          {t('Resolution Scale')}
        </span>
        <div className="flex gap-1.5">
          {SCALES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onScale(s)}
              className={`flex-1 touch-manipulation select-none rounded-lg border py-2.5 font-mono text-sm transition active:scale-95 ${
                scale === s
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs text-zinc-400">{t('File Name')}</span>
        <input
          type="text"
          value={filename}
          maxLength={60}
          onChange={(e) => onFilenameChange(e.target.value)}
          placeholder="pixelcraft"
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
        />
      </label>

      <button
        type="button"
        className="btn-primary w-full justify-center py-3"
        disabled={disabled}
        onClick={handleExport}
      >
        {saved ? (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            {t('Saved')}
          </>
        ) : (
          t('Export PNG')
        )}
      </button>

      <button
        type="button"
        className="btn w-full justify-center py-3"
        disabled={disabled}
        onClick={handleExportSvg}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 19.5v-2a2 2 0 012-2h4a2 2 0 012 2v2M14 19.5v-2a2 2 0 012-2h4a2 2 0 012 2v2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 11a2 2 0 012-2h4a2 2 0 012 2v2M4 7a2 2 0 012-2h4a2 2 0 012 2v2"
          />
        </svg>
        {t('Export SVG')}
      </button>

      <div className="flex gap-1.5 border-t border-zinc-800 pt-3">
        <button
          type="button"
          className="btn flex-1 justify-center"
          onClick={onUpload}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7.5L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          {t('Upload')}
        </button>
        <button
          type="button"
          className="btn flex-1 justify-center"
          onClick={() => void handleShare()}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
            />
          </svg>
          {linkState === 'copied'
            ? t('Link Copied')
            : linkState === 'shared'
              ? t('Shared')
              : t('Share Link')}
        </button>
      </div>
      <p className="text-center text-[11px] leading-relaxed text-zinc-500">
        {t('Share Link packs every setting and the palette into the URL. The recipient opens it with any image to reproduce this exact look.')}
      </p>
      {disabled && (
        <p className="text-center text-[11px] text-zinc-500">
          {t('Load an image and wait for processing to finish.')}
        </p>
      )}
    </div>
  );
}
