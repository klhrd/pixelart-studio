import type { EngineId } from './types';

export interface EngineMeta {
  id: EngineId;
  code: string;
  name: string;
  tagline: string;
}

export const ENGINES: EngineMeta[] = [
  {
    id: 'moon',
    code: 'A',
    name: 'Moon Phase Halftone',
    tagline: 'Sobel-oriented lunar density field',
  },
  {
    id: 'truchet',
    code: 'B',
    name: 'Truchet Tiling',
    tagline: 'Contrast-woven geometric arcs',
  },
  {
    id: 'voronoi',
    code: 'C',
    name: 'Voronoi / Low-Poly',
    tagline: 'Delaunay feature triangulation',
  },
  {
    id: 'braille',
    code: 'D',
    name: 'Braille Raster',
    tagline: '2x4 dot Unicode density art',
  },
  {
    id: 'dither',
    code: 'E',
    name: 'Error Diffusion',
    tagline: 'Floyd-Steinberg dithering',
  },
];

export function engineMeta(id: EngineId): EngineMeta {
  return ENGINES.find((e) => e.id === id) ?? ENGINES[0];
}
