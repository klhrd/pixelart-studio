import { handle } from './kit';
import { computeEmboss } from '../algorithms/emboss';
import type { EmbossResult, WorkerRequest } from '../types';

handle<WorkerRequest, EmbossResult>(({ width, height, bytes, settings }) => {
  const r = computeEmboss(bytes, width, height, settings);
  return { result: r, transfer: [r.bytes.buffer] };
});
