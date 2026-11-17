import type { EngineId } from './types';

export interface EngineMeta {
  id: EngineId;
  code: string;
  name: string;
  tagline: string;
  category: string;
}

export const ENGINES: EngineMeta[] = [
  {
    id: 'moon',
    code: 'A',
    name: 'Moon Phase Halftone',
    tagline: 'Sobel-oriented lunar density field',
    category: 'Halftone',
  },
  {
    id: 'truchet',
    code: 'B',
    name: 'Truchet Tiling',
    tagline: 'Contrast-woven geometric arcs',
    category: 'Geometry',
  },
  {
    id: 'voronoi',
    code: 'C',
    name: 'Voronoi / Low-Poly',
    tagline: 'Delaunay feature triangulation',
    category: 'Geometry',
  },
  {
    id: 'braille',
    code: 'D',
    name: 'Braille Raster',
    tagline: '2x4 dot Unicode density art',
    category: 'Halftone',
  },
  {
    id: 'dither',
    code: 'E',
    name: 'Error Diffusion',
    tagline: 'Floyd-Steinberg dithering',
    category: 'Halftone',
  },
  {
    id: 'stipple',
    code: 'F',
    name: 'Stippling',
    tagline: 'Weighted Voronoi point painting',
    category: 'Paint',
  },
  {
    id: 'flow',
    code: 'G',
    name: 'Flow Field',
    tagline: 'Gradient streamline particles',
    category: 'Paint',
  },
  {
    id: 'scanline',
    code: 'H',
    name: 'Scanline CRT',
    tagline: 'Retro glitch halftone',
    category: 'Glitch',
  },
  {
    id: 'hanzi',
    code: 'I',
    name: 'Hanzi Glyphs',
    tagline: 'Stroke-density character map',
    category: 'Text',
  },
  {
    id: 'hexdump',
    code: 'J',
    name: 'Hex Dump',
    tagline: 'Pixel values as raw hex codes',
    category: 'Text',
  },
  {
    id: 'benday',
    code: 'K',
    name: 'Ben-Day Dots',
    tagline: 'CMYK comic print screens',
    category: 'Halftone',
  },
  {
    id: 'wave',
    code: 'L',
    name: 'Wave Interference',
    tagline: 'Luminance-modulated sine field',
    category: 'Lines',
  },
  {
    id: 'contour',
    code: 'M',
    name: 'Topographic Map',
    tagline: 'Marching squares contour lines',
    category: 'Lines',
  },
  {
    id: 'stringart',
    code: 'N',
    name: 'String Art',
    tagline: 'Greedy nail-and-thread portrait',
    category: 'Lines',
  },
  {
    id: 'turing',
    code: 'O',
    name: 'Turing Patterns',
    tagline: 'Gray-Scott reaction-diffusion',
    category: 'Glitch',
  },
  {
    id: 'pixelsort',
    code: 'P',
    name: 'Pixel Sorting',
    tagline: 'Cyberpunk glitch sort',
    category: 'Glitch',
  },
  {
    id: 'hatch',
    code: 'Q',
    name: 'Cross-Hatching',
    tagline: 'Layered engraving linework',
    category: 'Lines',
  },
  {
    id: 'glyphs',
    code: 'R',
    name: 'Glyph Halftone',
    tagline: 'Custom shapes scaled by luminance',
    category: 'Halftone',
  },
  {
    id: 'moire',
    code: 'S',
    name: 'Moiré Interference',
    tagline: 'Op-art optical phase patterns',
    category: 'Geometry',
  },
  {
    id: 'kaleidoscope',
    code: 'T',
    name: 'Kaleidoscope',
    tagline: 'Radial wedge mirror symmetry',
    category: 'Geometry',
  },
  {
    id: 'quadtree',
    code: 'U',
    name: 'Quadtree Mosaic',
    tagline: 'Adaptive recursive subdivision',
    category: 'Geometry',
  },
  {
    id: 'chladni',
    code: 'V',
    name: 'Chladni Patterns',
    tagline: 'Resonant nodal-line figures',
    category: 'Geometry',
  },
  {
    id: 'ascii',
    code: 'W',
    name: 'ASCII Art',
    tagline: 'Brightness-mapped character ramp',
    category: 'Text',
  },
  {
    id: 'posterize',
    code: 'X',
    name: 'Posterize',
    tagline: 'Luminance banded color reduction',
    category: 'Halftone',
  },
  {
    id: 'edge',
    code: 'Y',
    name: 'Edge Detection',
    tagline: 'Sobel gradient edge lines',
    category: 'Lines',
  },
];

export const ENGINE_CATEGORIES: string[] = ['Halftone', 'Geometry', 'Text', 'Lines', 'Paint', 'Glitch'];

export function engineMeta(id: EngineId): EngineMeta {
  return ENGINES.find((e) => e.id === id) ?? ENGINES[0];
}

export const ANIMATABLE_ENGINES: EngineId[] = [
  'moon', 'wave', 'moire', 'truchet', 'benday', 'hatch', 'contour', 'glyphs',
  'flow', 'voronoi',
];
