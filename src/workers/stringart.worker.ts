import { handle } from './kit';
import { computeStringArt } from '../algorithms/stringArt';
import type { StringArtResult, WorkerRequest } from '../types';

handle<WorkerRequest, StringArtResult>(({ width, height, bytes, settings }) => {
  const r = computeStringArt(bytes, width, height, settings);
  return {
    result: r,
    transfer: [
      r.anchorsX.buffer,
      r.anchorsY.buffer,
      r.linesX1.buffer,
      r.linesY1.buffer,
      r.linesX2.buffer,
      r.linesY2.buffer,
    ],
  };
});
