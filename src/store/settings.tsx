import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { EngineId, Preset, Settings, Snapshot } from '../types';
import {
  MAX_CUSTOM_PALETTES,
  PALETTES,
  loadCustomPalettes,
  paletteById,
  persistCustomPalettes,
} from '../algorithms/palettes';
import type { Palette } from '../algorithms/palettes';
import { ENGINES } from '../engines';
import { DEFAULT_SETTINGS, DEFAULT_FEATURED, DEFAULT_PALETTE_ORDER, SettingsContext } from './settingsContext';

const ORDER_KEY = 'pixelcraft-palette-order';
const FEATURED_KEY = 'pixelcraft-palette-featured';
const ENGINE_FAV_KEY = 'pixelcraft-engine-favorites';
const SETTINGS_KEY = 'pixelcraft-settings';
const ENGINE_KEY = 'pixelcraft-engine';
const PRESETS_KEY = 'pixelcraft-presets';
const HISTORY_KEY = 'pixelcraft-history';
const HISTORY_MAX = 50;
const PRESETS_MAX = 50;
const SNAPSHOTS_MAX = 24;

function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (p): p is Preset =>
        !!p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        typeof p.engine === 'string' &&
        !!p.settings &&
        typeof p.settings === 'object',
    );
  } catch {
    return [];
  }
}

function persistPresets(list: Preset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function loadSnapshots(): Snapshot[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (s): s is Snapshot =>
        !!s &&
        typeof s.id === 'string' &&
        typeof s.engine === 'string' &&
        !!s.settings &&
        typeof s.settings === 'object' &&
        typeof s.thumb === 'string',
    );
  } catch {
    return [];
  }
}

function persistSnapshots(list: Snapshot[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

const ENGINE_IDS = new Set<string>(ENGINES.map((e) => e.id));

function loadStoredSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS;
    const merged: Settings = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      if (key in parsed && typeof parsed[key] === typeof DEFAULT_SETTINGS[key]) {
        // Preserve only values whose type matches the default (guards corruption).
        (merged as unknown as Record<string, unknown>)[key] = parsed[key];
      }
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadStoredEngine(): EngineId {
  try {
    const v = localStorage.getItem(ENGINE_KEY);
    if (v && ENGINE_IDS.has(v)) return v as EngineId;
  } catch {
    /* storage unavailable */
  }
  return 'moon';
}

function loadIdList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function persistIdList(key: string, list: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<EngineId>(loadStoredEngine);
  const [settings, setSettings] = useState<Settings>(loadStoredSettings);
  const [customPalettes, setCustomPalettes] = useState<Palette[]>(
    () => loadCustomPalettes(),
  );
  const [paletteOrder, setPaletteOrder] = useState<string[]>(() => {
    const stored = loadIdList(ORDER_KEY);
    return stored.length > 0
      ? [...new Set([...stored, ...DEFAULT_PALETTE_ORDER])]
      : DEFAULT_PALETTE_ORDER;
  });
  const [featured, setFeatured] = useState<string[]>(() => {
    const stored = loadIdList(FEATURED_KEY);
    return stored.length > 0 ? stored : DEFAULT_FEATURED;
  });
  const [favoriteEngines, setFavoriteEngines] = useState<string[]>(() =>
    loadIdList(ENGINE_FAV_KEY),
  );
  const [customSheetOpen, setCustomSheetOpen] = useState(false);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [history, setHistory] = useState<Settings[]>([]);
  const [future, setFuture] = useState<Settings[]>([]);
  const [presets, setPresets] = useState<Preset[]>(loadPresets);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(loadSnapshots);

  // Persist tuning + selected engine so a reload resumes exactly where you left off.
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable */
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(ENGINE_KEY, engine);
    } catch {
      /* storage unavailable */
    }
  }, [engine]);

  const pushHistory = useCallback((current: Settings) => {
    setHistory(prev => {
      const last = prev[prev.length - 1];
      if (last && JSON.stringify(last) === JSON.stringify(current)) return prev;
      const next = [...prev, current].slice(-HISTORY_MAX);
      return next;
    });
    setFuture([]);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      pushHistory(prev);
      return { ...prev, ...patch };
    });
  }, [pushHistory]);

  const reset = useCallback(() => {
    pushHistory(settings);
    setSettings(DEFAULT_SETTINGS);
    setFuture([]);
  }, [settings, pushHistory]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture(f => [...f, settings]);
      setSettings(previous);
      return prev.slice(0, -1);
    });
  }, [settings]);

  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      const next = prev[prev.length - 1];
      setHistory(h => [...h, settings]);
      setSettings(next);
      return prev.slice(0, -1);
    });
  }, [settings]);

  const byId = useMemo(
    () => new Map([...PALETTES, ...customPalettes].map((p) => [p.id, p])),
    [customPalettes],
  );

  const allPalettes = useMemo(() => {
    const list: Palette[] = [];
    const seen = new Set<string>();
    for (const id of paletteOrder) {
      const p = byId.get(id);
      if (p) {
        list.push(p);
        seen.add(id);
      }
    }
    for (const p of [...customPalettes, ...PALETTES]) {
      if (!seen.has(p.id)) list.push(p);
    }
    return list;
  }, [paletteOrder, byId, customPalettes]);

  const palette = useMemo(
    () => paletteById(settings.paletteId, allPalettes).colors,
    [settings.paletteId, allPalettes],
  );

  const saveCustomPalette = useCallback(
    (colors: string[], name: string) => {
      const entry: Palette = {
        id: `custom-${Date.now()}`,
        name: name.trim() || `Custom ${customPalettes.length + 1}`,
        colors: [...colors],
      };
      const nextCustoms = [entry, ...customPalettes].slice(
        0,
        MAX_CUSTOM_PALETTES,
      );
      setCustomPalettes(nextCustoms);
      persistCustomPalettes(nextCustoms);

      setPaletteOrder((prev) => {
        const next = [entry.id, ...prev];
        persistIdList(ORDER_KEY, next);
        return next;
      });
      setFeatured((prev) => {
        if (prev.includes(entry.id)) return prev;
        const next = [entry.id, ...prev];
        persistIdList(FEATURED_KEY, next);
        return next;
      });
      setSettings((s) => ({ ...s, paletteId: entry.id }));
      setEditingPaletteId(null);
      setCustomSheetOpen(false);
    },
    [customPalettes],
  );

  const updateCustomPalette = useCallback(
    (id: string, colors: string[], name: string) => {
      const nextCustoms = customPalettes.map((p) =>
        p.id === id
          ? { ...p, colors: [...colors], name: name.trim() || p.name }
          : p,
      );
      setCustomPalettes(nextCustoms);
      persistCustomPalettes(nextCustoms);
      setSettings((s) => (s.paletteId === id ? s : { ...s, paletteId: id }));
      setEditingPaletteId(null);
      setCustomSheetOpen(false);
    },
    [customPalettes],
  );

  const deleteCustomPalette = useCallback(
    (id: string) => {
      const nextCustoms = customPalettes.filter((p) => p.id !== id);
      setCustomPalettes(nextCustoms);
      persistCustomPalettes(nextCustoms);
      setPaletteOrder((prev) => {
        const next = prev.filter((v) => v !== id);
        persistIdList(ORDER_KEY, next);
        return next;
      });
      setFeatured((prev) => {
        if (!prev.includes(id)) return prev;
        const next = prev.filter((v) => v !== id);
        persistIdList(FEATURED_KEY, next);
        return next;
      });
      setSettings((s) => (s.paletteId === id ? { ...s, paletteId: 'cga' } : s));
    },
    [customPalettes],
  );

  const movePalette = useCallback((id: string, dir: -1 | 1) => {
    setPaletteOrder((prev) => {
      const list = [...prev];
      const idx = list.indexOf(id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= list.length) return prev;
      [list[idx], list[target]] = [list[target], list[idx]];
      persistIdList(ORDER_KEY, list);
      return list;
    });
  }, []);

  const togglePaletteFeatured = useCallback((id: string) => {
    setFeatured((prev) => {
      const next = prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [id, ...prev];
      persistIdList(FEATURED_KEY, next);
      return next;
    });
  }, []);

  const toggleEngineFavorite = useCallback((id: string) => {
    setFavoriteEngines((prev) => {
      const next = prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [id, ...prev];
      persistIdList(ENGINE_FAV_KEY, next);
      return next;
    });
  }, []);

  const savePreset = useCallback(
    (name: string) => {
      setPresets((prev) => {
        const entry: Preset = {
          id: `preset-${Date.now()}`,
          name: name.trim() || `Preset ${prev.length + 1}`,
          engine,
          settings: { ...settings },
        };
        const next = [entry, ...prev].slice(0, PRESETS_MAX);
        persistPresets(next);
        return next;
      });
    },
    [engine, settings],
  );

  const applyPreset = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return;
      setEngine(preset.engine);
      update(preset.settings);
    },
    [presets, update],
  );

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistPresets(next);
      return next;
    });
  }, []);

  const addSnapshot = useCallback(
    (engineId: EngineId, nextSettings: Settings, thumb: string) => {
      setSnapshots((prev) => {
        const last = prev[0];
        if (
          last &&
          last.engine === engineId &&
          JSON.stringify(last.settings) === JSON.stringify(nextSettings)
        ) {
          return prev;
        }
        const entry: Snapshot = {
          id: `snap-${Date.now()}`,
          engine: engineId,
          settings: { ...nextSettings },
          thumb,
        };
        const next = [entry, ...prev].slice(0, SNAPSHOTS_MAX);
        persistSnapshots(next);
        return next;
      });
    },
    [],
  );

  const applySnapshot = useCallback(
    (id: string) => {
      const snap = snapshots.find((s) => s.id === id);
      if (!snap) return;
      setEngine(snap.engine);
      update(snap.settings);
    },
    [snapshots, update],
  );

  const clearSnapshots = useCallback(() => {
    setSnapshots([]);
    persistSnapshots([]);
  }, []);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const value = useMemo(
    () => ({
      engine,
      setEngine,
      settings,
      update,
      reset,
      undo,
      redo,
      palette,
      allPalettes,
      customPalettes,
      saveCustomPalette,
      updateCustomPalette,
      deleteCustomPalette,
      customSheetOpen,
      setCustomSheetOpen,
      editingPaletteId,
      setEditingPaletteId,
      movePalette,
      togglePaletteFeatured,
      featured,
      favoriteEngines,
      toggleEngineFavorite,
      canUndo,
      canRedo,
      presets,
      savePreset,
      applyPreset,
      deletePreset,
      snapshots,
      addSnapshot,
      applySnapshot,
      clearSnapshots,
    }),
    [
      engine,
      settings,
      update,
      reset,
      undo,
      redo,
      palette,
      allPalettes,
      customPalettes,
      saveCustomPalette,
      updateCustomPalette,
      deleteCustomPalette,
      customSheetOpen,
      editingPaletteId,
      setCustomSheetOpen,
      movePalette,
      togglePaletteFeatured,
      featured,
      favoriteEngines,
      toggleEngineFavorite,
      canUndo,
      canRedo,
      presets,
      savePreset,
      applyPreset,
      deletePreset,
      snapshots,
      addSnapshot,
      applySnapshot,
      clearSnapshots,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}
