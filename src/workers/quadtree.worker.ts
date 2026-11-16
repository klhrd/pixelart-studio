import { handle } from './kit';
import { computeQuadtree } from '../algorithms/quadtree';
import type { DitherResult, WorkerRequest } from '../types';

handle<WorkerRequest, DitherResult>(({ width, height, bytes, settings }) => {
  const r = computeQuadtree(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
