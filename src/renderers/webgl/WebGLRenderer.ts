/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  MoonResult,
  TruchetResult,
  VoronoiResult,
  BrailleResult,
  StippleResult,
  DitherResult,
  FlowResult,
  HexDumpResult,
  BendayResult,
  WaveResult,
  ContourResult,
  StringArtResult,
  TuringResult,
  PixelSortResult,
} from './types';
import { GLRenderer } from './GLRenderer';
import { SHADERS } from './shaders';

export class WebGLRenderer {
  private glRenderer: GLRenderer | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.glRenderer = new GLRenderer(canvas);
  }

  get isSupported(): boolean {
    return this.glRenderer?.isSupported ?? false;
  }

  get gl(): WebGLRenderingContext | null {
    return this.glRenderer?.gl ?? null;
  }

  getProgram(name: string): WebGLProgram | null {
    return this.glRenderer?.getProgram(name) ?? null;
  }

  initEngine(engineId: string): boolean {
    if (!this.glRenderer) return false;
    const shader = SHADERS[engineId];
    if (!shader) return false;

    const program = this.glRenderer.createProgram(
      engineId,
      shader.vertex,
      shader.fragment
    );
    return program !== null;
  }

  renderMoon(
    _res: MoonResult,
    _settings: Record<string, any>,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('moon');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderTruchet(
    _res: TruchetResult,
    _settings: Record<string, any>,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('truchet');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderVoronoi(
    _res: VoronoiResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('voronoi');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderBraille(
    _res: BrailleResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('braille');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderStipple(
    _res: StippleResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('stipple');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderDither(
    _res: DitherResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('dither');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderTuring(
    _res: TuringResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('turing');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderFlow(
    _res: FlowResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('flow');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderHexDump(
    _res: HexDumpResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('hexdump');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderBenday(
    _res: BendayResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('benday');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderWave(
    _res: WaveResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('wave');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderContour(
    _res: ContourResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('contour');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderStringArt(
    _res: StringArtResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('stringart');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  renderPixelSort(
    _res: PixelSortResult,
    _settings: any,
    _palette: string[],
    _width: number,
    _height: number
  ): void {
    const gl = this.glRenderer?.gl;
    const program = this.glRenderer?.getProgram('pixelsort');
    if (gl && program) {
      gl.useProgram(program);
    }
  }

  resize(width: number, height: number): void {
    this.glRenderer?.resize(width, height);
    this.gl?.viewport(0, 0, width, height);
  }

  dispose(): void {
    this.glRenderer?.destroy();
  }
}
