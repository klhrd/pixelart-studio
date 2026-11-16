import { handle } from './kit';
import { computeAscii } from '../algorithms/ascii';
import type { HanziResult, WorkerRequest } from '../types';

handle<WorkerRequest, HanziResult>(({ width, height, bytes, settings }) => {
  const r = computeAscii(bytes, width, height, settings);
  return { result: r, transfer: [r.chars.buffer, r.luma.buffer] };
});
