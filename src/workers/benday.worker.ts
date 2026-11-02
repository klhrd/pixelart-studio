import { handle } from './kit';
import { computeBenday } from '../algorithms/benday';
import type { BendayResult, WorkerRequest } from '../types';

handle<WorkerRequest, BendayResult>(({ width, height, bytes, settings }) => {
  const r = computeBenday(bytes, width, height, settings);
  return {
    result: r,
    transfer: [r.c.buffer, r.m.buffer, r.y.buffer, r.k.buffer],
  };
});
