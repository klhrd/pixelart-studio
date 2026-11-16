import { handle } from './kit';
import { computeKaleidoscope } from '../algorithms/kaleidoscope';
import type { DitherResult, WorkerRequest } from '../types';

handle<WorkerRequest, DitherResult>(({ width, height, bytes, settings }) => {
  const r = computeKaleidoscope(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
