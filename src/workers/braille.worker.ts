import { handle } from './kit';
import { computeBraille } from '../algorithms/braille';
import type { BrailleResult, WorkerRequest } from '../types';

handle<WorkerRequest, BrailleResult>(({ width, height, bytes, settings }) => {
  const r = computeBraille(bytes, width, height, settings);
  return { result: r, transfer: [r.bits.buffer] };
});
