import { handle } from './kit';
import { computeTuring } from '../algorithms/turing';
import type { TuringResult, WorkerRequest } from '../types';

handle<WorkerRequest, TuringResult>(({ width, height, bytes, settings }) => {
  const r = computeTuring(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
