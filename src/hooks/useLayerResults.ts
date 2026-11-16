import { useEffect, useRef, useState } from 'react';
import type {
  EffectLayer,
  EngineId,
  EngineResult,
  Settings,
  SourceImage,
} from '../types';
import { getClient } from '../workers/engineClient';
import { DEFAULT_SETTINGS } from '../store/settingsContext';
import { stripRenderOnly } from '../renderers/renderKeys';

export type ResolvedLayer = { engine: EngineId; result: EngineResult } | null;

export function useLayerResults(
  source: SourceImage | null,
  layers: EffectLayer[],
  settings: Settings,
  resolvePalette: (paletteId: string | undefined) => string[],
): ResolvedLayer[] {
  const [results, setResults] = useState<ResolvedLayer[]>([]);

  const jobRef = useRef(0);
  const strippedRef = useRef(settings);
  strippedRef.current = stripRenderOnly(
    {
      ...settings,
      animOffset: 0,
      animSpeed: 0,
      animate: false,
    },
    DEFAULT_SETTINGS,
  );

  const workerKey = JSON.stringify(strippedRef.current);
  const [stable, setStable] = useState(strippedRef.current);
  useEffect(() => {
    const t = setTimeout(() => setStable(strippedRef.current), 400);
    return () => clearTimeout(t);
  }, [workerKey]);

  useEffect(() => {
    if (!source || layers.length === 0) {
      setResults(layers.map(() => null));
      return;
    }
    const active = layers.some(
      (layer) => layer.visible !== false && layer.engine !== 'none',
    );
    if (!active) {
      setResults(layers.map(() => null));
      return;
    }
    const jobId = ++jobRef.current;
    Promise.all(
      layers.map((layer) => {
        const engine = layer.engine;
        if (layer.visible === false || engine === 'none') {
          return Promise.resolve<ResolvedLayer>(null);
        }
        const { paletteId, ...overrides } = layer.params ?? {};
        const effectiveSettings: Settings = { ...stable, ...overrides };
        const effectivePalette = resolvePalette(paletteId);
        return getClient(engine)
          .run({
            width: source.width,
            height: source.height,
            bytes: source.bytes,
            settings: effectiveSettings,
            palette: effectivePalette,
          })
          .then((result): ResolvedLayer => ({ engine, result }))
          .catch((): ResolvedLayer => null);
      }),
    ).then((resolved) => {
      if (jobRef.current === jobId) setResults(resolved);
    });
  }, [source, layers, stable, resolvePalette]);

  return results.length === layers.length ? results : layers.map(() => null);
}
