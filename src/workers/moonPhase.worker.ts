import { handle } from './kit';
import { computeMoonField } from '../algorithms/moonPhase';
import type { MoonResult, WorkerRequest } from '../types';

handle<WorkerRequest, MoonResult>(({ width, height, bytes, settings }) => {
  const r = computeMoonField(bytes, width, height, settings);
  return {
    result: r,
    transfer: [r.phase.buffer, r.angle.buffer, r.magnitude.buffer],
  };
});
