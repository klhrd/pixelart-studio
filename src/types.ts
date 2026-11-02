export type EngineId =
  | 'moon'
  | 'truchet'
  | 'voronoi'
  | 'braille'
  | 'dither'
  | 'stipple'
  | 'flow'
  | 'scanline'
  | 'hanzi';

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

export interface HanziResult {
  cols: number;
  rows: number;
  chars: Uint8Array;
  luma: Float32Array;
}

export type EngineResult =
  | MoonResult
  | TruchetResult
  | VoronoiResult
  | BrailleResult
  | DitherResult
  | StippleResult
  | FlowResult
  | HanziResult;

export type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string };

export type ProcessorStatus = 'idle' | 'processing' | 'ready' | 'error';

export type SheetId = 'engines' | 'adjust' | 'export' | null;
