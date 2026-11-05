import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  EngineId,
  EngineResult,
  ProcessorStatus,
  Settings,
  SourceImage,
} from '../../types';
import { renderResult } from '../../renderers';
import { useGestureControls } from '../../hooks/useGestureControls';
import type { GestureItem } from '../../hooks/useGestureControls';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { GestureList } from './GestureList';

const MIN_SCALE = 1;
const MAX_SCALE = 8;

const GENERAL_GESTURE_ITEMS: GestureItem[] = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, group: 'general' },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, group: 'general' },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, group: 'general' },
];

const ENGINE_GESTURE_ITEMS: Record<string, GestureItem[]> = {
  moon: [
    { key: 'cellSize', label: 'Cell Size', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'edgeSensitivity', label: 'Edge Sensitivity', min: 0, max: 1, step: 0.05, group: 'engine' },
    { key: 'animOffset', label: 'Phase Offset', min: 0, max: 1, step: 0.01, group: 'engine' },
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
  ],
  braille: [
    { key: 'cellSize', label: 'Cell Size', min: 3, max: 48, step: 1, group: 'engine' },
    { key: 'threshold', label: 'Threshold', min: 1, max: 254, step: 1, group: 'engine' },
  ],
  dither: [
    { key: 'cellSize', label: 'Pixel Size', min: 14, max: 48, step: 1, group: 'engine' },
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
  ],
  hatch: [
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 40, step: 1, group: 'engine' },
  ],
  glyphs: [
    { key: 'cellSize', label: 'Cell Size', min: 6, max: 48, step: 1, group: 'engine' },
  ],
  moire: [
    { key: 'cellSize', label: 'Grating', min: 4, max: 40, step: 1, group: 'engine' },
    { key: 'moireFreq', label: 'Frequency', min: 0.2, max: 4, step: 0.1, group: 'engine' },
    { key: 'moirePhase', label: 'Phase Shift', min: 0, max: 10, step: 0.5, group: 'engine' },
  ],
};

function getGestureItems(engine: EngineId): GestureItem[] {
  const engineItems =
    ENGINE_GESTURE_ITEMS[engine] ?? ENGINE_GESTURE_ITEMS.moon ?? [];
  return [...GENERAL_GESTURE_ITEMS, ...engineItems];
}

interface PreviewCanvasProps {
  source: SourceImage;
  engine: EngineId;
  resultEngine: EngineId | null;
  result: EngineResult | null;
  status: ProcessorStatus;
  settings: Settings;
  palette: string[];
  compare: boolean;
}

export function PreviewCanvas({
  source,
  engine,
  resultEngine,
  result,
  status,
  settings,
  palette,
  compare,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const thumbRef = useRef<HTMLCanvasElement | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const { update: updateSettings } = useSettings();
  const { t } = useI18n();

  const gestureItems = useMemo(() => getGestureItems(engine), [engine]);

  const {
    activeIndex,
    activeItem,
    currentValue,
    isActive,
    direction,
    listOffset,
    startGesture,
    moveGesture,
    endGesture,
  } = useGestureControls(gestureItems, settings, updateSettings, 0);

  const [fit, setFit] = useState({ w: 0, h: 0 });
  const [mmSize, setMmSize] = useState({ w: 72, h: 72 });
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;

  const clampView = useCallback(
    (s: number, x: number, y: number) => {
      const el = containerRef.current;
      if (!el || fit.w === 0) return { s, x, y };
      const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const contentW = fit.w * ns;
      const contentH = fit.h * ns;
      const nx =
        contentW <= cw ? (cw - contentW) / 2 : Math.min(0, Math.max(cw - contentW, x));
      const ny =
        contentH <= ch ? (ch - contentH) / 2 : Math.min(0, Math.max(ch - contentH, y));
      return { s: ns, x: nx, y: ny };
    },
    [fit],
  );

  const resetView = useCallback(() => {
    const el = containerRef.current;
    if (!el || fit.w === 0) return;
    setView({
      s: 1,
      x: (el.clientWidth - fit.w) / 2,
      y: (el.clientHeight - fit.h) / 2,
    });
  }, [fit]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== source.width) canvas.width = source.width;
    if (canvas.height !== source.height) canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (compare && source) {
      ctx.putImageData(new ImageData(source.bytes, source.width, source.height), 0, 0);
      return;
    }
    if (!result || !resultEngine) {
      ctx.fillStyle = '#0b0b0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    renderResult(
      resultEngine,
      ctx,
      result,
      settingsRef.current,
      palette,
      source.width,
      source.height,
    );
  }, [resultEngine, result, palette, source, compare]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (engine !== 'moon' || resultEngine !== 'moon' || !settings.animate)
      return;
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
      drawCanvas();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, resultEngine, settings.animate, drawCanvas]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw === 0 || ch === 0) return;
      const k = Math.min(cw / source.width, ch / source.height);
      const w = Math.max(1, Math.floor(source.width * k));
      const h = Math.max(1, Math.floor(source.height * k));
      setFit({ w, h });
      setView((v) =>
        v.s === 1 ? { s: 1, x: (cw - w) / 2, y: (ch - h) / 2 } : v,
      );
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [source]);

  useEffect(() => {
    const k = Math.min(76 / source.width, 96 / source.height);
    const tw = Math.max(1, Math.round(source.width * k));
    const th = Math.max(1, Math.round(source.height * k));
    const full = document.createElement('canvas');
    full.width = source.width;
    full.height = source.height;
    full
      .getContext('2d')
      ?.putImageData(new ImageData(source.bytes, source.width, source.height), 0, 0);
    const thumb = document.createElement('canvas');
    thumb.width = tw;
    thumb.height = th;
    const tctx = thumb.getContext('2d');
    if (tctx) {
      tctx.imageSmoothingEnabled = true;
      tctx.drawImage(full, 0, 0, tw, th);
    }
    thumbRef.current = thumb;
    setMmSize({ w: tw, h: th });
  }, [source]);

  const drawMinimap = useCallback(() => {
    const mm = minimapRef.current;
    const thumb = thumbRef.current;
    const el = containerRef.current;
    if (!mm || !thumb || !el || fit.w === 0) return;
    if (mm.width !== mmSize.w) mm.width = mmSize.w;
    if (mm.height !== mmSize.h) mm.height = mmSize.h;
    const ctx = mm.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, mm.width, mm.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(thumb, 0, 0, mm.width, mm.height);
    const v = viewRef.current;
    if (v.s <= 1.001) return;
    const k = source.width / fit.w;
    const vx = (-v.x / v.s) * k;
    const vy = (-v.y / v.s) * k;
    const vw = (el.clientWidth / v.s) * k;
    const vh = (el.clientHeight / v.s) * k;
    const mk = mm.width / source.width;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vx * mk, vy * mk, vw * mk, vh * mk);
  }, [mmSize, fit, source]);

  useEffect(() => {
    drawMinimap();
  }, [view, drawMinimap]);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{
    dist: number;
    cx: number;
    cy: number;
    s: number;
    x: number;
    y: number;
  } | null>(null);
  const hadPinch = useRef(false);
  const middlePan = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1) e.preventDefault();
    containerRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      lastPos.current = { x: e.clientX, y: e.clientY };
      if (e.button === 1) {
        middlePan.current = true;
      } else {
        startGesture(e.clientX, e.clientY);
      }
    }
    if (pointers.current.size === 2) {
      endGesture();
      middlePan.current = false;
      const [a, b] = [...pointers.current.values()];
      const v = viewRef.current;
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
        s: v.s,
        x: v.x,
        y: v.y,
      };
      hadPinch.current = true;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const g = pinch.current;
      const ns = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, g.s * (dist / Math.max(1, g.dist))),
      );
      const wx = (g.cx - g.x) / g.s;
      const wy = (g.cy - g.y) / g.s;
      setView(clampView(ns, cx - wx * ns, cy - wy * ns));
    } else if (pointers.current.size === 1) {
      if (middlePan.current) {
        const v = viewRef.current;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setView(clampView(v.s, v.x + dx, v.y + dy));
      } else {
        moveGesture(e.clientX, e.clientY);
      }
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 1) {
      const [p] = pointers.current.values();
      lastPos.current = { x: p.x, y: p.y };
    }
    if (pointers.current.size === 0) {
      endGesture();
      middlePan.current = false;
      if (!hadPinch.current) {
        const now = performance.now();
        if (now - lastTap.current < 300) resetView();
        lastTap.current = now;
      }
      hadPinch.current = false;
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = viewRef.current;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Trackpad two-finger scroll (horizontal dominant): pan
      if (
        !e.ctrlKey &&
        e.deltaX !== 0 &&
        Math.abs(e.deltaX) >= Math.abs(e.deltaY)
      ) {
        setView(clampView(v.s, v.x - e.deltaX, v.y - e.deltaY));
        return;
      }

      // Mouse wheel or trackpad pinch (ctrlKey): zoom around cursor
      const ns = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, v.s * Math.exp(-e.deltaY * 0.0015)),
      );
      const wx = (cx - v.x) / v.s;
      const wy = (cy - v.y) / v.s;
      setView(clampView(ns, cx - wx * ns, cy - wy * ns));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clampView]);

  const pixelated =
    engine === 'dither' || engine === 'braille' || engine === 'scanline';

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="relative h-full w-full touch-none select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: fit.w,
            height: fit.h,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
            transformOrigin: '0 0',
          }}
        >
          <canvas
            ref={canvasRef}
            className={`h-full w-full rounded-lg border border-zinc-800 shadow-2xl shadow-black/50 ${
              pixelated ? '[image-rendering:pixelated]' : ''
            }`}
            aria-label={t('Preview of {engine} styling result', { engine })}
            role="img"
          />
        </div>

        {status === 'processing' && (
          <span className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-zinc-900/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {t('Computing')}
          </span>
        )}

        <div className="absolute bottom-3 left-3 z-10">
          <div className="pointer-events-none rounded-md border border-zinc-700/80 bg-zinc-900/80 p-0.5 shadow-lg shadow-black/40">
            <canvas ref={minimapRef} className="block rounded-sm" aria-hidden="true" />
          </div>
        </div>

        {isActive && direction === 'vertical' && (
          <GestureList
            items={gestureItems}
            listOffset={listOffset}
            activeIndex={activeIndex}
          />
        )}

        {isActive && direction === 'horizontal' && (
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 font-mono text-xs text-zinc-200 backdrop-blur">
              <span className="text-zinc-400">{t(activeItem.label)}</span>
              <span className="font-bold text-emerald-400">
                {activeItem.format
                  ? activeItem.format(currentValue)
                  : Number.isInteger(currentValue)
                    ? currentValue
                    : currentValue.toFixed(2)}
              </span>
            </div>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      ((currentValue - activeItem.min) /
                        Math.max(1e-6, activeItem.max - activeItem.min)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
