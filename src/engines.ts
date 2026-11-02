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
  {
    id: 'stipple',
    code: 'F',
    name: 'Stippling',
    tagline: 'Weighted Voronoi point painting',
  },
  {
    id: 'flow',
    code: 'G',
    name: 'Flow Field',
    tagline: 'Gradient streamline particles',
  },
  {
    id: 'scanline',
    code: 'H',
    name: 'Scanline CRT',
    tagline: 'Retro glitch halftone',
  },
  {
    id: 'hanzi',
    code: 'I',
    name: 'Hanzi Glyphs',
    tagline: 'Stroke-density character map',
  },
  {
    id: 'hexdump',
    code: 'J',
    name: 'Hex Dump',
    tagline: 'Pixel values as raw hex codes',
  },
  {
    id: 'benday',
    code: 'K',
    name: 'Ben-Day Dots',
    tagline: 'CMYK comic print screens',
  },
  {
    id: 'wave',
    code: 'L',
    name: 'Wave Interference',
    tagline: 'Luminance-modulated sine field',
  },
  {
    id: 'contour',
    code: 'M',
    name: 'Topographic Map',
    tagline: 'Marching squares contour lines',
  },
  {
    id: 'stringart',
    code: 'N',
    name: 'String Art',
    tagline: 'Greedy nail-and-thread portrait',
  },
  {
    id: 'turing',
    code: 'O',
    name: 'Turing Patterns',
    tagline: 'Gray-Scott reaction-diffusion',
  },
  {
    id: 'pixelsort',
    code: 'P',
    name: 'Pixel Sorting',
    tagline: 'Cyberpunk glitch sort',
  },
];

export function engineMeta(id: EngineId): EngineMeta {
  return ENGINES.find((e) => e.id === id) ?? ENGINES[0];
}
