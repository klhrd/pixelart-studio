import { PALETTES } from '../../algorithms/palettes';

interface PalettePickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function PalettePicker({ value, onChange }: PalettePickerProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-zinc-400">Palette</span>
      <div className="grid grid-cols-2 gap-1.5">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`rounded-lg border p-1.5 text-left transition ${
              value === p.id
                ? 'border-emerald-500/70 bg-emerald-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
            }`}
          >
            <span className="mb-1 block truncate font-mono text-[10px] text-zinc-400">
              {p.name}
            </span>
            <span className="flex h-3 overflow-hidden rounded-sm">
              {p.colors.map((c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
