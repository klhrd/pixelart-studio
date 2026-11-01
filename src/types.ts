export type EngineId = 'moon' | 'truchet' | 'voronoi' | 'braille' | 'dither';

export type VoronoiMode = 'voronoi' | 'delaunay';

export interface Settings {
  cellSize: number;
  contrast: number;
  brightness: number;
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

export type EngineResult =
  | MoonResult
  | TruchetResult
  | VoronoiResult
  | BrailleResult
  | DitherResult;

export type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string };

export type ProcessorStatus = 'idle' | 'processing' | 'ready' | 'error';
