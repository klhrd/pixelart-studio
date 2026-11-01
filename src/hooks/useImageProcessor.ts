import { useEffect, useRef, useState } from 'react';
import type {
  EngineId,
  EngineResult,
  ProcessorStatus,
  Settings,
  SourceImage,
} from '../types';
import { disposeAllClients, getClient } from '../workers/engineClient';

export function useImageProcessor(
  source: SourceImage | null,
  engine: EngineId,
  settings: Settings,
  palette: string[],
) {
  const [result, setResult] = useState<EngineResult | null>(null);
  const [status, setStatus] = useState<ProcessorStatus>('idle');
  const [error, setError] = useState<string | null>(null);

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
    const t = setTimeout(() => setStable(strippedRef.current), 120);
    return () => clearTimeout(t);
  }, [workerKey]);

  useEffect(() => {
    if (!source) {
      setResult(null);
      setStatus('idle');
      setError(null);
      return;
    }
    const jobId = ++jobRef.current;
    setStatus('processing');
    setError(null);

    getClient(engine)
      .run({
        width: source.width,
        height: source.height,
        bytes: source.bytes,
        settings: stable,
        palette,
      })
      .then((res) => {
        if (jobRef.current === jobId) {
          setResult(res);
          setStatus('ready');
        }
      })
      .catch((err: unknown) => {
        if (jobRef.current === jobId) {
          setStatus('error');
          setError(err instanceof Error ? err.message : String(err));
        }
      });
  }, [source, engine, stable, palette]);

  useEffect(() => () => disposeAllClients(), []);

  return { result, status, error };
}
