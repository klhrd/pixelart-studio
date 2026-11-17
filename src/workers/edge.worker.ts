import { handle } from './kit';
import { computeEdge } from '../algorithms/edge';
import type { EdgeResult, WorkerRequest } from '../types';

handle<WorkerRequest, EdgeResult>(({ width, height, bytes, settings, palette }) => {
  const r = computeEdge(bytes, width, height, settings, palette);
  return { result: r, transfer: [r.bytes.buffer] };
});
