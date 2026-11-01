import { ENGINES } from '../../engines';
import type { EngineId } from '../../types';
import { useSettings } from '../../store/settingsContext';

export function Sidebar() {
  const { engine, setEngine } = useSettings();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/40 md:flex">
      <div className="border-b border-zinc-800 p-5">
        <div className="font-mono text-lg font-bold tracking-tight text-zinc-100">
          Pixel<span className="text-emerald-400">Craft</span>
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Algorithm Styling Studio
        </p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ENGINES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEngine(e.id as EngineId)}
            className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
              engine === e.id
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-transparent hover:border-zinc-700 hover:bg-zinc-800/50'
            }`}
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                engine === e.id
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {e.code}
            </span>
            <span className="min-w-0">
              <span
                className={`block truncate text-sm font-medium ${
                  engine === e.id ? 'text-emerald-300' : 'text-zinc-200'
                }`}
              >
                {e.name}
              </span>
              <span className="block truncate text-[11px] text-zinc-500">
                {e.tagline}
              </span>
            </span>
          </button>
        ))}
      </nav>
      <div className="border-t border-zinc-800 p-4 font-mono text-[10px] text-zinc-600">
        100% client-side · offline ready
      </div>
    </aside>
  );
}

export function MobileEngineNav() {
  const { engine, setEngine } = useSettings();

  return (
    <nav className="flex gap-1.5 overflow-x-auto border-b border-zinc-800 bg-zinc-900/40 p-2 md:hidden">
      {ENGINES.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => setEngine(e.id as EngineId)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            engine === e.id
              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-700 text-zinc-400'
          }`}
        >
          <span className="font-mono font-bold">{e.code}</span>
          {e.name}
        </button>
      ))}
    </nav>
  );
}
