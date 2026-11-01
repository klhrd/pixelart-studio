import type { ProcessorStatus } from '../../types';

interface TopBarProps {
  status: ProcessorStatus;
  error: string | null;
  onUpload: () => void;
}

export function TopBar({ status, error, onUpload }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950/90 px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 font-mono text-sm font-bold text-zinc-100">
          Pixel<span className="text-emerald-400">Craft</span>
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
      <button
        type="button"
        className="btn px-2.5"
        onClick={onUpload}
        aria-label="Upload image"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7.5L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </button>
    </header>
  );
}
