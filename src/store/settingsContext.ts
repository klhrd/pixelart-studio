import { createContext, useContext } from 'react';
import type { EngineId, Settings } from '../types';
import type { Palette } from '../algorithms/palettes';

export const DEFAULT_SETTINGS: Settings = {
  cellSize: 14,
  contrast: 15,
  brightness: 0,
  saturation: 0,
  paletteId: 'cga',
  edgeSensitivity: 0.7,
  animOffset: 0,
  animSpeed: 0.25,
  animate: false,
  staggered: true,
  seed: 1,
  strokeWidth: 0.42,
  blankThreshold: 0.82,
  pointDensity: 60,
  voronoiMode: 'voronoi',
  edgeWidth: 1,
  threshold: 128,
  invert: false,
  serpentine: true,
  stippleCount: 1200,
  stippleSteps: 8,
  flowParticles: 2500,
  flowSteps: 60,
  flowNoise: 0.35,
  flowWidth: 1.2,
  scanGlow: 0.6,
  scanAberration: 2,
  scanGlitch: 0.3,
  bendayScale: 0.8,
  waveAmp: 0.6,
  waveFreq: 8,
  contourLevels: 10,
  stringPoints: 60,
  stringLines: 200,
  turingFrames: 30,
  turingFeed: 0.055,
  turingKill: 0.062,
  pixelSortThreshold: 128,
  pixelSortDirection: 'horizontal',
  pixelSortMode: 'asc',
};

export const DEFAULT_PALETTE_ORDER: string[] = [
  'cga',
  'cyberpunk',
  'gameboy',
  'matrix',
  'muted',
  'ember',
  'glacier',
  'sepia',
  'mono',
];

export const DEFAULT_FEATURED: string[] = [
  'cga',
  'cyberpunk',
  'gameboy',
  'matrix',
  'muted',
  'mono',
];

export interface SettingsContextValue {
  engine: EngineId;
  setEngine: (engine: EngineId) => void;
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  palette: string[];
  allPalettes: Palette[];
  customPalettes: Palette[];
  saveCustomPalette: (colors: string[], name: string) => void;
  updateCustomPalette: (id: string, colors: string[], name: string) => void;
  deleteCustomPalette: (id: string) => void;
  customSheetOpen: boolean;
  setCustomSheetOpen: (open: boolean) => void;
  editingPaletteId: string | null;
  setEditingPaletteId: (id: string | null) => void;
  movePalette: (id: string, dir: -1 | 1) => void;
  togglePaletteFeatured: (id: string) => void;
  featured: string[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
