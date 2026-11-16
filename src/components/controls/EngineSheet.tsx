import { useState } from 'react';
import { ENGINES, ENGINE_CATEGORIES } from '../../engines';
import type { EngineMeta } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { EngineIcon } from '../icons/EngineIcon';
import type { EngineId } from '../../types';

type ViewMode = 'grid' | 'list';

const VIEW_KEY = 'pixelcraft-engine-view';

function loadView(): ViewMode {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

function saveView(mode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_KEY, mode);
  } catch {
    /* storage unavailable */
  }
}

interface StarToggleProps {
  favorite: boolean;
  onToggle: () => void;
}

function StarToggle({ favorite, onToggle }: StarToggleProps) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={t(favorite ? 'Remove from favorites' : 'Add to favorites')}
      className={`flex h-6 w-6 items-center justify-center rounded-md transition ${
        favorite
          ? 'text-amber-400 hover:text-amber-300'
          : 'text-zinc-600 hover:text-zinc-300'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={favorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    </button>
  );
}

interface EngineItemProps {
  engine: EngineMeta;
  active: boolean;
  favorite: boolean;
  onPick: () => void;
  onToggleFavorite: () => void;
}

function EngineTile({
  engine,
  active,
  favorite,
  onPick,
  onToggleFavorite,
}: EngineItemProps) {
  const { t } = useI18n();
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPick}
        className={`flex w-full touch-manipulation select-none flex-col items-center gap-2 rounded-xl border p-3 transition active:scale-[0.97] ${
          active
            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
            : 'border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-600'
        }`}
      >
        <EngineIcon
          id={engine.id}
          className={active ? 'h-7 w-7' : 'h-7 w-7 text-zinc-400'}
        />
        <span className="text-center text-[11px] font-medium leading-tight">
          {t(engine.name)}
        </span>
      </button>
      <div className="absolute right-1 top-1">
        <StarToggle favorite={favorite} onToggle={onToggleFavorite} />
      </div>
    </div>
  );
}

function EngineRow({
  engine,
  active,
  favorite,
  onPick,
  onToggleFavorite,
}: EngineItemProps) {
  const { t } = useI18n();
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPick}
        className={`flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border p-3 pr-12 text-left transition active:scale-[0.99] ${
          active
            ? 'border-emerald-500/60 bg-emerald-500/10'
            : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            active
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          <EngineIcon id={engine.id} className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-medium ${
              active ? 'text-emerald-300' : 'text-zinc-200'
            }`}
          >
            {t(engine.name)}
          </span>
          <span className="block truncate text-xs text-zinc-500">
            {t(engine.tagline)}
          </span>
        </span>
        {active && (
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
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <StarToggle favorite={favorite} onToggle={onToggleFavorite} />
      </div>
    </div>
  );
}

interface EngineSheetProps {
  onPick: (id: EngineId) => void;
}

export function EngineSheet({ onPick }: EngineSheetProps) {
  const { engine, favoriteEngines, toggleEngineFavorite } = useSettings();
  const { t } = useI18n();
  const [view, setView] = useState<ViewMode>(loadView);

  const switchView = (mode: ViewMode) => {
    setView(mode);
    saveView(mode);
  };

  const favoriteSet = new Set(favoriteEngines);
  const favorites = ENGINES.filter((e) => favoriteSet.has(e.id));
  const rest = ENGINES.filter((e) => !favoriteSet.has(e.id));
  const groups = ENGINE_CATEGORIES.map((category) => ({
    label: category,
    items: rest.filter((e) => e.category === category),
  })).filter((g) => g.items.length > 0);

  const renderGroup = (label: string, items: EngineMeta[]) => (
    <section key={label}>
      <div className="mb-2 mt-3 flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          {t(label)}
        </span>
        <span className="h-px flex-1 bg-zinc-800" />
      </div>
      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((e) => (
            <EngineTile
              key={e.id}
              engine={e}
              active={engine === e.id}
              favorite={favoriteSet.has(e.id)}
              onPick={() => onPick(e.id)}
              onToggleFavorite={() => toggleEngineFavorite(e.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((e) => (
            <EngineRow
              key={e.id}
              engine={e}
              active={engine === e.id}
              favorite={favoriteSet.has(e.id)}
              onPick={() => onPick(e.id)}
              onToggleFavorite={() => toggleEngineFavorite(e.id)}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <div className="flex rounded-lg border border-zinc-700 bg-zinc-950/60 p-0.5">
          <button
            type="button"
            onClick={() => switchView('grid')}
            aria-label={t('Grid view')}
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
            aria-label={t('List view')}
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

      {favorites.length > 0 && renderGroup('Favorites', favorites)}
      {groups.map((g) => renderGroup(g.label, g.items))}
    </div>
  );
}
