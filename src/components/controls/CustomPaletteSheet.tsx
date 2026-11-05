import { useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import type { Palette } from '../../algorithms/palettes';

export function CustomPaletteSheet() {
  const {
    settings,
    update,
    allPalettes,
    customPalettes,
    editingPaletteId,
    saveCustomPalette,
    updateCustomPalette,
    deleteCustomPalette,
  } = useSettings();
  const { t } = useI18n();

  const editTarget = editingPaletteId
    ? customPalettes.find((p) => p.id === editingPaletteId)
    : null;
  const current = allPalettes.find((p) => p.id === settings.paletteId);
  const [colors, setColors] = useState<string[]>(
    () => editTarget?.colors ?? current?.colors ?? ['#0a0a0f', '#34d399', '#e8e8e8'],
  );
  const [name, setName] = useState(() => editTarget?.name ?? '');
  const [editingId, setEditingId] = useState<string | null>(
    () => editTarget?.id ?? null,
  );

  const setColor = (index: number, value: string) => {
    setColors((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const startEdit = (p: Palette) => {
    setEditingId(p.id);
    setColors([...p.colors]);
    setName(p.name);
  };

  const discardEdit = () => {
    setEditingId(null);
    setColors(current?.colors ?? ['#0a0a0f', '#34d399', '#e8e8e8']);
    setName('');
  };

  const handleSave = () => {
    if (editingId) updateCustomPalette(editingId, colors, name);
    else saveCustomPalette(colors, name);
  };

  return (
    <div className="space-y-4">
      <div className="flex h-6 overflow-hidden rounded-md border border-zinc-800">
        {colors.map((c, i) => (
          <span key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      {editingId && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
            {t('Editing existing palette')}
          </span>
          <button
            type="button"
            onClick={discardEdit}
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 transition hover:text-zinc-100"
          >
            {t('Discard')}
          </button>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs text-zinc-400">{t('Name')}</span>
        <input
          type="text"
          value={name}
          maxLength={16}
          placeholder={t('Custom palette')}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
        />
      </label>

      <div className="space-y-2">
        <span className="block text-xs text-zinc-400">{t('Color Stops')}</span>
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="color"
              value={c}
              onChange={(e) => setColor(i, e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-zinc-700 bg-zinc-900"
              aria-label={t('Color {n}', { n: i + 1 })}
            />
            <span className="flex-1 font-mono text-xs text-zinc-400">
              {c.toUpperCase()}
            </span>
            <button
              type="button"
              disabled={colors.length <= 2}
              onClick={() =>
                setColors((prev) => prev.filter((_, j) => j !== i))
              }
              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-400 transition hover:border-red-500/60 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={t('Remove color')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={colors.length >= 8}
          onClick={() =>
            setColors((prev) => [...prev, prev[prev.length - 1] ?? '#888888'])
          }
          className="btn w-full justify-center"
        >
          {t('Add Color')}
        </button>
      </div>

      <button
        type="button"
        className="btn-primary w-full justify-center py-2.5"
        onClick={handleSave}
      >
        {editingId ? t('Update Palette') : t('Save to History')}
      </button>

      {customPalettes.length > 0 && (
        <div className="space-y-1.5 border-t border-zinc-800 pt-3">
          <span className="block text-xs text-zinc-400">{t('History')}</span>
          {customPalettes.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 rounded-lg border p-2 ${
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
                <span className="flex h-4 w-16 shrink-0 overflow-hidden rounded-sm">
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
                onClick={() => startEdit(p)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-emerald-300"
                aria-label={t('Edit {name}', { name: p.name })}
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
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-red-300"
                aria-label={t('Delete {name}', { name: p.name })}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
