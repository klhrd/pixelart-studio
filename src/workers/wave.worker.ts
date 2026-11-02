import { handle } from './kit';
import { computeWave } from '../algorithms/wave';
import type { WaveResult, WorkerRequest } from '../types';

handle<WorkerRequest, WaveResult>(({ width, height, bytes, settings }) => {
  const r = computeWave(bytes, width, height, settings);
  return { result: r, transfer: [r.colLum.buffer] };
});
