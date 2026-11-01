import { useCallback, useState } from 'react';
import type { SourceImage } from '../types';
import { fileToSource } from '../utils/image';
import { makeSampleImage } from '../utils/sampleImage';

export function useSourceImage() {
  const [source, setSource] = useState<SourceImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const s = await fileToSource(file);
      setSource(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const loadSample = useCallback(() => {
    setError(null);
    try {
      setSource(makeSampleImage());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const clear = useCallback(() => {
    setSource(null);
    setError(null);
  }, []);

  return { source, error, loadFile, loadSample, clear };
}
