import { useSettings } from '../../store/settingsContext';

export function PalettePicker() {
  const { settings, update, allPalettes, setCustomSheetOpen } = useSettings();

  return (
    <div className="space-y-1.5">
      <span className="text-xs text-zinc-400">Palette</span>
      <div className="grid grid-cols-2 gap-1.5">
        {allPalettes.map((p) => (
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
                <span key={`${p.id}-${i}`} className="flex-1" style={{ background: c }} />
              ))}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomSheetOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-transparent p-1.5 text-left transition hover:border-emerald-500/60"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <span className="font-mono text-[10px] text-zinc-400">
            Custom…
          </span>
        </button>
      </div>
    </div>
  );
}
