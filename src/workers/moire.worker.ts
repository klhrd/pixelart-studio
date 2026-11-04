import { handle } from './kit';
import { computeMoire } from '../algorithms/moire';
import type { DitherResult, WorkerRequest } from '../types';

handle<WorkerRequest, DitherResult>(
  ({ width, height, bytes, settings, palette }) => {
    const r = computeMoire(bytes, width, height, settings, palette);
    return { result: r, transfer: [r.bytes.buffer] };
  },
);
