import { handle } from './kit';
import { computeContour } from '../algorithms/contour';
import type { ContourResult, WorkerRequest } from '../types';

handle<WorkerRequest, ContourResult>(({ width, height, bytes, settings }) => {
  const r = computeContour(bytes, width, height, settings);
  return { result: r, transfer: [r.segs.buffer, r.level.buffer] };
});
