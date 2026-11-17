import { Component, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { DropZone } from './components/canvas/DropZone';
import { TuneSheet } from './components/controls/TuneSheet';
import { CustomPaletteSheet } from './components/controls/CustomPaletteSheet';
import { EngineSheet } from './components/controls/EngineSheet';
import { ExportSheet } from './components/controls/ExportSheet';
import { BottomBar } from './components/layout/BottomBar';
import { PwaPrompts } from './components/layout/PwaPrompts';
import { AppMenu } from './components/layout/AppMenu';
import { Sheet } from './components/layout/Sheet';
import { TopBar } from './components/layout/TopBar';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useLayerResults } from './hooks/useLayerResults';
import { useSourceImage } from './hooks/useSourceImage';
import { SettingsProvider } from './store/settings';
import { useSettings } from './store/settingsContext';
import { I18nProvider } from './i18n';
import { useI18n } from './i18n/core';
import {
  copyImageToClipboard,
  exportAnimationGif,
  exportAnimationWebM,
  exportRaster,
  isAnimationExportSupported,
  renderResultBlob,
} from './utils/exportImage';
import type { ExportFormat } from './utils/exportImage';
import { exportSvg, composeSvg } from './utils/exportSvg';
import { renderSVG } from './renderers';
import { parseShareHash } from './utils/shareLink';
import { paletteById } from './algorithms/palettes';
import type { EngineId, SheetId, SourceImage } from './types';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          message={this.state.error.message}
          onReset={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <p className="font-mono text-sm text-red-400">
          {t('Render error')}: {message}
        </p>
        <button type="button" className="btn mt-4" onClick={onReset}>
          {t('Reload View')}
        </button>
      </div>
    </div>
  );
}

function Studio() {
  const { t, lang, toggle } = useI18n();
  const {
    engine,
    setEngine,
    settings,
    palette,
    update,
    saveCustomPalette,
    undo,
    redo,
    reset,
    setCustomSheetOpen,
    addSnapshot,
    allPalettes,
  } = useSettings();
  const resolvePalette = useCallback(
    (paletteId: string | undefined) =>
      paletteById(paletteId ?? settings.paletteId, allPalettes).colors,
    [allPalettes, settings.paletteId],
  );
  const { source, error: loadError, loadFile, loadSample } = useSourceImage();
  const { result, resultEngine, status, error } = useImageProcessor(
    source,
    engine,
    settings,
    palette,
  );
  const layers = useLayerResults(source, settings.layers, settings, resolvePalette);
  useEffect(() => {
    if (!source || !result || status !== 'ready') return;
    const key = JSON.stringify({ engine, settings });
    if (key === snapKey.current) return;
    const timer = setTimeout(() => {
      snapKey.current = key;
      const maxSide = Math.max(source.width, source.height);
      const scale = Math.min(1, 96 / maxSide);
      renderResultBlob(source, engine, result, settings, palette, {
        scale,
        format: 'jpeg',
        quality: 0.6,
        transparent: false,
        layers,
      })
        .then(
          (blob) =>
            new Promise<string>((resolve) => {
              const fr = new FileReader();
              fr.onload = () => resolve(fr.result as string);
              fr.readAsDataURL(blob);
            }),
        )
        .then((dataUrl) => addSnapshot(engine, settings, dataUrl))
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [source, result, status, engine, settings, palette, layers, addSnapshot]);

  const [exportScale, setExportScale] = useState(2);
  const [exportName, setExportName] = useState('pixelcraft');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState(0.92);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [sheet, setSheet] = useState<SheetId>(null);
  const [compare, setCompare] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snapKey = useRef('');

  useEffect(() => {
    const shared = parseShareHash(location.hash);
    if (!shared) return;
    if (shared.custom) {
      saveCustomPalette(shared.custom.colors, shared.custom.name);
    }
    if (shared.settings) update(shared.settings);
    if (shared.engine) setEngine(shared.engine);
    history.replaceState(null, '', location.pathname + location.search);
  }, [saveCustomPalette, update, setEngine]);

  const closeSheet = () => setSheet(null);

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleExport = useCallback(() => {
    if (source && result && status === 'ready') {
      void exportRaster(source, engine, result, settings, palette, {
        scale: exportScale,
        filename: exportName,
        format: exportFormat,
        quality: exportQuality,
        transparent: exportTransparent,
        layers,
      });
    }
  }, [
    source,
    engine,
    result,
    status,
    settings,
    palette,
    exportScale,
    exportName,
    exportFormat,
    exportQuality,
    exportTransparent,
    layers,
  ]);

  const handleCopy = useCallback(() => {
    if (source && result && status === 'ready') {
      void copyImageToClipboard(
        source,
        engine,
        result,
        settings,
        palette,
        exportScale,
        exportTransparent,
        layers,
      ).catch((err: unknown) => {
        console.warn('Copy to clipboard failed:', err);
      });
    }
  }, [source, engine, result, status, settings, palette, exportScale, exportTransparent, layers]);

  const handleExportAnimation = useCallback(() => {
    if (source && result && status === 'ready') {
      void exportAnimationWebM(source, engine, result, settings, palette, {
        scale: exportScale,
        filename: exportName,
        frames: 60,
        fps: 30,
      }).catch((err: unknown) => {
        console.warn('Animation export failed:', err);
      });
    }
  }, [source, engine, result, status, settings, palette, exportScale, exportName]);

  const handleExportGif = useCallback(() => {
    if (source && result && status === 'ready') {
      void exportAnimationGif(source, engine, result, settings, palette, {
        scale: Math.min(exportScale, 4),
        filename: exportName,
        frames: 40,
        fps: 20,
      }).catch((err: unknown) => {
        console.warn('GIF export failed:', err);
      });
    }
  }, [source, engine, result, status, settings, palette, exportScale, exportName]);

  const handleExportSvg = () => {
    if (!source || !result || status !== 'ready') return;
    try {
      const engineSvg = renderSVG(
        engine,
        result,
        settings,
        palette,
        source.width,
        source.height,
      );
      const svg = composeSvg(engineSvg, settings, source.width, source.height);
      void exportSvg(svg, exportName);
    } catch (err) {
      console.warn('SVG export not supported for this engine:', err);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        setSheet(null);
        setCustomSheetOpen(false);
        setShowShortcuts(false);
        return;
      }
      if (key === '?') {
        setShowShortcuts((s) => !s);
        return;
      }
      if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && key === 'y') {
        e.preventDefault();
        redo();
      }
      if (key === 'c') setCompare((c) => !c);
      if (key === 'f') toggleFullscreen();
      if (key === 's') {
        e.preventDefault();
        handleExport();
      }
      if (key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      if (key === 'r') {
        e.preventDefault();
        reset();
      }
      const n = Number(key);
      if (!isNaN(n) && n >= 1 && n <= 9) {
        const ids: EngineId[] = [
          'moon', 'truchet', 'voronoi', 'braille', 'dither', 'stipple', 'flow', 'scanline', 'hanzi',
        ];
        const id = ids[n - 1];
        setEngine(id);
        setSheet(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setEngine, setSheet, undo, redo, setCompare, toggleFullscreen, handleExport, reset, setCustomSheetOpen]);

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-200">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-4 left-4 z-50 bg-zinc-950 text-zinc-200 px-4 py-2 rounded-md border border-emerald-500">
        {t('Skip to content')}
      </a>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void loadFile(file);
          e.target.value = '';
        }}
      />

      <TopBar
        status={status}
        error={loadError ?? error}
        compare={compare}
        onCompare={() => setCompare((c) => !c)}
        onMenu={() => setShowMenu(true)}
      />

      <main
        className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-5"
        id="main-content"
        tabIndex={-1}
        aria-label={t('Image preview canvas')}
      >
        {source ? (
          <PreviewCanvas
            source={source}
            engine={engine}
            resultEngine={resultEngine}
            result={result}
            status={status}
            settings={settings}
            palette={palette}
            compare={compare}
            layers={layers}
          />
        ) : (
          <DropZone onFile={(f) => void loadFile(f)} onSample={loadSample} />
        )}
      </main>
      <BottomBar active={sheet} onSelect={(id) => setSheet(id)} />
      <Sheet open={sheet === 'engines'} title={t('Algorithms')} onClose={closeSheet}>
        <EngineSheet onPick={(id) => { setEngine(id); closeSheet(); }} />
      </Sheet>
      <Sheet open={sheet === 'adjust'} title={t('Tune')} onClose={closeSheet}>
        <TuneSheet />
      </Sheet>
      <Sheet open={sheet === 'export'} title={t('Export')} onClose={closeSheet}>
        <ExportSheet
          scale={exportScale}
          onScale={setExportScale}
          sourceWidth={source?.width ?? 0}
          filename={exportName}
          onFilenameChange={setExportName}
          format={exportFormat}
          onFormat={setExportFormat}
          quality={exportQuality}
          onQuality={setExportQuality}
          transparent={exportTransparent}
          onTransparent={setExportTransparent}
          onExport={handleExport}
          onExportSvg={handleExportSvg}
          onCopy={handleCopy}
          onExportAnimation={handleExportAnimation}
          onExportGif={handleExportGif}
          animationSupported={isAnimationExportSupported()}
          onUpload={() => fileInputRef.current?.click()}
          disabled={!source || !result || status !== 'ready'}
          outputWidth={(source?.width ?? 0) * exportScale}
          outputHeight={(source?.height ?? 0) * exportScale}
          layers={layers}
        />
      </Sheet>
      <Sheet
        open={showShortcuts}
        title={t('Keyboard shortcuts')}
        onClose={() => setShowShortcuts(false)}
      >
        <ShortcutsList />
      </Sheet>
      <Sheet
        open={showMenu}
        title={t('Menu')}
        onClose={() => setShowMenu(false)}
      >
        <AppMenu
          open={showMenu}
          onClose={() => setShowMenu(false)}
          onShortcuts={() => setShowShortcuts(true)}
          lang={lang}
          toggleLang={toggle}
          onFullscreen={toggleFullscreen}
          fullscreen={fullscreen}
          version={__APP_VERSION__}
        />
      </Sheet>

      <PwaPrompts />
      <CustomPaletteSheetMount source={source} />
    </div>
  );
}

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: '1 – 9', label: 'Switch engine' },
  { keys: 'C', label: 'Toggle compare' },
  { keys: 'F', label: 'Toggle fullscreen' },
  { keys: 'S', label: 'Export PNG' },
  { keys: 'O', label: 'Upload image' },
  { keys: 'R', label: 'Reset settings' },
  { keys: 'Ctrl + Z', label: 'Undo' },
  { keys: 'Ctrl + Y', label: 'Redo' },
  { keys: '← → ↑ ↓', label: 'Adjust / select parameters (canvas focused)' },
  { keys: 'Esc', label: 'Close panel' },
  { keys: '?', label: 'Show this help' },
];

function ShortcutsList() {
  const { t } = useI18n();
  return (
    <div className="space-y-1.5">
      {SHORTCUTS.map((s) => (
        <div
          key={s.label}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2"
        >
          <span className="text-sm text-zinc-300">{t(s.label)}</span>
          <span className="shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
            {s.keys}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomPaletteSheetMount({ source }: { source: SourceImage | null }) {
  const { t } = useI18n();
  const { customSheetOpen, setCustomSheetOpen } = useSettings();
  return (
    <Sheet open={customSheetOpen} title={t('Custom Palette')} onClose={() => setCustomSheetOpen(false)}>
      <CustomPaletteSheet source={source} />
    </Sheet>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <SettingsProvider>
        <ErrorBoundary>
          <Studio />
        </ErrorBoundary>
      </SettingsProvider>
    </I18nProvider>
  );
}
