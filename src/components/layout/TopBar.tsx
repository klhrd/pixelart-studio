import type { ProcessorStatus } from '../../types';

interface TopBarProps {
  status: ProcessorStatus;
  error: string | null;
}

export function TopBar({ status, error }: TopBarProps) {
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
    </header>
  );
}
