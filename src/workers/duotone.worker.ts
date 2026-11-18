import { handle } from './kit';
import { computeDuotone } from '../algorithms/duotone';
import type { DuotoneResult, WorkerRequest } from '../types';

handle<WorkerRequest, DuotoneResult>(({ width, height, bytes, settings }) => {
  const r = computeDuotone(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
