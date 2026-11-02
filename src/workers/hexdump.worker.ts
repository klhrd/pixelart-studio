import { handle } from './kit';
import { computeHexDump } from '../algorithms/hexdump';
import type { HexDumpResult, WorkerRequest } from '../types';

handle<WorkerRequest, HexDumpResult>(({ width, height, bytes, settings }) => {
  const r = computeHexDump(bytes, width, height, settings);
  return { result: r, transfer: [r.rgb.buffer, r.luma.buffer] };
});
