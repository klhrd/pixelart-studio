import { handle } from './kit';
import { computePosterize } from '../algorithms/posterize';
import type { PosterizeResult, WorkerRequest } from '../types';

handle<WorkerRequest, PosterizeResult>(({ width, height, bytes, settings, palette }) => {
  const r = computePosterize(bytes, width, height, settings, palette);
  return { result: r, transfer: [r.bytes.buffer] };
});
