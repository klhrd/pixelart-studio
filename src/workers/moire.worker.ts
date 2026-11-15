import { handle } from './kit';
import { computeMoire } from '../algorithms/moire';
import type { MoireResult, WorkerRequest } from '../types';

handle<WorkerRequest, MoireResult>(
  ({ width, height, bytes, settings, palette }) => {
    const r = computeMoire(bytes, width, height, settings, palette);
    return { result: r, transfer: [r.bytes.buffer, r.lum.buffer] };
  },
);
