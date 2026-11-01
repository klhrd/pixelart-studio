import { engineMeta } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import { Collapsible } from './Collapsible';
import { PalettePicker } from './PalettePicker';
import { Segmented } from './Segmented';
import { Slider } from './Slider';
import { Switch } from './Switch';

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-4">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function ControlPanel() {
  const { engine, settings, update, reset, palette } = useSettings();
  const meta = engineMeta(engine);

  return (
    <div className="space-y-4 p-4 pb-10 lg:pb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">
            Module {meta.code}
          </div>
          <h2 className="text-sm font-semibold text-zinc-200">{meta.name}</h2>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
        >
          Reset
        </button>
      </div>

      <PanelSection title="Global">
        <Slider
          label="Cell Size"
          min={3}
          max={48}
          value={settings.cellSize}
          onChange={(v) => update({ cellSize: v })}
          display={`${settings.cellSize}px`}
        />
        <PalettePicker
          value={settings.paletteId}
          onChange={(id) => update({ paletteId: id })}
        />
        <Collapsible title="Image Adjustments">
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
        </Collapsible>
      </PanelSection>

      {engine === 'moon' && (
        <PanelSection title="Moon Phase">
          <Slider
            label="Edge Sensitivity"
            min={0}
            max={1}
            step={0.01}
            value={settings.edgeSensitivity}
            onChange={(v) => update({ edgeSensitivity: v })}
            display={`${Math.round(settings.edgeSensitivity * 100)}%`}
          />
          <Switch
            label="Staggered Grid"
            checked={settings.staggered}
            onChange={(v) => update({ staggered: v })}
          />
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
          <Slider
            label="Phase Offset"
            min={0}
            max={1}
            step={0.01}
            value={settings.animOffset}
            onChange={(v) => update({ animOffset: v })}
            display={`${Math.round(settings.animOffset * 360)}deg`}
          />
        </PanelSection>
      )}

      {engine === 'truchet' && (
        <PanelSection title="Truchet Tiles">
          <div className="flex items-end justify-between gap-2">
            <label className="block text-xs text-zinc-400">
              <span className="mb-1.5 block">Seed</span>
              <input
                type="number"
                min={1}
                max={999999}
                value={settings.seed}
                onChange={(e) =>
                  update({ seed: Math.max(1, Number(e.target.value) || 1) })
                }
              />
            </label>
            <button
              type="button"
              className="btn"
              onClick={() =>
                update({ seed: Math.floor(Math.random() * 999999) + 1 })
              }
            >
              New Seed
            </button>
          </div>
          <Slider
            label="Stroke Width"
            min={0.1}
            max={0.9}
            step={0.01}
            value={settings.strokeWidth}
            onChange={(v) => update({ strokeWidth: v })}
            display={settings.strokeWidth.toFixed(2)}
          />
          <Slider
            label="Blank Above"
            min={0}
            max={1}
            step={0.01}
            value={settings.blankThreshold}
            onChange={(v) => update({ blankThreshold: v })}
            display={settings.blankThreshold.toFixed(2)}
          />
        </PanelSection>
      )}

      {engine === 'voronoi' && (
        <PanelSection title="Voronoi / Delaunay">
          <Segmented
            value={settings.voronoiMode}
            onChange={(v) => update({ voronoiMode: v })}
            options={[
              { value: 'voronoi', label: 'Voronoi' },
              { value: 'delaunay', label: 'Delaunay' },
            ]}
          />
          <Slider
            label="Edge Site Bias"
            min={0}
            max={150}
            step={5}
            value={settings.pointDensity}
            onChange={(v) => update({ pointDensity: v })}
            display={`${settings.pointDensity}%`}
          />
          <Slider
            label="Edge Width"
            min={0}
            max={4}
            step={0.5}
            value={settings.edgeWidth}
            onChange={(v) => update({ edgeWidth: v })}
            display={settings.edgeWidth === 0 ? 'Off' : `${settings.edgeWidth}px`}
          />
        </PanelSection>
      )}

      {engine === 'braille' && (
        <PanelSection title="Braille Raster">
          <Slider
            label="Threshold"
            min={1}
            max={254}
            value={settings.threshold}
            onChange={(v) => update({ threshold: v })}
            display={`${settings.threshold}`}
          />
          <Switch
            label="Invert"
            checked={settings.invert}
            onChange={(v) => update({ invert: v })}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Each cell maps a 2x4 pixel block onto the Unicode Braille range
            U+2800-U+28FF, rendered as geometric dots.
          </p>
        </PanelSection>
      )}

      {engine === 'dither' && (
        <PanelSection title="Floyd-Steinberg">
          <Switch
            label="Serpentine Scan"
            checked={settings.serpentine}
            onChange={(v) => update({ serpentine: v })}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Quantization error is diffused to neighboring pixels with weights
            7/16, 3/16, 5/16 and 1/16. Cell Size controls the pixel scale for
            chunkier output. The selected palette defines the target colors (
            {palette.length} colors).
          </p>
        </PanelSection>
      )}
    </div>
  );
}
