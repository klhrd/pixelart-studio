import { useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { buildShareHash } from '../../utils/shareLink';
import type { ExportFormat } from '../../utils/exportImage';
import type { EngineId, EngineResult } from '../../types';
import { Sheet } from '../layout/Sheet';
import { BatchPanel } from './BatchPanel';
import { Segmented } from './Segmented';
import { Slider } from './Slider';
import { Switch } from './Switch';

interface ExportSheetProps {
  scale: number;
  onScale: (scale: number) => void;
  sourceWidth: number;
  filename: string;
  onFilenameChange: (name: string) => void;
  format: ExportFormat;
  onFormat: (format: ExportFormat) => void;
  quality: number;
  onQuality: (quality: number) => void;
  transparent: boolean;
  onTransparent: (value: boolean) => void;
  onExport: () => void;
  onExportSvg: () => void;
  onCopy: () => void;
  onExportAnimation: () => void;
  onExportGif: () => void;
  animationSupported: boolean;
  onUpload: () => void;
  disabled: boolean;
  outputWidth: number;
  outputHeight: number;
  secondary: { engine: EngineId; result: EngineResult } | null;
}

const SCALES = [1, 2, 3, 4, 6, 8];
const MAX_SCALE = 16;
const TARGET_WIDTHS = [1080, 1920, 2560, 3840];

export function ExportSheet({
  scale,
  onScale,
  sourceWidth,
  filename,
  onFilenameChange,
  format,
  onFormat,
  quality,
  onQuality,
  transparent,
  onTransparent,
  onExport,
  onExportSvg,
  onCopy,
  onExportAnimation,
  onExportGif,
  animationSupported,
  onUpload,
  disabled,
  outputWidth,
  outputHeight,
  secondary,
}: ExportSheetProps) {
  const { engine, settings, customPalettes } = useSettings();
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [linkState, setLinkState] = useState<'idle' | 'copied' | 'shared'>(
    'idle',
  );

  const lossy = format === 'jpeg' || format === 'webp';
  const supportsAlpha = format !== 'jpeg';

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

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fitWidth = (target: number) => {
    if (sourceWidth <= 0) return;
    const s = Math.round((target / sourceWidth) * 100) / 100;
    onScale(Math.max(1, Math.min(MAX_SCALE, s)));
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
          {outputWidth} × {outputHeight} px
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs text-zinc-400">{t('Format')}</span>
        <Segmented
          value={format}
          onChange={(v) => onFormat(v as ExportFormat)}
          options={[
            { value: 'png', label: 'PNG' },
            { value: 'jpeg', label: 'JPEG' },
            { value: 'webp', label: 'WebP' },
          ]}
        />
        {lossy && (
          <div className="mt-2">
            <Slider
              label="Quality"
              min={0.5}
              max={1}
              step={0.01}
              value={quality}
              onChange={onQuality}
              display={`${Math.round(quality * 100)}%`}
            />
          </div>
        )}
        {supportsAlpha && (
          <div className="mt-2">
            <Switch
              label="Transparent background"
              checked={transparent}
              onChange={onTransparent}
            />
          </div>
        )}
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
        {sourceWidth > 0 && (
          <div className="mt-1.5 flex gap-1.5">
            {TARGET_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => fitWidth(w)}
                className="flex-1 touch-manipulation select-none rounded-lg border border-zinc-800 bg-zinc-950/50 py-2 font-mono text-[11px] text-zinc-400 transition hover:border-zinc-600 active:scale-95"
              >
                {w}w
              </button>
            ))}
          </div>
        )}
        <label className="mt-1.5 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2">
          <span className="text-xs text-zinc-400">{t('Custom scale')}</span>
          <span className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={MAX_SCALE}
              value={scale}
              onChange={(e) => {
                const v = Math.round(Number(e.target.value) || 1);
                onScale(Math.max(1, Math.min(MAX_SCALE, v)));
              }}
              className="w-12 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-center font-mono text-sm text-zinc-200 outline-none focus:border-emerald-500"
            />
            <span className="font-mono text-xs text-zinc-500">x</span>
          </span>
        </label>
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
          `${t('Export')} ${format.toUpperCase()}`
        )}
      </button>

      <div className="flex gap-1.5">
        <button
          type="button"
          className="btn flex-1 justify-center py-3"
          disabled={disabled}
          onClick={handleCopy}
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
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
            />
          </svg>
          {copied ? t('Copied') : t('Copy to clipboard')}
        </button>
        <button
          type="button"
          className="btn flex-1 justify-center py-3"
          disabled={disabled}
          onClick={handleExportSvg}
        >
          {t('Export SVG')}
        </button>
      </div>

      {engine === 'moon' && (
        <div className="flex gap-1.5">
          {animationSupported && (
            <button
              type="button"
              className="btn flex-1 justify-center py-3"
              disabled={disabled}
              onClick={onExportAnimation}
            >
              {t('Export animation (WebM)')}
            </button>
          )}
          <button
            type="button"
            className="btn flex-1 justify-center py-3"
            disabled={disabled}
            onClick={onExportGif}
          >
            {t('Export animation (GIF)')}
          </button>
        </div>
      )}

      <button
        type="button"
        className="btn w-full justify-center"
        onClick={() => setBatchOpen(true)}
      >
        {t('Batch images')}
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

      <Sheet open={batchOpen} title={t('Batch')} onClose={() => setBatchOpen(false)}>
        <BatchPanel
          scale={scale}
          format={format}
          quality={quality}
          transparent={transparent}
          filenameBase={filename}
          secondary={secondary}
        />
      </Sheet>
    </div>
  );
}
