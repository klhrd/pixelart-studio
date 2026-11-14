import { useSettings } from '../../store/settingsContext';
import { PanelSection } from './PanelSection';
import { Segmented } from './Segmented';
import { Slider } from './Slider';
import { Switch } from './Switch';

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

      <PanelSection title="Mask">
        <Segmented
          value={settings.maskShape}
          onChange={(v) => update({ maskShape: v })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'ellipse', label: 'Ellipse' },
            { value: 'rect', label: 'Rect' },
            { value: 'linear', label: 'Linear' },
          ]}
        />
        {settings.maskShape !== 'none' && (
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
    </>
  );
}
