import { ENGINES } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import type { EngineId } from '../../types';

interface EngineSheetProps {
  onPick: (id: EngineId) => void;
}

export function EngineSheet({ onPick }: EngineSheetProps) {
  const { engine } = useSettings();

  return (
    <div className="space-y-2">
      {ENGINES.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => onPick(e.id)}
          className={`flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border p-3 text-left transition active:scale-[0.99] ${
            engine === e.id
              ? 'border-emerald-500/60 bg-emerald-500/10'
              : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${
              engine === e.id
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {e.code}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-sm font-medium ${
                engine === e.id ? 'text-emerald-300' : 'text-zinc-200'
              }`}
            >
              {e.name}
            </span>
            <span className="block truncate text-xs text-zinc-500">
              {e.tagline}
            </span>
          </span>
          {engine === e.id && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-5 w-5 shrink-0 text-emerald-400"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
