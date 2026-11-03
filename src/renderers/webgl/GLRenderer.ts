import type { ProgramInfo } from './types';

export class GLRenderer {
  public gl: WebGLRenderingContext | null = null;
  private programs = new Map<string, WebGLProgram>();
  private programInfos = new Map<string, ProgramInfo>();

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl') ?? null;
  }

  get isSupported(): boolean {
    return this.gl !== null;
  }

  compileShader(source: string, type: number): WebGLShader | null {
    const gl = this.gl;
    if (!gl) return null;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createProgram(name: string, vsSource: string, fsSource: string): WebGLProgram | null {
    const gl = this.gl;
    if (!gl) return null;
    const vertexShader = this.compileShader(vsSource, gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    this.programs.set(name, program);

    const attributes = new Map<string, number>();
    const uniforms = new Map<string, WebGLUniformLocation>();
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      if (info) {
        const location = gl.getAttribLocation(program, info.name);
        attributes.set(info.name, location);
      }
    }
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        const location = gl.getUniformLocation(program, info.name);
        if (location) uniforms.set(info.name, location);
      }
    }

    this.programInfos.set(name, { program, attributes, uniforms });
    return program;
  }

  getProgram(name: string): WebGLProgram | null {
    return this.programs.get(name) ?? null;
  }

  getUniformLocation(programName: string, name: string): WebGLUniformLocation | null {
    const info = this.programInfos.get(programName);
    if (!info) return null;
    const cached = info.uniforms.get(name);
    if (cached !== undefined) return cached;
    const gl = this.gl;
    if (!gl) return null;
    const program = this.getProgram(programName);
    if (!program) return null;
    const location = gl.getUniformLocation(program, name);
    if (location) info.uniforms.set(name, location);
    return location;
  }

  getAttributeLocation(programName: string, name: string): number | null {
    const info = this.programInfos.get(programName);
    if (!info) return null;
    const location = info.attributes.get(name);
    if (location !== undefined) return location;
    const gl = this.gl;
    if (!gl) return null;
    const program = this.getProgram(programName);
    if (!program) return null;
    const location2 = gl.getAttribLocation(program, name);
    if (location2 >= 0) info.attributes.set(name, location2);
    return location2;
  }

  useProgram(name: string): boolean {
    const program = this.programs.get(name);
    if (!program) return false;
    const gl = this.gl;
    if (!gl) return false;
    gl.useProgram(program);
    return true;
  }

  clear(r = 0, g = 0, b = 0, a = 1): void {
    const gl = this.gl;
    if (!gl) return;
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  viewport(x = 0, y = 0, w?: number, h = 0): void {
    const gl = this.gl;
    if (!gl) return;
    const width = w !== undefined ? w : gl.drawingBufferWidth;
    const height = h !== undefined ? h : gl.drawingBufferHeight;
    gl.viewport(x, y, width, height);
  }

  get width(): number {
    return this.gl?.drawingBufferWidth ?? 0;
  }

  get height(): number {
    return this.gl?.drawingBufferHeight ?? 0;
  }

  resize(width: number, height: number): void {
    const gl = this.gl;
    if (!gl) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const displayWidth = Math.floor(width * dpr);
    const displayHeight = Math.floor(height * dpr);
    if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
      gl.canvas.width = displayWidth;
      gl.canvas.height = displayHeight;
    }
  }

  destroy(): void {
    const gl = this.gl;
    if (!gl) return;
    for (const program of this.programs.values()) {
      gl.deleteProgram(program);
    }
    this.programs.clear();
    this.programInfos.clear();
  }
}
