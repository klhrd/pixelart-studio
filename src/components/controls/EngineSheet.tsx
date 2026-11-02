import { useState } from 'react';
import { ENGINES } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import { EngineIcon } from '../icons/EngineIcon';
import type { EngineId } from '../../types';

type ViewMode = 'grid' | 'list';

const VIEW_KEY = 'pixelcraft-engine-view';

function loadView(): ViewMode {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list';
  } catch {
    return 'list';
  }
}

function saveView(mode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_KEY, mode);
  } catch {
    /* storage unavailable */
  }
}

interface EngineSheetProps {
  onPick: (id: EngineId) => void;
}

export function EngineSheet({ onPick }: EngineSheetProps) {
  const { engine } = useSettings();
  const [view, setView] = useState<ViewMode>(loadView);

  const switchView = (mode: ViewMode) => {
    setView(mode);
    saveView(mode);
  };

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <div className="flex rounded-lg border border-zinc-700 bg-zinc-950/60 p-0.5">
          <button
            type="button"
            onClick={() => switchView('grid')}
            aria-label="Grid view"
            className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
              view === 'grid'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => switchView('list')}
            aria-label="List view"
            className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
              view === 'list'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {ENGINES.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onPick(e.id)}
              className={`flex touch-manipulation select-none flex-col items-center gap-2 rounded-xl border p-3 transition active:scale-[0.97] ${
                engine === e.id
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <EngineIcon
                id={e.id}
                className={engine === e.id ? 'h-7 w-7' : 'h-7 w-7 text-zinc-400'}
              />
              <span className="text-center text-[11px] font-medium leading-tight">
                {e.name}
              </span>
            </button>
          ))}
        </div>
      ) : (
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
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  engine === e.id
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <EngineIcon id={e.id} className="h-5 w-5" />
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
                  Module {e.code} · {e.tagline}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
