import { handle } from './kit';
import { computeStipple } from '../algorithms/stipple';
import type { StippleResult, WorkerRequest } from '../types';

handle<WorkerRequest, StippleResult>(({ width, height, bytes, settings }) => {
  const r = computeStipple(bytes, width, height, settings);
  return { result: r, transfer: [r.points.buffer, r.radii.buffer] };
});
