import { useRef, useState } from 'react';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { ENGINES, engineMeta } from '../../engines';
import type { EffectLayer, EffectLayerParams, EngineId } from '../../types';
import { clearBrushMask } from '../../renderers/brushMask';
import {
  clearOverlayImage,
  loadOverlayImageFromDataUrl,
  saveOverlayImageDataUrl,
} from '../../renderers/overlayImage';
import { BLEND_MODES } from '../../renderers/composite';
import { PanelSection } from './PanelSection';
import { Segmented } from './Segmented';
import { Slider } from './Slider';
import { Switch } from './Switch';

export function GeneralPanel() {
  const {
    settings,
    update,
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    snapshots,
    applySnapshot,
    clearSnapshots,
    allPalettes,
  } = useSettings();
  const { t } = useI18n();
  const [presetName, setPresetName] = useState('');
  const stickerInputRef = useRef<HTMLInputElement>(null);

  const updateLayer = (index: number, patch: Partial<EffectLayer>) => {
    update({
      layers: settings.layers.map((l, idx) =>
        idx === index ? { ...l, ...patch } : l,
      ),
    });
  };

  const setLayerParam = (
    index: number,
    field: keyof EffectLayerParams,
    value: string | number | undefined,
  ) => {
    update({
      layers: settings.layers.map((l, idx) => {
        if (idx !== index) return l;
        const params: Record<string, unknown> = { ...(l.params ?? {}) };
        if (value === undefined) delete params[field];
        else params[field] = value;
        return { ...l, params: params as EffectLayerParams };
      }),
    });
  };

  const moveLayer = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= settings.layers.length) return;
    const next = [...settings.layers];
    [next[index], next[target]] = [next[target], next[index]];
    update({ layers: next });
  };

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

      <PanelSection title="Animation">
        <Switch
          label="Animate Phase"
          checked={settings.animate}
          onChange={(v) => update({ animate: v })}
        />
        {settings.animate && (
          <Slider
            label="Animation Speed"
            min={0.05}
            max={1}
            step={0.05}
            value={settings.animSpeed}
            onChange={(v) => update({ animSpeed: v })}
            display={`${settings.animSpeed.toFixed(2)}x`}
          />
        )}
        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t('Animates the current engine when it supports motion (Moon Phase, Wave, Moiré, Truchet).')}
        </p>
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

      <PanelSection title="Overlay layer">
        <Segmented
          value={settings.overlayType}
          onChange={(v) => update({ overlayType: v })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'text', label: 'Text' },
            { value: 'sticker', label: 'Sticker' },
          ]}
        />
        {settings.overlayType === 'text' && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-xs text-zinc-400">
                {t('Text')}
              </span>
              <input
                type="text"
                value={settings.overlayText}
                placeholder={t('Text')}
                onChange={(e) => update({ overlayText: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-zinc-400">
              <span>{t('Color')}</span>
              <input
                type="color"
                value={settings.overlayColor}
                aria-label={t('Color')}
                onChange={(e) => update({ overlayColor: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded-md border border-zinc-700 bg-zinc-900"
              />
            </label>
          </>
        )}
        {settings.overlayType === 'sticker' && (
          <>
            <input
              ref={stickerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = reader.result;
                  if (typeof dataUrl !== 'string') return;
                  saveOverlayImageDataUrl(dataUrl);
                  void loadOverlayImageFromDataUrl(dataUrl);
                };
                reader.readAsDataURL(file);
              }}
            />
            <button
              type="button"
              className="btn w-full justify-center"
              onClick={() => stickerInputRef.current?.click()}
            >
              {t('Upload sticker')}
            </button>
            <button
              type="button"
              className="btn w-full justify-center"
              onClick={() => clearOverlayImage()}
            >
              {t('Remove sticker')}
            </button>
          </>
        )}
        {settings.overlayType !== 'none' && (
          <>
            <Slider
              label="Size"
              min={0.02}
              max={1}
              step={0.01}
              value={settings.overlaySize}
              onChange={(v) => update({ overlaySize: v })}
              display={`${Math.round(settings.overlaySize * 100)}%`}
            />
            <Slider
              label="Position X"
              min={0}
              max={1}
              step={0.02}
              value={settings.overlayX}
              onChange={(v) => update({ overlayX: v })}
              display={`${Math.round(settings.overlayX * 100)}%`}
            />
            <Slider
              label="Position Y"
              min={0}
              max={1}
              step={0.02}
              value={settings.overlayY}
              onChange={(v) => update({ overlayY: v })}
              display={`${Math.round(settings.overlayY * 100)}%`}
            />
            <Slider
              label="Rotation"
              min={-180}
              max={180}
              step={1}
              value={settings.overlayRotation}
              onChange={(v) => update({ overlayRotation: v })}
              display={`${settings.overlayRotation}deg`}
            />
            <Slider
              label="Opacity"
              min={0}
              max={1}
              step={0.05}
              value={settings.overlayOpacity}
              onChange={(v) => update({ overlayOpacity: v })}
              display={`${Math.round(settings.overlayOpacity * 100)}%`}
            />
            <label className="block">
              <span className="mb-1.5 block text-xs text-zinc-400">
                {t('Blend Mode')}
              </span>
              <select
                value={settings.overlayBlend}
                aria-label={t('Blend Mode')}
                onChange={(e) => update({ overlayBlend: e.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
              >
                {BLEND_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {t(m.label)}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </PanelSection>

      <PanelSection title="Layers">
        {settings.layers.length > 0 && (
          <div className="space-y-3">
            {settings.layers.map((layer, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-2"
              >
                <div className="flex items-center gap-2">
                  <select
                    value={layer.engine}
                    aria-label={t('Engine')}
                    onChange={(e) =>
                      updateLayer(i, {
                        engine: e.target.value as EngineId | 'none',
                      })
                    }
                    className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                  >
                    <option value="none">{t('None')}</option>
                    {ENGINES.map((e) => (
                      <option key={e.id} value={e.id}>
                        {t(engineMeta(e.id).name)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={t('Remove layer')}
                    onClick={() =>
                      update({
                        layers: settings.layers.filter((_, idx) => idx !== i),
                      })
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-red-300"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <select
                  value={layer.blend}
                  aria-label={t('Blend Mode')}
                  onChange={(e) => updateLayer(i, { blend: e.target.value })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                >
                  {BLEND_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {t(m.label)}
                    </option>
                  ))}
                </select>
                <Slider
                  label="Blend Opacity"
                  min={0}
                  max={1}
                  step={0.05}
                  value={layer.opacity}
                  onChange={(v) => updateLayer(i, { opacity: v })}
                  display={`${Math.round(layer.opacity * 100)}%`}
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={t('Move up')}
                    disabled={i === 0}
                    onClick={() => moveLayer(i, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span aria-hidden="true">▲</span>
                  </button>
                  <button
                    type="button"
                    aria-label={t('Move down')}
                    disabled={i === settings.layers.length - 1}
                    onClick={() => moveLayer(i, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span aria-hidden="true">▼</span>
                  </button>
                  <button
                    type="button"
                    aria-label={t(layer.visible === false ? 'Show layer' : 'Hide layer')}
                    aria-pressed={layer.visible !== false}
                    onClick={() => updateLayer(i, { visible: layer.visible === false })}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border transition ${
                      layer.visible !== false
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    <span aria-hidden="true">{layer.visible === false ? '○' : '◉'}</span>
                  </button>
                </div>
                <div className="space-y-2 border-t border-zinc-800/70 pt-2">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    {t('Parameters')}
                  </span>
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-zinc-400">
                      {t('Palette')}
                    </span>
                    <select
                      value={layer.params?.paletteId ?? ''}
                      aria-label={t('Palette')}
                      onChange={(e) =>
                        setLayerParam(i, 'paletteId', e.target.value || undefined)
                      }
                      className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500"
                    >
                      <option value="">{t('Global')}</option>
                      {allPalettes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Slider
                    label="Cell Size"
                    min={3}
                    max={48}
                    step={1}
                    value={layer.params?.cellSize ?? settings.cellSize}
                    onChange={(v) => setLayerParam(i, 'cellSize', v)}
                  />
                  <Slider
                    label="Brightness"
                    min={-100}
                    max={100}
                    value={layer.params?.brightness ?? settings.brightness}
                    onChange={(v) => setLayerParam(i, 'brightness', v)}
                  />
                  <Slider
                    label="Contrast"
                    min={-100}
                    max={100}
                    value={layer.params?.contrast ?? settings.contrast}
                    onChange={(v) => setLayerParam(i, 'contrast', v)}
                  />
                  <Slider
                    label="Saturation"
                    min={-100}
                    max={100}
                    value={layer.params?.saturation ?? settings.saturation}
                    onChange={(v) => setLayerParam(i, 'saturation', v)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="btn w-full justify-center"
          disabled={settings.layers.length >= 2}
          onClick={() =>
            update({
              layers: [
                ...settings.layers,
                {
                  engine: 'none',
                  blend: 'source-over',
                  opacity: 1,
                  visible: true,
                },
              ],
            })
          }
        >
          {t('Add layer')}
        </button>

        <p className="text-[11px] leading-relaxed text-zinc-500">
          {t('Each extra layer stacks another engine result with its own blend mode and opacity.')}
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

      <PanelSection title="History">
        {snapshots.length === 0 ? (
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('No history yet')}
          </p>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {snapshots.map((snap) => (
                <button
                  key={snap.id}
                  type="button"
                  onClick={() => applySnapshot(snap.id)}
                  className="shrink-0 text-left"
                >
                  <img
                    src={snap.thumb}
                    alt={t(engineMeta(snap.engine).name)}
                    className="h-16 w-16 rounded-md border border-zinc-800 object-cover"
                  />
                  <span className="mt-1 block w-16 truncate text-[11px] text-zinc-500">
                    {t(engineMeta(snap.engine).name)}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn w-full justify-center"
              onClick={clearSnapshots}
            >
              {t('Clear')}
            </button>
          </>
        )}
      </PanelSection>
    </>
  );
}
