import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { EngineId, Settings } from '../types';
import {
  MAX_CUSTOM_PALETTES,
  PALETTES,
  loadCustomPalettes,
  paletteById,
  persistCustomPalettes,
} from '../algorithms/palettes';
import type { Palette } from '../algorithms/palettes';
import { DEFAULT_SETTINGS, SettingsContext } from './settingsContext';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<EngineId>('moon');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [customPalettes, setCustomPalettes] = useState<Palette[]>(
    () => loadCustomPalettes(),
  );
  const [customSheetOpen, setCustomSheetOpen] = useState(false);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const allPalettes = useMemo(
    () => [...PALETTES, ...customPalettes],
    [customPalettes],
  );

  const palette = useMemo(
    () => paletteById(settings.paletteId, allPalettes).colors,
    [settings.paletteId, allPalettes],
  );

  const saveCustomPalette = useCallback(
    (colors: string[], name: string) => {
      setCustomPalettes((prev) => {
        const entry: Palette = {
          id: `custom-${Date.now()}`,
          name: name.trim() || `Custom ${prev.length + 1}`,
          colors: [...colors],
        };
        const next = [entry, ...prev].slice(0, MAX_CUSTOM_PALETTES);
        persistCustomPalettes(next);
        setSettings((s) => ({ ...s, paletteId: entry.id }));
        return next;
      });
      setCustomSheetOpen(false);
    },
    [],
  );

  const deleteCustomPalette = useCallback((id: string) => {
    setCustomPalettes((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistCustomPalettes(next);
      setSettings((s) => (s.paletteId === id ? { ...s, paletteId: 'mono' } : s));
      return next;
    });
  }, []);

  const updateCustomPalette = useCallback(
    (id: string, colors: string[], name: string) => {
      setCustomPalettes((prev) => {
        const next = prev.map((p) =>
          p.id === id
            ? { ...p, colors: [...colors], name: name.trim() || p.name }
            : p,
        );
        persistCustomPalettes(next);
        return next;
      });
      setSettings((s) => (s.paletteId === id ? s : { ...s, paletteId: id }));
      setCustomSheetOpen(false);
    },
    [],
  );

  const value = useMemo(
    () => ({
      engine,
      setEngine,
      settings,
      update,
      reset,
      palette,
      allPalettes,
      customPalettes,
      saveCustomPalette,
      updateCustomPalette,
      deleteCustomPalette,
      customSheetOpen,
      setCustomSheetOpen,
    }),
    [
      engine,
      settings,
      update,
      reset,
      palette,
      allPalettes,
      customPalettes,
      saveCustomPalette,
      updateCustomPalette,
      deleteCustomPalette,
      customSheetOpen,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}
