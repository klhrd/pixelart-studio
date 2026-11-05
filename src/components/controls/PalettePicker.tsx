import { useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { Sheet } from '../layout/Sheet';
import type { Palette } from '../../algorithms/palettes';

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
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
  );
}

function ManagerRow({ p }: { p: Palette }) {
  const {
    settings,
    update,
    featured,
    movePalette,
    togglePaletteFeatured,
    deleteCustomPalette,
    setEditingPaletteId,
    setCustomSheetOpen,
  } = useSettings();
  const { t } = useI18n();
  const isCustom = p.id.startsWith('custom-');
  const starred = featured.includes(p.id);

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border p-2 ${
        settings.paletteId === p.id
          ? 'border-emerald-500/60 bg-emerald-500/10'
          : 'border-zinc-800 bg-zinc-950/50'
      }`}
    >
      <button
        type="button"
        onClick={() => update({ paletteId: p.id })}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <span className="flex h-4 w-14 shrink-0 overflow-hidden rounded-sm">
          {p.colors.map((c, i) => (
            <span key={i} className="flex-1" style={{ background: c }} />
          ))}
        </span>
        <span className="truncate font-mono text-[11px] text-zinc-300">
          {p.name}
        </span>
      </button>
      <button
        type="button"
        onClick={() => togglePaletteFeatured(p.id)}
        aria-label={starred ? t('Unstar palette') : t('Star palette')}
        disabled={isCustom}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition hover:bg-zinc-800 disabled:cursor-default disabled:opacity-70 ${
          starred ? 'text-amber-400' : 'text-zinc-600'
        }`}
      >
        <StarIcon filled={starred} />
      </button>
      <button
        type="button"
        onClick={() => movePalette(p.id, -1)}
        aria-label={t('Move up')}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => movePalette(p.id, 1)}
        aria-label={t('Move down')}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isCustom && (
        <>
          <button
            type="button"
            onClick={() => {
              setEditingPaletteId(p.id);
              setCustomSheetOpen(true);
            }}
            aria-label={t('Edit {name}', { name: p.name })}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-emerald-300"
          >
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => deleteCustomPalette(p.id)}
            aria-label={t('Delete {name}', { name: p.name })}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-red-300"
          >
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export function PalettePicker() {
  const {
    settings,
    update,
    allPalettes,
    featured,
    setCustomSheetOpen,
    setEditingPaletteId,
  } = useSettings();
  const { t } = useI18n();
  const [manageOpen, setManageOpen] = useState(false);

  const openNewCustom = () => {
    setEditingPaletteId(null);
    setCustomSheetOpen(true);
    setManageOpen(false);
  };

  const shown = allPalettes.filter((p) => featured.includes(p.id));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{t('Palette')}</span>
        <button
          type="button"
          onClick={() => setManageOpen(true)}
          className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition hover:text-emerald-300"
        >
          {t('Manage')}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {shown.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => update({ paletteId: p.id })}
            className={`rounded-lg border p-1.5 text-left transition ${
              settings.paletteId === p.id
                ? 'border-emerald-500/70 bg-emerald-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
            }`}
          >
            <span className="mb-1 block truncate font-mono text-[10px] text-zinc-400">
              {p.name}
            </span>
            <span className="flex h-3 overflow-hidden rounded-sm">
              {p.colors.map((c, i) => (
                <span
                  key={`${p.id}-${i}`}
                  className="flex-1"
                  style={{ background: c }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>

      <Sheet
        open={manageOpen}
        title={t('Palette Manager')}
        onClose={() => setManageOpen(false)}
      >
        <button
          type="button"
          onClick={openNewCustom}
          className="btn mb-2 w-full justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {t('New Custom Palette')}
        </button>
        <div className="space-y-1.5">
          {allPalettes.map((p) => (
            <ManagerRow key={p.id} p={p} />
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
          {t('Starred palettes appear in the quick picker. Use the arrows to reorder ??order is fully manual, nothing is sorted alphabetically.')}
        </p>
      </Sheet>
    </div>
  );
}
