import { useState } from 'react';
import type { Settings } from '../../types';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { gestureItemValue } from '../../hooks/useGestureControls';
import type { GestureItem } from '../../hooks/useGestureControls';
import { GENERAL_GESTURE_ITEMS, ENGINE_GESTURE_ITEMS } from './gestureItems';

function itemsFor(engine: string): GestureItem[] {
  const engineItems = ENGINE_GESTURE_ITEMS[engine] ?? [];
  return [...GENERAL_GESTURE_ITEMS, ...engineItems];
}

function formatItem(item: GestureItem, settings: Settings, t: (k: string) => string): string {
  const value = gestureItemValue(item, settings);
  if (item.choices && item.choices.length) {
    const choice = item.choices[value] ?? item.choices[0];
    return t(choice.label);
  }
  if (item.toggle) return value ? t('On') : t('Off');
  const precision = item.step < 1 ? 2 : 0;
  return String(Number(value.toFixed(precision)));
}

export function ParameterBar() {
  const { engine, settings, update } = useSettings();
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const items = itemsFor(engine);
  const item = items[Math.min(index, items.length - 1)];
  if (!item) return null;

  const value = gestureItemValue(item, settings);

  const applyValue = (v: number) => {
    if (item.choices && item.choices.length) {
      const choice = item.choices[Math.max(0, Math.min(item.choices.length - 1, Math.round(v)))];
      update({ [item.key]: choice.value } as Partial<Settings>);
      return;
    }
    if (item.toggle) {
      update({ [item.key]: v >= 0.5 } as Partial<Settings>);
      return;
    }
    const stepped = Math.round(v / item.step) * item.step;
    const clamped = Math.min(item.max, Math.max(item.min, stepped));
    const precision = item.step < 1 ? 2 : 0;
    update({ [item.key]: Number(clamped.toFixed(precision)) } as Partial<Settings>);
  };

  const sliderMin = item.choices && item.choices.length ? 0 : item.min;
  const sliderMax = item.choices && item.choices.length ? item.choices.length - 1 : item.max;
  const sliderStep = item.toggle ? 1 : item.step;

  return (
    <div className="relative border-t border-zinc-800 bg-zinc-950/95 px-4 pb-2 pt-2.5">
      {pickerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70"
          onClick={() => setPickerOpen(false)}
          aria-hidden="true"
        >
          <div
            className="flex h-full flex-col justify-center overflow-y-auto py-6"
            role="listbox"
            aria-label={t('Parameters')}
          >
            {items.map((it, i) => {
              const selected = i === index;
              return (
                <button
                  key={`${it.key}-${i}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                    setPickerOpen(false);
                  }}
                  className={`flex items-center justify-between px-6 py-3 text-left transition ${
                    selected
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="text-lg">{t(it.label)}</span>
                  <span className="font-mono text-sm opacity-90">
                    {formatItem(it, settings, t)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex touch-manipulation select-none items-center gap-2 rounded-md px-1 py-1 text-sm text-zinc-200 transition hover:text-zinc-50"
          aria-label={t('Select parameter')}
          aria-expanded={pickerOpen}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-zinc-500"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
          </svg>
          {t(item.label)}
        </button>
        <span className="font-mono text-sm text-emerald-400">
          {formatItem(item, settings, t)}
        </span>
      </div>
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={value}
        onChange={(e) => applyValue(Number(e.target.value))}
        aria-label={t(item.label)}
      />
    </div>
  );
}
