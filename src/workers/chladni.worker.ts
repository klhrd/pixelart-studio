import { handle } from './kit';
import { computeChladni } from '../algorithms/chladni';
import type { DitherResult, WorkerRequest } from '../types';

handle<WorkerRequest, DitherResult>(
  ({ width, height, bytes, settings, palette }) => {
    const r = computeChladni(bytes, width, height, settings, palette);
    return { result: r, transfer: [r.bytes.buffer] };
  },
);
