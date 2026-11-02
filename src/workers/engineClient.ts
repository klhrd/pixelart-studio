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
};

export class EngineClient {
  private engine: EngineId;
  private worker: Worker | null = null;
  private nextId = 0;
  private pending = new Map<
    number,
    { resolve: (r: EngineResult) => void; reject: (e: Error) => void }
  >();

  constructor(engine: EngineId) {
    this.engine = engine;
  }

  private ensure(): Worker {
    if (this.worker) return this.worker;
    const worker = new FACTORIES[this.engine]();
    worker.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as WorkerResponse;
      const task = this.pending.get(msg.id);
      if (!task) return;
      this.pending.delete(msg.id);
      if (msg.ok) task.resolve(msg.result as EngineResult);
      else task.reject(new Error(msg.error));
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
    const id = ++this.nextId;
    const bytes = new Uint8ClampedArray(req.bytes);
    const payload: WorkerRequest = { ...req, bytes };
    return new Promise<EngineResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ensure().postMessage({ id, payload }, [bytes.buffer]);
    });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
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
