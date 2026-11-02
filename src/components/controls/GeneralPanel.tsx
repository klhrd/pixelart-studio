import { useSettings } from '../../store/settingsContext';
import { PalettePicker } from './PalettePicker';
import { PanelSection } from './PanelSection';
import { Slider } from './Slider';

export function GeneralPanel() {
  const { settings, update } = useSettings();

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

      <PanelSection title="Palette">
        <PalettePicker
          value={settings.paletteId}
          onChange={(id) => update({ paletteId: id })}
        />
      </PanelSection>
    </>
  );
}
