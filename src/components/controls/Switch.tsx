interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between text-xs text-zinc-400"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full border transition ${
          checked
            ? 'border-emerald-400/60 bg-emerald-500/30'
            : 'border-zinc-700 bg-zinc-800'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
            checked
              ? 'left-4.5 bg-emerald-400'
              : 'left-0.5 bg-zinc-500'
          }`}
        />
      </span>
    </button>
  );
}
