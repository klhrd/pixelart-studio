import { handle } from './kit';
import { computeGlyphs } from '../algorithms/glyphs';
import type { GlyphResult, WorkerRequest } from '../types';

handle<WorkerRequest, GlyphResult>(({ width, height, bytes, settings }) => {
  const r = computeGlyphs(bytes, width, height, settings);
  return { result: r, transfer: [r.luminance.buffer] };
});
