import { handle } from './kit';
import { computeNegative } from '../algorithms/negative';
import type { NegativeResult, WorkerRequest } from '../types';

handle<WorkerRequest, NegativeResult>(({ width, height, bytes, settings }) => {
  const r = computeNegative(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
