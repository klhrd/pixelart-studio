import { handle } from './kit';
import { computeScanline } from '../algorithms/scanline';
import type { DitherResult, WorkerRequest } from '../types';

handle<WorkerRequest, DitherResult>(({ width, height, bytes, settings }) => {
  const r = computeScanline(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
