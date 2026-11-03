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
import { DEFAULT_SETTINGS, DEFAULT_FEATURED, DEFAULT_PALETTE_ORDER, SettingsContext } from './settingsContext';

const ORDER_KEY = 'pixelcraft-palette-order';
const FEATURED_KEY = 'pixelcraft-palette-featured';
const HISTORY_MAX = 50;

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
  const [engine, setEngine] = useState<EngineId>('moon');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
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
  const [customSheetOpen, setCustomSheetOpen] = useState(false);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [history, setHistory] = useState<Settings[]>([]);
  const [future, setFuture] = useState<Settings[]>([]);

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
      canUndo,
      canRedo,
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
      canUndo,
      canRedo,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}
