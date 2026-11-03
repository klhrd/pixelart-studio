export interface ProgramInfo {
  program: WebGLProgram;
  attributes: Map<string, number>;
  uniforms: Map<string, WebGLUniformLocation>;
}

export interface WebGLRendererOptions {
  antialias?: boolean;
  alpha?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
}

export interface RenderContext {
  gl: WebGLRenderingContext;
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface EngineRenderer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render(ctx: CanvasRenderingContext2D, result: any, settings: any, palette: string[], width: number, height: number): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderSVG?(result: any, settings: Settings, palette: string[], width: number, height: number): string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webglRender?(gl: WebGLRenderingContext, result: any, settings: any, palette: string[], width: number, height: number): void;
  isSupported?(): boolean;
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

export interface WaveResult {
  colLum: Float32Array;
}

export interface ContourResult {
  coords: Float32Array;
  starts: Uint32Array;
  lengths: Uint32Array;
  colors: Uint8Array;
}

export interface StringArtResult {
  segments: Float32Array;
  count: number;
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


import type { Settings } from '../../types';
