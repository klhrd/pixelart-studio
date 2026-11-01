import type { ProcessorStatus } from '../../types';

interface HeaderProps {
  status: ProcessorStatus;
  error: string | null;
  canExport: boolean;
  exportScale: number;
  onExportScaleChange: (scale: number) => void;
  onUpload: () => void;
  onExport: () => void;
}

export function Header({
  status,
  error,
  canExport,
  exportScale,
  onExportScaleChange,
  onUpload,
  onExport,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-zinc-800 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="font-mono text-sm font-bold text-zinc-100 md:hidden">
          Pixel<span className="text-emerald-400">Craft</span>
        </div>
        {status === 'processing' && (
          <span className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Computing
          </span>
        )}
        {error && (
          <span className="truncate rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 font-mono text-[10px] text-red-300">
            {error}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <select
          value={exportScale}
          onChange={(e) => onExportScaleChange(Number(e.target.value))}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-300 outline-none focus:border-emerald-500"
          aria-label="Export scale"
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>
        <button type="button" className="btn" onClick={onUpload} aria-label="Upload image">
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
          <span className="hidden sm:inline">Upload</span>
        </button>
        <button
          type="button"
          className="btn-primary px-3 text-xs sm:text-sm"
          disabled={!canExport}
          onClick={onExport}
        >
          Export PNG
        </button>
      </div>
    </header>
  );
}
