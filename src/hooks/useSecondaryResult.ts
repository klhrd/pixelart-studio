import { useEffect, useRef, useState } from 'react';
import type {
  EngineId,
  EngineResult,
  Settings,
  SourceImage,
} from '../types';
import { getClient } from '../workers/engineClient';

export function useSecondaryResult(
  source: SourceImage | null,
  engine: EngineId | 'none',
  settings: Settings,
  palette: string[],
): { engine: EngineId; data: EngineResult } | null {
  const [result, setResult] = useState<{
    engine: EngineId;
    data: EngineResult;
  } | null>(null);

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
    if (!source || engine === 'none') {
      setResult(null);
      return;
    }
    const jobId = ++jobRef.current;
    getClient(engine)
      .run({
        width: source.width,
        height: source.height,
        bytes: source.bytes,
        settings: stable,
        palette,
      })
      .then((res) => {
        if (jobRef.current === jobId) setResult({ engine, data: res });
      })
      .catch(() => {
        if (jobRef.current === jobId) setResult(null);
      });
  }, [source, engine, stable, palette]);

  return result && result.engine === engine ? result : null;
}
