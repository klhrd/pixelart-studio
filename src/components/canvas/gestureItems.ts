import type { EngineId } from '../../types';
import { BLEND_MODES } from '../../renderers/composite';
import type { GestureChoice, GestureItem } from '../../hooks/useGestureControls';

export const GENERAL_GESTURE_ITEMS: GestureItem[] = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, group: 'general' },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, group: 'general' },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, group: 'general' },
  {
    key: 'maskShape', label: 'Mask', min: 0, max: 1, step: 1, group: 'general',
    choices: [
      { value: 'none', label: 'None' },
      { value: 'ellipse', label: 'Ellipse' },
      { value: 'rect', label: 'Rect' },
      { value: 'linear', label: 'Linear' },
      { value: 'brush', label: 'Brush' },
    ],
  },
  { key: 'maskX', label: 'Mask X', min: 0, max: 1, step: 0.02, group: 'general' },
  { key: 'maskY', label: 'Mask Y', min: 0, max: 1, step: 0.02, group: 'general' },
  { key: 'maskSize', label: 'Mask Size', min: 0.05, max: 1, step: 0.02, group: 'general' },
  { key: 'maskFeather', label: 'Mask Feather', min: 0, max: 1, step: 0.02, group: 'general' },
  { key: 'maskInvert', label: 'Mask Invert', min: 0, max: 1, step: 1, group: 'general', toggle: true },
  { key: 'maskBrushSize', label: 'Brush size', min: 0.02, max: 0.3, step: 0.01, group: 'general' },
  { key: 'maskErase', label: 'Erase', min: 0, max: 1, step: 1, group: 'general', toggle: true },
  {
    key: 'blendMode', label: 'Blend Mode', min: 0, max: 1, step: 1, group: 'general',
    choices: BLEND_MODES.map((m) => ({ value: m.value, label: m.label })),
  },
  { key: 'blendOpacity', label: 'Blend Opacity', min: 0, max: 1, step: 0.05, group: 'general' },
];

const GLYPH_SHAPE_CHOICES: GestureChoice[] = [
  { value: 'star', label: 'Star' },
  { value: 'cross', label: 'Cross' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Tri' },
  { value: 'square', label: 'Square' },
  { value: 'smiley', label: 'Smiley' },
];

export const ENGINE_GESTURE_ITEMS: Record<string, GestureItem[]> = {
  moon: [
    { key: 'cellSize', label: 'Cell Size', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'edgeSensitivity', label: 'Edge Sensitivity', min: 0, max: 1, step: 0.05, group: 'engine' },
    { key: 'moonEdgeBias', label: 'Edge Bias', min: 0, max: 1, step: 0.05, group: 'engine' },
    { key: 'animOffset', label: 'Phase Offset', min: 0, max: 1, step: 0.01, group: 'engine' },
    { key: 'animSpeed', label: 'Animation Speed', min: 0.05, max: 1, step: 0.05, group: 'engine' },
    { key: 'staggered', label: 'Staggered Grid', min: 0, max: 1, step: 1, group: 'engine', toggle: true },
    { key: 'animate', label: 'Animate Phase', min: 0, max: 1, step: 1, group: 'engine', toggle: true },
  ],
  truchet: [
    { key: 'cellSize', label: 'Cell Size', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'strokeWidth', label: 'Stroke Width', min: 0.1, max: 0.9, step: 0.01, group: 'engine' },
    { key: 'blankThreshold', label: 'Blank Threshold', min: 0, max: 1, step: 0.05, group: 'engine' },
  ],
  voronoi: [
    { key: 'cellSize', label: 'Cell Size', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'pointDensity', label: 'Edge Site Bias', min: 0, max: 150, step: 5, group: 'engine' },
    { key: 'edgeWidth', label: 'Edge Width', min: 0, max: 4, step: 0.5, group: 'engine' },
    {
      key: 'voronoiMode', label: 'Mode', min: 0, max: 1, step: 1, group: 'engine',
      choices: [
        { value: 'voronoi', label: 'Voronoi' },
        { value: 'delaunay', label: 'Delaunay' },
      ],
    },
  ],
  braille: [
    { key: 'cellSize', label: 'Cell Size', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'threshold', label: 'Threshold', min: 1, max: 254, step: 1, group: 'engine' },
    { key: 'invert', label: 'Invert', min: 0, max: 1, step: 1, group: 'engine', toggle: true },
  ],
  dither: [
    { key: 'cellSize', label: 'Pixel Size', min: 14, max: 48, step: 1, group: 'engine' },
    { key: 'serpentine', label: 'Serpentine Scan', min: 0, max: 1, step: 1, group: 'engine', toggle: true },
  ],
  stipple: [
    { key: 'cellSize', label: 'Cell Size', min: 1, max: 48, step: 1, group: 'engine' },
    { key: 'stippleSize', label: 'Dot Size', min: 0.2, max: 4, step: 0.1, group: 'engine' },
    { key: 'stippleSteps', label: 'Relax Steps', min: 1, max: 20, step: 1, group: 'engine' },
  ],
  flow: [
    { key: 'cellSize', label: 'Cell Size', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'flowParticles', label: 'Particles', min: 500, max: 8000, step: 100, group: 'engine' },
    { key: 'flowSteps', label: 'Trace Length', min: 10, max: 120, step: 2, group: 'engine' },
    { key: 'flowNoise', label: 'Noise Blend', min: 0, max: 1, step: 0.05, group: 'engine' },
  ],
  scanline: [
    { key: 'cellSize', label: 'Scan Pitch', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'scanGlow', label: 'Glow', min: 0, max: 1, step: 0.05, group: 'engine' },
    { key: 'scanAberration', label: 'Aberration', min: 0, max: 10, step: 0.5, group: 'engine' },
    { key: 'scanGlitch', label: 'Glitch', min: 0, max: 1, step: 0.05, group: 'engine' },
  ],
  hanzi: [
    { key: 'cellSize', label: 'Glyph Size', min: 6, max: 48, step: 1, group: 'engine' },
    { key: 'blankThreshold', label: 'Blank Above', min: 0, max: 1, step: 0.05, group: 'engine' },
  ],
  hexdump: [
    { key: 'cellSize', label: 'Font Size', min: 2, max: 32, step: 1, group: 'engine' },
  ],
  benday: [
    { key: 'cellSize', label: 'Screen Pitch', min: 3, max: 32, step: 1, group: 'engine' },
    { key: 'bendayScale', label: 'Dot Scale', min: 0.4, max: 1.1, step: 0.05, group: 'engine' },
  ],
  wave: [
    { key: 'cellSize', label: 'Line Spacing', min: 4, max: 48, step: 1, group: 'engine' },
    { key: 'waveAmp', label: 'Amplitude', min: 0.1, max: 1.5, step: 0.05, group: 'engine' },
    { key: 'waveFreq', label: 'Wavelength', min: 2, max: 24, step: 1, group: 'engine' },
  ],
  contour: [
    { key: 'cellSize', label: 'Smoothing', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'contourLevels', label: 'Levels', min: 4, max: 20, step: 1, group: 'engine' },
  ],
  stringart: [
    { key: 'cellSize', label: 'Line Width', min: 3, max: 30, step: 1, group: 'engine' },
    { key: 'stringPoints', label: 'Nails', min: 20, max: 300, step: 10, group: 'engine' },
    { key: 'stringLines', label: 'Threads', min: 100, max: 8000, step: 100, group: 'engine' },
  ],
  turing: [
    { key: 'turingFrames', label: 'Frames', min: 10, max: 300, step: 10, group: 'engine' },
    { key: 'turingFeed', label: 'Feed', min: 0.01, max: 0.1, step: 0.005, group: 'engine' },
    { key: 'turingKill', label: 'Kill', min: 0.01, max: 0.1, step: 0.005, group: 'engine' },
  ],
  pixelsort: [
    { key: 'pixelSortThreshold', label: 'Threshold', min: 0, max: 254, step: 2, group: 'engine' },
    {
      key: 'pixelSortDirection', label: 'Direction', min: 0, max: 1, step: 1, group: 'engine',
      choices: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
    },
    {
      key: 'pixelSortMode', label: 'Sort Mode', min: 0, max: 1, step: 1, group: 'engine',
      choices: [
        { value: 'asc', label: 'Dark→Bright' },
        { value: 'desc', label: 'Bright→Dark' },
      ],
    },
  ],
  hatch: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 40, step: 1, group: 'engine' },
  ],
  glyphs: [
    { key: 'cellSize', label: 'Cell Size', min: 6, max: 48, step: 1, group: 'engine' },
    { key: 'glyphShape', label: 'Shape', min: 0, max: 1, step: 1, group: 'engine', choices: GLYPH_SHAPE_CHOICES },
  ],
  moire: [
    { key: 'cellSize', label: 'Grating', min: 4, max: 40, step: 1, group: 'engine' },
    { key: 'moireFreq', label: 'Frequency', min: 0.2, max: 4, step: 0.1, group: 'engine' },
    { key: 'moirePhase', label: 'Phase Shift', min: 0, max: 10, step: 0.5, group: 'engine' },
    {
      key: 'moirePattern', label: 'Pattern', min: 0, max: 1, step: 1, group: 'engine',
      choices: [
        { value: 'rings', label: 'Rings' },
        { value: 'lines', label: 'Lines' },
        { value: 'spiral', label: 'Spiral' },
      ],
    },
  ],
  kaleidoscope: [
    { key: 'kaleidoSegments', label: 'Segments', min: 3, max: 16, step: 1, group: 'engine' },
  ],
  quadtree: [
    { key: 'quadtreeDepth', label: 'Detail', min: 1, max: 9, step: 1, group: 'engine' },
  ],
  chladni: [
    { key: 'chladniM', label: 'Mode M', min: 1, max: 12, step: 1, group: 'engine' },
    { key: 'chladniN', label: 'Mode N', min: 1, max: 12, step: 1, group: 'engine' },
  ],
  ascii: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 32, step: 1, group: 'engine' },
  ],
  posterize: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 32, step: 1, group: 'engine' },
    { key: 'posterBands', label: 'Bands', min: 2, max: 16, step: 1, group: 'engine' },
  ],
  edge: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 32, step: 1, group: 'engine' },
    { key: 'edgeThreshold', label: 'Threshold', min: 0, max: 255, step: 1, group: 'engine' },
  ],
  duotone: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 32, step: 1, group: 'engine' },
  ],
  solarize: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 32, step: 1, group: 'engine' },
    { key: 'solarizeThreshold', label: 'Threshold', min: 0, max: 255, step: 1, group: 'engine' },
  ],
  emboss: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 32, step: 1, group: 'engine' },
    { key: 'embossStrength', label: 'Strength', min: 0, max: 4, step: 0.1, group: 'engine' },
  ],
  negative: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 32, step: 1, group: 'engine' },
    { key: 'negativeInvert', label: 'Invert', min: 0, max: 1, step: 1, group: 'engine', toggle: true },
  ],
  pixelate: [
    { key: 'cellSize', label: 'Cell Size', min: 2, max: 32, step: 1, group: 'engine' },
  ],
};

export function getGestureItems(engine: EngineId): GestureItem[] {
  const engineItems =
    ENGINE_GESTURE_ITEMS[engine] ?? ENGINE_GESTURE_ITEMS.moon ?? [];
  return [...GENERAL_GESTURE_ITEMS, ...engineItems];
}
