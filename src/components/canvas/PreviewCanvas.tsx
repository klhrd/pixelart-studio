import { useCallback, useEffect, useRef } from 'react';
import type {
  EngineId,
  EngineResult,
  ProcessorStatus,
  Settings,
  SourceImage,
} from '../../types';
import { renderResult } from '../../renderers';

interface PreviewCanvasProps {
  source: SourceImage;
  engine: EngineId;
  result: EngineResult | null;
  status: ProcessorStatus;
  settings: Settings;
  palette: string[];
}

export function PreviewCanvas({
  source,
  engine,
  result,
  status,
  settings,
  palette,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== source.width) canvas.width = source.width;
    if (canvas.height !== source.height) canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!result) {
      ctx.fillStyle = '#0b0b0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    renderResult(
      engine,
      ctx,
      result,
      settingsRef.current,
      palette,
      source.width,
      source.height,
    );
  }, [engine, result, palette, source]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (engine !== 'moon' || !settings.animate) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      const s = settingsRef.current;
      settingsRef.current = {
        ...s,
        animOffset: (s.animOffset + dt * s.animSpeed) % 1,
      };
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, settings.animate, draw]);

  const pixelated = engine === 'dither' || engine === 'braille';

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        className={`max-h-full max-w-full rounded-lg border border-zinc-800 shadow-2xl shadow-black/50 ${
          pixelated ? '[image-rendering:pixelated]' : ''
        }`}
      />
      {status === 'processing' && (
        <span className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-zinc-900/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Computing
        </span>
      )}
    </div>
  );
}
