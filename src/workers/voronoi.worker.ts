import { handle } from './kit';
import { computeVoronoi } from '../algorithms/voronoi';
import type { VoronoiResult, WorkerRequest } from '../types';

handle<WorkerRequest, VoronoiResult>(({ width, height, bytes, settings }) => {
  const r = computeVoronoi(bytes, width, height, settings);
  return {
    result: r,
    transfer: [
      r.coords.buffer,
      r.starts.buffer,
      r.lengths.buffer,
      r.colors.buffer,
    ],
  };
});
