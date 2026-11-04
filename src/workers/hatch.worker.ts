import { handle } from './kit';
import { computeCrossHatch } from '../algorithms/crossHatch';
import type { HatchResult, WorkerRequest } from '../types';

handle<WorkerRequest, HatchResult>(({ width, height, bytes, settings }) => {
  const r = computeCrossHatch(bytes, width, height, settings);
  return { result: r, transfer: [r.luminance.buffer] };
});
