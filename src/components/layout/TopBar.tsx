import type { ProcessorStatus } from '../../types';
import { useSettings } from '../../store/settingsContext';

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
            Computing
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
          onClick={onCompare}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition active:scale-95 ${
            compare
              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          }`}
          aria-pressed={compare}
          aria-label="Toggle compare view"
          title="Compare (C)"
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
          aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title="Fullscreen (F)"
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
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
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
          aria-label="Redo"
          title="Redo (Ctrl+Y)"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            redo
          </span>
        </button>
      </div>
    </header>
  );
}
