import { handle } from './kit';
import { computeSolarize } from '../algorithms/solarize';
import type { SolarizeResult, WorkerRequest } from '../types';

handle<WorkerRequest, SolarizeResult>(({ width, height, bytes, settings }) => {
  const r = computeSolarize(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
