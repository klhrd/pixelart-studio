import MoonWorker from './moonPhase.worker?worker';
import TruchetWorker from './truchet.worker?worker';
import VoronoiWorker from './voronoi.worker?worker';
import BrailleWorker from './braille.worker?worker';
import FloydSteinbergWorker from './floydSteinberg.worker?worker';
import StippleWorker from './stipple.worker?worker';
import FlowWorker from './flow.worker?worker';
import ScanlineWorker from './scanline.worker?worker';
import HanziWorker from './hanzi.worker?worker';
import HexDumpWorker from './hexdump.worker?worker';
import BendayWorker from './benday.worker?worker';
import WaveWorker from './wave.worker?worker';
import ContourWorker from './contour.worker?worker';
import StringartWorker from './stringart.worker?worker';
import TuringWorker from './turing.worker?worker';
import PixelsortWorker from './pixelsort.worker?worker';
import HatchWorker from './hatch.worker?worker';
import GlyphsWorker from './glyphs.worker?worker';
import MoireWorker from './moire.worker?worker';
import KaleidoscopeWorker from './kaleidoscope.worker?worker';
import type {
  EngineId,
  EngineResult,
  WorkerRequest,
  WorkerResponse,
} from '../types';

type WorkerFactory = new () => Worker;

const FACTORIES: Record<EngineId, WorkerFactory> = {
  moon: MoonWorker,
  truchet: TruchetWorker,
  voronoi: VoronoiWorker,
  braille: BrailleWorker,
  dither: FloydSteinbergWorker,
  stipple: StippleWorker,
  flow: FlowWorker,
  scanline: ScanlineWorker,
  hanzi: HanziWorker,
  hexdump: HexDumpWorker,
  benday: BendayWorker,
  wave: WaveWorker,
  contour: ContourWorker,
  stringart: StringartWorker,
  turing: TuringWorker,
  pixelsort: PixelsortWorker,
  hatch: HatchWorker,
  glyphs: GlyphsWorker,
  moire: MoireWorker,
  kaleidoscope: KaleidoscopeWorker,
};

const CACHE_MAX = 8;

/** Cheap content signature of the source pixels so the cache never collides
 *  across different images (important for batch / loading a new image). */
function sourceSignature(req: WorkerRequest): string {
  const bytes = req.bytes;
  const len = bytes.length;
  let h = (len ^ 0x9e3779b9) >>> 0;
  const step = Math.max(1, Math.floor(len / 512));
  for (let i = 0; i < len; i += step) {
    h = (Math.imul(h ^ bytes[i], 2654435761) >>> 0);
  }
  if (len > 0) h = (Math.imul(h ^ bytes[len - 1], 40503) >>> 0);
  return `${req.width}x${req.height}:${len}:${h}`;
}

export class EngineClient {
  private engine: EngineId;
  private worker: Worker | null = null;
  private nextId = 0;
  private cache = new Map<string, EngineResult>();
  private pending = new Map<
    number,
    {
      key: string;
      resolve: (r: EngineResult) => void;
      reject: (e: Error) => void;
    }
  >();

  constructor(engine: EngineId) {
    this.engine = engine;
  }

  private remember(key: string, result: EngineResult): void {
    this.cache.set(key, result);
    while (this.cache.size > CACHE_MAX) {
      const oldest = this.cache.keys().next().value;
      if (oldest === undefined) break;
      this.cache.delete(oldest);
    }
  }

  private ensure(): Worker {
    if (this.worker) return this.worker;
    const worker = new FACTORIES[this.engine]();
    worker.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as WorkerResponse;
      const task = this.pending.get(msg.id);
      if (!task) return;
      this.pending.delete(msg.id);
      if (msg.ok) {
        const result = msg.result as EngineResult;
        this.remember(task.key, result);
        task.resolve(result);
      } else {
        task.reject(new Error(msg.error));
      }
    };
    worker.onerror = (ev) => {
      const err = new Error(ev.message || 'Worker error');
      for (const task of this.pending.values()) task.reject(err);
      this.pending.clear();
    };
    this.worker = worker;
    return worker;
  }

  run(req: WorkerRequest): Promise<EngineResult> {
    const key = `${sourceSignature(req)}|${JSON.stringify({ s: req.settings, p: req.palette })}`;
    const cached = this.cache.get(key);
    if (cached) return Promise.resolve(cached);

    const id = ++this.nextId;
    const bytes = new Uint8ClampedArray(req.bytes);
    const payload: WorkerRequest = { ...req, bytes };
    return new Promise<EngineResult>((resolve, reject) => {
      this.pending.set(id, { key, resolve, reject });
      this.ensure().postMessage({ id, payload }, [bytes.buffer]);
    });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.cache.clear();
    const err = new Error('Worker disposed');
    for (const task of this.pending.values()) task.reject(err);
    this.pending.clear();
  }
}

const CLIENTS = new Map<EngineId, EngineClient>();

export function getClient(engine: EngineId): EngineClient {
  let client = CLIENTS.get(engine);
  if (!client) {
    client = new EngineClient(engine);
    CLIENTS.set(engine, client);
  }
  return client;
}

export function disposeAllClients(): void {
  for (const client of CLIENTS.values()) client.dispose();
  CLIENTS.clear();
}
