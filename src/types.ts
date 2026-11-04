export type EngineId =
  | 'moon'
  | 'truchet'
  | 'voronoi'
  | 'braille'
  | 'dither'
  | 'stipple'
  | 'flow'
  | 'scanline'
  | 'hanzi'
  | 'hexdump'
  | 'benday'
  | 'wave'
  | 'contour'
  | 'stringart'
  | 'turing'
  | 'pixelsort'
  | 'hatch'
  | 'glyphs'
  | 'moire';

export type VoronoiMode = 'voronoi' | 'delaunay';

export interface Settings {
  cellSize: number;
  contrast: number;
  brightness: number;
  saturation: number;
  paletteId: string;
  edgeSensitivity: number;
  animOffset: number;
  animSpeed: number;
  animate: boolean;
  staggered: boolean;
  seed: number;
  strokeWidth: number;
  blankThreshold: number;
  pointDensity: number;
  voronoiMode: VoronoiMode;
  edgeWidth: number;
  threshold: number;
  invert: boolean;
  serpentine: boolean;
  stippleCount: number;
  stippleSteps: number;
  flowParticles: number;
  flowSteps: number;
  flowNoise: number;
  flowWidth: number;
  scanGlow: number;
  scanAberration: number;
  scanGlitch: number;
  bendayScale: number;
  waveAmp: number;
  waveFreq: number;
  contourLevels: number;
  stringPoints: number;
  stringLines: number;
  turingFrames: number;
  turingFeed: number;
  turingKill: number;
  pixelSortThreshold: number;
  pixelSortDirection: 'horizontal' | 'vertical';
  pixelSortMode: 'asc' | 'desc';
  glyphShape: string;
  moirePattern: 'lines' | 'rings' | 'spiral';
  moireFreq: number;
  moirePhase: number;
}

export interface SourceImage {
  width: number;
  height: number;
  bytes: Uint8ClampedArray;
}

export interface WorkerRequest {
  width: number;
  height: number;
  bytes: Uint8ClampedArray;
  settings: Settings;
  palette: string[];
}

export interface MoonResult {
  cols: number;
  rows: number;
  phase: Float32Array;
  angle: Float32Array;
  magnitude: Float32Array;
}

export interface TruchetResult {
  cols: number;
  rows: number;
  rotation: Uint8Array;
  luminance: Float32Array;
}

export interface VoronoiResult {
  coords: Float32Array;
  starts: Uint32Array;
  lengths: Uint32Array;
  colors: Uint8Array;
}

export interface BrailleResult {
  cols: number;
  rows: number;
  bits: Uint8Array;
}

export interface DitherResult {
  width: number;
  height: number;
  bytes: Uint8ClampedArray;
}

export interface StippleResult {
  points: Float32Array;
  radii: Float32Array;
}

export interface FlowResult {
  coords: Float32Array;
  starts: Uint32Array;
  lengths: Uint32Array;
  shade: Float32Array;
}

export interface HexDumpResult {
  cols: number;
  rows: number;
  rgb: Uint8Array;
  luma: Float32Array;
}

export interface BendayResult {
  c: Float32Array;
  m: Float32Array;
  y: Float32Array;
  k: Float32Array;
}

export interface HanziResult {
  cols: number;
  rows: number;
  chars: Uint8Array;
  luma: Float32Array;
}

export interface WaveResult {
  colLum: Float32Array;
}

export interface ContourResult {
  segs: Float32Array;
  level: Uint8Array;
  levels: number;
}

export interface StringArtResult {
  anchorsX: Float32Array;
  anchorsY: Float32Array;
  linesX1: Float32Array;
  linesY1: Float32Array;
  linesX2: Float32Array;
  linesY2: Float32Array;
  lineCount: number;
}

export interface TuringResult {
  width: number;
  height: number;
  bytes: Uint8ClampedArray;
}

export interface PixelSortResult {
  width: number;
  height: number;
  bytes: Uint8ClampedArray;
}

export interface HatchResult {
  cols: number;
  rows: number;
  luminance: Float32Array;
}

export interface GlyphResult {
  cols: number;
  rows: number;
  luminance: Float32Array;
}

export type EngineResult =
  | MoonResult
  | TruchetResult
  | VoronoiResult
  | BrailleResult
  | DitherResult
  | StippleResult
  | FlowResult
  | HanziResult
  | HexDumpResult
  | BendayResult
  | WaveResult
  | ContourResult
  | StringArtResult
  | TuringResult
  | PixelSortResult
  | HatchResult
  | GlyphResult;

export type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string };

export type ProcessorStatus = 'idle' | 'processing' | 'ready' | 'error';

export type SheetId = 'engines' | 'adjust' | 'export' | null;
