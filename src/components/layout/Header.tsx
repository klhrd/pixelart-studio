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
    <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
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
        <button type="button" className="btn" onClick={onUpload}>
          Upload
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={!canExport}
          onClick={onExport}
        >
          Export PNG
        </button>
      </div>
    </header>
  );
}
