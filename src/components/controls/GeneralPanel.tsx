import { useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { ENGINES, engineMeta } from '../../engines';
import type { EngineId } from '../../types';
import { clearBrushMask } from '../../renderers/brushMask';
import { BLEND_MODES } from '../../renderers/composite';
import { PanelSection } from './PanelSection';
import { Segmented } from './Segmented';
import { Slider } from './Slider';
import { Switch } from './Switch';

export function GeneralPanel() {
  const { settings, update, presets, savePreset, applyPreset, deletePreset } =
    useSettings();
  const { t } = useI18n();
  const [presetName, setPresetName] = useState('');

  return (
    <>
      <PanelSection title="Image Adjustments">
        <Slider
          label="Brightness"
          min={-100}
          max={100}
          value={settings.brightness}
          onChange={(v) => update({ brightness: v })}
        />
        <Slider
          label="Contrast"
          min={-100}
          max={100}
          value={settings.contrast}
          onChange={(v) => update({ contrast: v })}
        />
        <Slider
          label="Saturation"
          min={-100}
          max={100}
          value={settings.saturation}
          onChange={(v) => update({ saturation: v })}
        />
      </PanelSection>

      <PanelSection title="Mask">
        <Segmented
          value={settings.maskShape}
          onChange={(v) => update({ maskShape: v })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'ellipse', label: 'Ellipse' },
            { value: 'rect', label: 'Rect' },
            { value: 'linear', label: 'Linear' },
            { value: 'brush', label: 'Brush' },
          ]}
        />
        {settings.maskShape === 'brush' && (
          <>
            <Slider
              label="Brush size"
              min={0.02}
              max={0.3}
              step={0.01}
              value={settings.maskBrushSize}
              onChange={(v) => update({ maskBrushSize: v })}
              display={`${Math.round(settings.maskBrushSize * 100)}%`}
            />
            <Switch
              label="Erase"
              checked={settings.maskErase}
              onChange={(v) => update({ maskErase: v })}
            />
            <button
              type="button"
              className="btn w-full justify-center"
              onClick={() => clearBrushMask()}
            >
              {t('Clear mask')}
            </button>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              {t('Tap the brush button on the canvas, then drag on the image to paint where the effect applies.')}
            </p>
          </>
        )}
        {settings.maskShape !== 'none' && settings.maskShape !== 'brush' && (
          <>
            <Slider
              label="Mask X"
              min={0}
              max={1}
              step={0.02}
              value={settings.maskX}
              onChange={(v) => update({ maskX: v })}
              display={`${Math.round(settings.maskX * 100)}%`}
            />
            <Slider
              label="Mask Y"
              min={0}
              max={1}
              step={0.02}
              value={settings.maskY}
              onChange={(v) => update({ maskY: v })}
              display={`${Math.round(settings.maskY * 100)}%`}
            />
            <Slider
              label="Mask Size"
              min={0.05}
              max={1}
              step={0.02}
              value={settings.maskSize}
              onChange={(v) => update({ maskSize: v })}
              display={`${Math.round(settings.maskSize * 100)}%`}
            />
            <Slider
              label="Mask Feather"
              min={0}
              max={1}
              step={0.02}
              value={settings.maskFeather}
              onChange={(v) => update({ maskFeather: v })}
              display={`${Math.round(settings.maskFeather * 100)}%`}
            />
            <Switch
              label="Mask Invert"
              checked={settings.maskInvert}
              onChange={(v) => update({ maskInvert: v })}
            />
          </>
        )}
      </PanelSection>

      <PanelSection title="Blend">
        <span className="mb-1.5 block text-xs text-zinc-400">{t('Blend Mode')}</span>
        <div className="grid grid-cols-4 gap-1.5">
          {BLEND_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => update({ blendMode: m.value })}
              className={`rounded-lg border py-1.5 font-mono text-[10px] transition ${
                settings.blendMode === m.value
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {t(m.label)}
            </button>
          ))}
        </div>
        <Slider
          label="Blend Opacity"
          min={0}
          max={1}
          step={0.05}
          value={settings.blendOpacity}
          onChange={(v) => update({ blendOpacity: v })}
          display={`${Math.round(settings.blendOpacity * 100)}%`}
        />
        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t('Blends the styled layer over the original image.')}
        </p>
      </PanelSection>

      <PanelSection title="Layers">
        <label className="block text-xs text-zinc-400">
          <span className="mb-1.5 block">{t('Second layer')}</span>
          <select
            value={settings.layer2Engine}
            onChange={(e) =>
              update({ layer2Engine: e.target.value as EngineId | 'none' })
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
          >
            <option value="none">{t('None')}</option>
            {ENGINES.map((e) => (
              <option key={e.id} value={e.id}>
                {t(engineMeta(e.id).name)}
              </option>
            ))}
          </select>
        </label>

        {settings.layer2Engine !== 'none' && (
          <>
            <span className="mb-1.5 block text-xs text-zinc-400">
              {t('Blend Mode')}
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {BLEND_MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update({ layer2Blend: m.value })}
                  className={`rounded-lg border py-1.5 font-mono text-[10px] transition ${
                    settings.layer2Blend === m.value
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {t(m.label)}
                </button>
              ))}
            </div>
            <Slider
              label="Blend Opacity"
              min={0}
              max={1}
              step={0.05}
              value={settings.layer2Opacity}
              onChange={(v) => update({ layer2Opacity: v })}
              display={`${Math.round(settings.layer2Opacity * 100)}%`}
            />
          </>
        )}

        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t('Stacks a second engine result over the first.')}
        </p>
      </PanelSection>

      <PanelSection title="Presets">
        <div className="flex items-end gap-2">
          <label className="block flex-1 text-xs text-zinc-400">
            <span className="mb-1.5 block">{t('Preset name')}</span>
            <input
              type="text"
              value={presetName}
              maxLength={24}
              placeholder={t('Preset name')}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
            />
          </label>
          <button
            type="button"
            className="btn"
            onClick={() => {
              savePreset(presetName);
              setPresetName('');
            }}
          >
            {t('Save preset')}
          </button>
        </div>

        {presets.length === 0 ? (
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('No presets yet')}
          </p>
        ) : (
          <div className="space-y-1.5">
            {presets.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-2"
              >
                <button
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm text-zinc-200">
                    {p.name}
                  </span>
                  <span className="block truncate text-[11px] text-zinc-500">
                    {t(engineMeta(p.engine).name)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className="rounded-md border border-zinc-700 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                >
                  {t('Apply')}
                </button>
                <button
                  type="button"
                  onClick={() => deletePreset(p.id)}
                  aria-label={t('Delete')}
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
              </div>
            ))}
          </div>
        )}
      </PanelSection>
    </>
  );
}
