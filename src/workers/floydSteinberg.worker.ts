import { handle } from './kit';
import { ditherImage } from '../algorithms/floydSteinberg';
import type { DitherResult, WorkerRequest } from '../types';

handle<WorkerRequest, DitherResult>(
  ({ width, height, bytes, settings, palette }) => {
    const r = ditherImage(bytes, width, height, settings, palette);
    return { result: r, transfer: [r.bytes.buffer] };
  },
);
