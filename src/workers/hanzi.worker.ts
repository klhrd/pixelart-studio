import { handle } from './kit';
import { computeHanzi } from '../algorithms/hanzi';
import type { HanziResult, WorkerRequest } from '../types';

handle<WorkerRequest, HanziResult>(({ width, height, bytes, settings }) => {
  const r = computeHanzi(bytes, width, height, settings);
  return { result: r, transfer: [r.chars.buffer, r.luma.buffer] };
});
