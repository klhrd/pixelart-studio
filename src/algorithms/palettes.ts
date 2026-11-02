export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

export const PALETTES: Palette[] = [
  { id: 'mono', name: 'Mono', colors: ['#050505', '#e8e8e8'] },
  {
    id: 'muted',
    name: 'Low Sat',
    colors: ['#20211f', '#4a4d43', '#7d8371', '#b3b8a7', '#e8eadf'],
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  },
  {
    id: 'cga',
    name: 'CGA',
    colors: ['#000000', '#ff5555', '#55ffff', '#ffff55', '#ffffff'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: ['#0d0221', '#7700a6', '#ff2a6d', '#05d9e8', '#d1f7ff'],
  },
  {
    id: 'sepia',
    name: 'Sepia',
    colors: ['#1a120b', '#4a3524', '#8c6d46', '#c8a97a', '#f0e2c8'],
  },
  {
    id: 'matrix',
    name: 'Matrix',
    colors: ['#000800', '#003b00', '#008f11', '#00ff41'],
  },
  {
    id: 'ember',
    name: 'Ember',
    colors: ['#0c0a09', '#7c2d12', '#ea580c', '#fbbf24', '#fff7ed'],
  },
  {
    id: 'glacier',
    name: 'Glacier',
    colors: ['#020617', '#1e3a8a', '#3b82f6', '#93c5fd', '#eff6ff'],
  },
];

export function paletteById(id: string, palettes: Palette[]): Palette {
  return palettes.find((p) => p.id === id) ?? palettes[0];
}

export function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

const CUSTOM_KEY = 'pixelcraft-custom-palettes';
export const MAX_CUSTOM_PALETTES = 6;

export function loadCustomPalettes(): Palette[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Palette[];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (p) => p && typeof p.id === 'string' && Array.isArray(p.colors),
    );
  } catch {
    return [];
  }
}

export function persistCustomPalettes(list: Palette[]): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}
