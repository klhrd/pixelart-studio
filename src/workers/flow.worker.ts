import { handle } from './kit';
import { computeFlowField } from '../algorithms/flowField';
import type { FlowResult, WorkerRequest } from '../types';

handle<WorkerRequest, FlowResult>(({ width, height, bytes, settings }) => {
  const r = computeFlowField(bytes, width, height, settings);
  return {
    result: r,
    transfer: [r.coords.buffer, r.starts.buffer, r.lengths.buffer, r.shade.buffer],
  };
});
