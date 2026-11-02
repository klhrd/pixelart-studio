import { useState } from 'react';
import { engineMeta } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import { EnginePanel } from './EnginePanel';
import { GeneralPanel } from './GeneralPanel';

type TuneView = 'menu' | 'general' | 'engine';

function SubHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex touch-manipulation select-none items-center gap-1.5 py-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-100"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      {title}
    </button>
  );
}

export function TuneSheet() {
  const [view, setView] = useState<TuneView>('menu');
  const { engine } = useSettings();
  const meta = engineMeta(engine);

  if (view === 'general') {
    return (
      <div className="space-y-3">
        <SubHeader title="General Adjustments" onBack={() => setView('menu')} />
        <GeneralPanel />
      </div>
    );
  }

  if (view === 'engine') {
    return (
      <div className="space-y-3">
        <SubHeader
          title={`${meta.code} · ${meta.name}`}
          onBack={() => setView('menu')}
        />
        <EnginePanel />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setView('general')}
        className="flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-left transition hover:border-zinc-600 active:scale-[0.99]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-zinc-100">
            General Adjustments
          </span>
          <span className="block truncate text-xs text-zinc-500">
            Brightness · Contrast · Saturation · Palette
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 shrink-0 text-zinc-600"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setView('engine')}
        className="flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-left transition hover:border-zinc-600 active:scale-[0.99]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9.375 17.25a.75.75 0 01-1.5 0l-.438-1.346a4.5 4.5 0 00-2.841-2.84L3.25 12.625a.75.75 0 010-1.5l1.346-.438a4.5 4.5 0 002.84-2.841l.439-1.346a.75.75 0 011.5 0l.437 1.346a4.5 4.5 0 002.842 2.84l1.345.438a.75.75 0 010 1.5l-1.345.438a4.5 4.5 0 00-2.842 2.84zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
            />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-zinc-100">
            Engine Settings
          </span>
              <span className="block truncate text-xs text-zinc-500">
                {meta.name}
              </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 shrink-0 text-zinc-600"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
