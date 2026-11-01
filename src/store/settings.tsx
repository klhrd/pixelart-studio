import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { EngineId, Settings } from '../types';
import { PALETTES, paletteById } from '../algorithms/palettes';
import { DEFAULT_SETTINGS, SettingsContext } from './settingsContext';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<EngineId>('moon');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const palette = useMemo(
    () => paletteById(settings.paletteId, PALETTES).colors,
    [settings.paletteId],
  );

  const value = useMemo(
    () => ({ engine, setEngine, settings, update, reset, palette }),
    [engine, settings, update, reset, palette],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}
