import { useI18n } from '../../i18n/core';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  display?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
}: SliderProps) {
  const { t } = useI18n();
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-zinc-400">{t(label)}</span>
        <span className="font-mono text-emerald-400">
          {display ?? value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
