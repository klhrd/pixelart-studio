import { useEffect, useRef, useState } from 'react';
import type {
  EffectLayer,
  EngineId,
  EngineResult,
  Settings,
  SourceImage,
} from '../types';
import { getClient } from '../workers/engineClient';

export type ResolvedLayer = { engine: EngineId; result: EngineResult } | null;

export function useLayerResults(
  source: SourceImage | null,
  layers: EffectLayer[],
  settings: Settings,
  palette: string[],
): ResolvedLayer[] {
  const [results, setResults] = useState<ResolvedLayer[]>([]);

  const jobRef = useRef(0);
  const strippedRef = useRef(settings);
  strippedRef.current = {
    ...settings,
    animOffset: 0,
    animSpeed: 0,
    animate: false,
  };

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
    const active = layers.some((layer) => layer.engine !== 'none');
    if (!active) {
      setResults(layers.map(() => null));
      return;
    }
    const jobId = ++jobRef.current;
    Promise.all(
      layers.map((layer) => {
        const engine = layer.engine;
        return engine === 'none'
          ? Promise.resolve<ResolvedLayer>(null)
          : getClient(engine)
              .run({
                width: source.width,
                height: source.height,
                bytes: source.bytes,
                settings: stable,
                palette,
              })
              .then((result): ResolvedLayer => ({ engine, result }))
              .catch((): ResolvedLayer => null);
      }),
    ).then((resolved) => {
      if (jobRef.current === jobId) setResults(resolved);
    });
  }, [source, layers, stable, palette]);

  return results.length === layers.length ? results : layers.map(() => null);
}
