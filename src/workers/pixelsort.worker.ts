import { handle } from './kit';
import { computePixelSort } from '../algorithms/pixelSort';
import type { PixelSortResult, WorkerRequest } from '../types';

handle<WorkerRequest, PixelSortResult>(({ width, height, bytes, settings }) => {
  const r = computePixelSort(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
