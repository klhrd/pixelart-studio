import { handle } from './kit';
import { computeTruchetField } from '../algorithms/truchet';
import type { TruchetResult, WorkerRequest } from '../types';

handle<WorkerRequest, TruchetResult>(({ width, height, bytes, settings }) => {
  const r = computeTruchetField(bytes, width, height, settings);
  return {
    result: r,
    transfer: [r.rotation.buffer, r.luminance.buffer],
  };
});
