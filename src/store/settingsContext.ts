import { createContext, useContext } from 'react';
import type { EngineId, Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  cellSize: 14,
  contrast: 15,
  brightness: 0,
  paletteId: 'mono',
  edgeSensitivity: 0.7,
  animOffset: 0,
  animSpeed: 0.25,
  animate: false,
  staggered: true,
  seed: 1,
  strokeWidth: 0.42,
  blankThreshold: 0.82,
  pointDensity: 350,
  voronoiMode: 'voronoi',
  edgeWidth: 1,
  threshold: 128,
  invert: false,
  serpentine: true,
};

export interface SettingsContextValue {
  engine: EngineId;
  setEngine: (engine: EngineId) => void;
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  palette: string[];
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
