import { engineMeta } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { EngineIcon } from '../icons/EngineIcon';
import { PalettePicker } from './PalettePicker';
import { PanelSection } from './PanelSection';
import { Segmented } from './Segmented';
import { Slider } from './Slider';
import { Switch } from './Switch';

const GLYPH_SHAPES: { value: string; label: string }[] = [
  { value: 'star', label: 'Star' },
  { value: 'cross', label: 'Cross' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Tri' },
  { value: 'square', label: 'Square' },
  { value: 'smiley', label: 'Smiley' },
];

export function EnginePanel() {
  const { engine, settings, update, reset } = useSettings();
  const { t } = useI18n();
  const meta = engineMeta(engine);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
            <EngineIcon id={engine} className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-zinc-100">
              {t(meta.name)}
            </div>
            <div className="text-[11px] text-zinc-500">{t(meta.tagline)}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-zinc-700 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
        >
          {t('Reset')}
        </button>
      </div>

      <PanelSection title="Grid">
        <Slider
          label="Cell Size"
          min={3}
          max={48}
          value={settings.cellSize}
          onChange={(v) => update({ cellSize: v })}
          display={`${settings.cellSize}px`}
        />
      </PanelSection>

      <PanelSection title="Palette">
        <PalettePicker />
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
          <Slider
            label="Edge Bias"
            min={0}
            max={1}
            step={0.05}
            value={settings.moonEdgeBias}
            onChange={(v) => update({ moonEdgeBias: v })}
            display={`${Math.round(settings.moonEdgeBias * 100)}%`}
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
              <span className="mb-1.5 block">{t('Seed')}</span>
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
              {t('New Seed')}
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
            display={settings.edgeWidth === 0 ? t('Off') : `${settings.edgeWidth}px`}
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
            {t('Each cell maps a 2x4 pixel block onto the Unicode Braille range U+2800-U+28FF, rendered as geometric dots.')}
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
            {t('Quantization error is diffused to neighboring pixels with weights 7/16, 3/16, 5/16 and 1/16. Raising Cell Size above 14 enlarges the pixel blocks for a chunkier look.')}
          </p>
        </PanelSection>
      )}

      {engine === 'stipple' && (
        <PanelSection title="Stippling">
          <Slider
            label="Dot Size"
            min={0.2}
            max={4}
            step={0.1}
            value={settings.stippleSize}
            onChange={(v) => update({ stippleSize: v })}
            display={`${settings.stippleSize.toFixed(1)}×`}
          />
          <Slider
            label="Relax Steps"
            min={1}
            max={20}
            value={settings.stippleSteps}
            onChange={(v) => update({ stippleSteps: v })}
            display={`${settings.stippleSteps}`}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Cell Size sets point density (smaller cells = more dots). Dot Size scales each mark. Weighted Centroidal Voronoi relaxation drifts points toward mass centers: dark regions crowd with dots, bright regions stay empty.')}
          </p>
        </PanelSection>
      )}

      {engine === 'flow' && (
        <PanelSection title="Flow Field">
          <Slider
            label="Particles"
            min={500}
            max={8000}
            step={100}
            value={settings.flowParticles}
            onChange={(v) => update({ flowParticles: v })}
            display={`${settings.flowParticles}`}
          />
          <Slider
            label="Trace Length"
            min={10}
            max={120}
            value={settings.flowSteps}
            onChange={(v) => update({ flowSteps: v })}
            display={`${settings.flowSteps}`}
          />
          <Slider
            label="Noise Blend"
            min={0}
            max={1}
            step={0.01}
            value={settings.flowNoise}
            onChange={(v) => update({ flowNoise: v })}
            display={`${Math.round(settings.flowNoise * 100)}%`}
          />
          <Slider
            label="Stroke Width"
            min={0.5}
            max={3}
            step={0.1}
            value={settings.flowWidth}
            onChange={(v) => update({ flowWidth: v })}
            display={settings.flowWidth.toFixed(1)}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Particles ride a vector field built from image gradients blended with Perlin-style noise, leaving silky ink trails.')}
          </p>
        </PanelSection>
      )}

      {engine === 'scanline' && (
        <PanelSection title="Scanline CRT">
          <Slider
            label="Glow"
            min={0}
            max={1}
            step={0.01}
            value={settings.scanGlow}
            onChange={(v) => update({ scanGlow: v })}
            display={`${Math.round(settings.scanGlow * 100)}%`}
          />
          <Slider
            label="Aberration"
            min={0}
            max={10}
            value={settings.scanAberration}
            onChange={(v) => update({ scanAberration: v })}
            display={`${settings.scanAberration}px`}
          />
          <Slider
            label="Glitch"
            min={0}
            max={1}
            step={0.01}
            value={settings.scanGlitch}
            onChange={(v) => update({ scanGlitch: v })}
            display={`${Math.round(settings.scanGlitch * 100)}%`}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Scanline pitch follows Cell Size. Rows are darkened and glowing bands by luminance, with RGB channel shift and seeded glitch blocks.')}
          </p>
        </PanelSection>
      )}

      {engine === 'hanzi' && (
        <PanelSection title="Hanzi Glyphs">
          <Slider
            label="Blank Above"
            min={0}
            max={1}
            step={0.01}
            value={settings.blankThreshold}
            onChange={(v) => update({ blankThreshold: v })}
            display={settings.blankThreshold.toFixed(2)}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Each cell maps its darkness onto one of twelve Chinese characters ordered by stroke density, from 一 to 鑫. Cell Size sets the glyph size.')}
          </p>
        </PanelSection>
      )}

      {engine === 'stringart' && (
        <PanelSection title="String Art">
          <Slider
            label="Nails"
            min={20}
            max={300}
            step={10}
            value={settings.stringPoints}
            onChange={(v) => update({ stringPoints: v })}
            display={`${settings.stringPoints}`}
          />
          <Slider
            label="Threads"
            min={100}
            max={8000}
            step={100}
            value={settings.stringLines}
            onChange={(v) => update({ stringLines: v })}
            display={`${settings.stringLines}`}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('A greedy thread is pulled between perimeter nails to cover the darkest pixels first — a single continuous string weaving a portrait. Cell Size scales the line width.')}
          </p>
        </PanelSection>
      )}

      {engine === 'turing' && (
        <PanelSection title="Turing Patterns">
          <Slider
            label="Frames"
            min={10}
            max={300}
            step={10}
            value={settings.turingFrames}
            onChange={(v) => update({ turingFrames: v })}
            display={`${settings.turingFrames}`}
          />
          <Slider
            label="Feed"
            min={0.01}
            max={0.1}
            step={0.005}
            value={settings.turingFeed}
            onChange={(v) => update({ turingFeed: v })}
            display={settings.turingFeed.toFixed(3)}
          />
          <Slider
            label="Kill"
            min={0.01}
            max={0.1}
            step={0.005}
            value={settings.turingKill}
            onChange={(v) => update({ turingKill: v })}
            display={settings.turingKill.toFixed(3)}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Gray-Scott reaction-diffusion: chemicals A and B diffuse and react, growing organic cellular patterns guided by image luminance.')}
          </p>
        </PanelSection>
      )}

      {engine === 'pixelsort' && (
        <PanelSection title="Pixel Sorting">
          <Slider
            label="Threshold"
            min={0}
            max={254}
            value={settings.pixelSortThreshold}
            onChange={(v) => update({ pixelSortThreshold: v })}
            display={`${settings.pixelSortThreshold}`}
          />
          <Segmented
            value={settings.pixelSortDirection}
            onChange={(v) => update({ pixelSortDirection: v })}
            options={[
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
            ]}
          />
          <Segmented
            value={settings.pixelSortMode}
            onChange={(v) => update({ pixelSortMode: v })}
            options={[
              { value: 'asc', label: 'Dark→Bright' },
              { value: 'desc', label: 'Bright→Dark' },
            ]}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Pixel runs above/below the threshold are sorted by luminance, melting the image into horizontal or vertical streaks.')}
          </p>
        </PanelSection>
      )}

      {engine === 'hexdump' && (
        <PanelSection title="Hex Dump">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Every cell prints the average pixel color as a raw hex code (#RRGGBB). Text brightness follows luminance — bright areas glow with light code, shadows stay dark. Cell Size sets the font size.')}
          </p>
        </PanelSection>
      )}

      {engine === 'benday' && (
        <PanelSection title="Ben-Day Dots">
          <Slider
            label="Dot Scale"
            min={0.4}
            max={1.1}
            step={0.01}
            value={settings.bendayScale}
            onChange={(v) => update({ bendayScale: v })}
            display={settings.bendayScale.toFixed(2)}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Naive CMYK separation printed as angled dot screens (C 15°, M 75°, Y 0°, K 45°) overprinted with multiply blending for that retro comic feel. Cell Size sets the screen pitch.')}
          </p>
        </PanelSection>
      )}

      {engine === 'wave' && (
        <PanelSection title="Wave Interference">
          <Slider
            label="Amplitude"
            min={0.1}
            max={1.5}
            step={0.05}
            value={settings.waveAmp}
            onChange={(v) => update({ waveAmp: v })}
            display={settings.waveAmp.toFixed(2)}
          />
          <Slider
            label="Wavelength"
            min={2}
            max={24}
            value={settings.waveFreq}
            onChange={(v) => update({ waveFreq: v })}
            display={`${settings.waveFreq}`}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Parallel sine lines whose local amplitude follows column luminance. Push wavelength near the line spacing to trigger moiré interference. Cell Size sets the line spacing.')}
          </p>
        </PanelSection>
      )}

      {engine === 'contour' && (
        <PanelSection title="Topographic Map">
          <Slider
            label="Levels"
            min={4}
            max={20}
            value={settings.contourLevels}
            onChange={(v) => update({ contourLevels: v })}
            display={`${settings.contourLevels}`}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Grayscale is treated as a smoothed heightmap and Marching Squares extracts contour lines at fixed elevation intervals. Cell Size scales the smoothing radius.')}
          </p>
        </PanelSection>
      )}

      {engine === 'hatch' && (
        <PanelSection title="Cross-Hatching">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Engraving-style linework: bright cells get a single sparse pass, while darker cells stack up to four cross-hatched layers at 0°, 45°, 90° and 135°. Cell Size sets the grid.')}
          </p>
        </PanelSection>
      )}

      {engine === 'glyphs' && (
        <PanelSection title="Glyph Halftone">
          <div>
            <span className="mb-1.5 block text-xs text-zinc-400">{t('Shape')}</span>
            <div className="grid grid-cols-4 gap-1.5">
              {GLYPH_SHAPES.map((shape) => (
                <button
                  key={shape.value}
                  type="button"
                  onClick={() => update({ glyphShape: shape.value })}
                  className={`rounded-lg border py-1.5 font-mono text-[10px] capitalize transition ${
                    settings.glyphShape === shape.value
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {t(shape.label)}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('Each cell stamps the chosen glyph scaled by darkness — bright areas shrink to nothing, shadows swell to fill. Cell Size sets the grid.')}
          </p>
        </PanelSection>
      )}

      {engine === 'moire' && (
        <PanelSection title="Moiré Interference">
          <Segmented
            value={settings.moirePattern}
            onChange={(v) => update({ moirePattern: v })}
            options={[
              { value: 'rings', label: 'Rings' },
              { value: 'lines', label: 'Lines' },
              { value: 'spiral', label: 'Spiral' },
            ]}
          />
          <Slider
            label="Frequency"
            min={0.2}
            max={4}
            step={0.1}
            value={settings.moireFreq}
            onChange={(v) => update({ moireFreq: v })}
            display={settings.moireFreq.toFixed(1)}
          />
          <Slider
            label="Phase Shift"
            min={0}
            max={10}
            step={0.5}
            value={settings.moirePhase}
            onChange={(v) => update({ moirePhase: v })}
            display={settings.moirePhase.toFixed(1)}
          />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {t('High-frequency optical grating whose phase is shifted by image luminance, warping the pattern around contours. Cell Size scales the grating.')}
          </p>
        </PanelSection>
      )}
    </>
  );
}
