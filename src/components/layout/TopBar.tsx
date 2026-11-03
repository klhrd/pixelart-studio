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

  useKeyboardShortcuts({
    c: onCompare,
    f: onFullscreen,
    z: undo,
    y: redo,
  });

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
          className={`rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1.5 font-mono text-[10px] transition active:scale-95 ${
            compare
              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
          aria-pressed={compare}
          title="Compare (C)"
        >
          A/B
        </button>
        <button
          type="button"
          onClick={onFullscreen}
          className={`rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1.5 font-mono text-[10px] transition active:scale-95 ${
            fullscreen
              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
          aria-pressed={fullscreen}
          title="Fullscreen (F)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7.5L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className={`rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1.5 font-mono text-[10px] transition active:scale-95 ${
            canUndo
              ? 'text-zinc-400 hover:border-zinc-600'
              : 'border-zinc-800 bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className={`rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1.5 font-mono text-[10px] transition active:scale-95 ${
            canRedo
              ? 'text-zinc-400 hover:border-zinc-600'
              : 'border-zinc-800 bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>
      </div>
    </header>
  );
}
