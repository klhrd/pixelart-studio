import type { ProcessorStatus } from '../../types';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';

interface TopBarProps {
  status: ProcessorStatus;
  error: string | null;
  compare: boolean;
  fullscreen: boolean;
  onCompare: () => void;
  onFullscreen: () => void;
}

export function TopBar({
  status,
  error,
  compare,
  fullscreen,
  onCompare,
  onFullscreen,
}: TopBarProps) {
  const { undo, redo, canUndo, canRedo } = useSettings();
  const { t, lang, toggle } = useI18n();

  return (
    <header className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950/90 px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 font-mono text-sm font-bold text-zinc-100">
          Pixel<span className="text-emerald-400">Craft</span>
        </span>
        <span className="shrink-0 font-mono text-[10px] text-zinc-600">
          v{__APP_VERSION__}
        </span>
        {status === 'processing' && (
          <span className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {t('Computing')}
          </span>
        )}
        {error && (
          <span className="truncate rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] text-red-300">
            {error}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggle}
          className="flex h-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/80 px-2 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 active:scale-95"
          aria-label={t('Language')}
          title={t('Language')}
        >
          <span className="material-symbols-rounded mr-1 text-[16px]" aria-hidden="true">
            translate
          </span>
          <span className="font-mono text-[11px] font-semibold">
            {lang === 'en' ? 'EN' : '中'}
          </span>
        </button>
        <button
          type="button"
          onClick={onCompare}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition active:scale-95 ${
            compare
              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          }`}
          aria-pressed={compare}
          aria-label={t('Toggle compare view')}
          title={t('Compare (C)')}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            compare
          </span>
        </button>
        <button
          type="button"
          onClick={onFullscreen}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition active:scale-95 ${
            fullscreen
              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          }`}
          aria-pressed={fullscreen}
          aria-label={fullscreen ? t('Exit fullscreen') : t('Enter fullscreen')}
          title={t('Fullscreen (F)')}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            {fullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition active:scale-95 ${
            canUndo
              ? 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              : 'cursor-not-allowed border-zinc-800 bg-zinc-800/50 text-zinc-600'
          }`}
          aria-label={t('Undo')}
          title={t('Undo (Ctrl+Z)')}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            undo
          </span>
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition active:scale-95 ${
            canRedo
              ? 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              : 'cursor-not-allowed border-zinc-800 bg-zinc-800/50 text-zinc-600'
          }`}
          aria-label={t('Redo')}
          title={t('Redo (Ctrl+Y)')}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            redo
          </span>
        </button>
      </div>
    </header>
  );
}
