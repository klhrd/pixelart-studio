import { handle } from './kit';
import { computePixelate } from '../algorithms/pixelate';
import type { PixelateResult, WorkerRequest } from '../types';

handle<WorkerRequest, PixelateResult>(({ width, height, bytes, settings }) => {
  const r = computePixelate(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
