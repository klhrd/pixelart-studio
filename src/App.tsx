import { Component, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { DropZone } from './components/canvas/DropZone';
import { TuneSheet } from './components/controls/TuneSheet';
import { CustomPaletteSheet } from './components/controls/CustomPaletteSheet';
import { EngineSheet } from './components/controls/EngineSheet';
import { ExportSheet } from './components/controls/ExportSheet';
import { BottomBar } from './components/layout/BottomBar';
import { Sheet } from './components/layout/Sheet';
import { TopBar } from './components/layout/TopBar';
import { useImageProcessor } from './hooks/useImageProcessor';
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
} from './utils/exportImage';
import type { ExportFormat } from './utils/exportImage';
import { exportSvg } from './utils/exportSvg';
import { renderSVG } from './renderers';
import { parseShareHash } from './utils/shareLink';
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
  const { t } = useI18n();
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
  } = useSettings();
  const { source, error: loadError, loadFile, loadSample } = useSourceImage();
  const { result, resultEngine, status, error } = useImageProcessor(
    source,
    engine,
    settings,
    palette,
  );
  const [exportScale, setExportScale] = useState(2);
  const [exportName, setExportName] = useState('pixelcraft');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState(0.92);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [sheet, setSheet] = useState<SheetId>(null);
  const [compare, setCompare] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      ).catch((err: unknown) => {
        console.warn('Copy to clipboard failed:', err);
      });
    }
  }, [source, engine, result, status, settings, palette, exportScale, exportTransparent]);

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
      const svg = renderSVG(
        engine,
        result,
        settings,
        palette,
        source.width,
        source.height,
      );
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
        fullscreen={fullscreen}
        onCompare={() => setCompare((c) => !c)}
        onFullscreen={toggleFullscreen}
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
        />
      </Sheet>
      <CustomPaletteSheetMount source={source} />
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
