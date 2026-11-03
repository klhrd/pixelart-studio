import { Component, useEffect, useRef, useState } from 'react';
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
import { exportPng } from './utils/exportImage';
import { parseShareHash } from './utils/shareLink';
import type { EngineId, SheetId } from './types';

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
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <p className="font-mono text-sm text-red-400">
              Render error: {this.state.error.message}
            </p>
            <button
              type="button"
              className="btn mt-4"
              onClick={() => this.setState({ error: null })}
            >
              Reload View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Studio() {
  const { engine, setEngine, settings, palette, update, saveCustomPalette } =
    useSettings();
  const { source, error: loadError, loadFile, loadSample } = useSourceImage();
  const { result, resultEngine, status, error } = useImageProcessor(
    source,
    engine,
    settings,
    palette,
  );
  const [exportScale, setExportScale] = useState(2);
  const [exportName, setExportName] = useState('pixelcraft');
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key;
      if (key === 'c') setCompare((c) => !c);
      if (key === 'f') toggleFullscreen();
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
  }, [setEngine, setSheet]);

  const toggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setFullscreen(false));
    }
  };

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const closeSheet = () => setSheet(null);

  const handleExport = () => {
    if (source && result && status === 'ready') {
      void exportPng(
        source,
        engine,
        result,
        settings,
        palette,
        exportScale,
        exportName,
      );
    }
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
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
      <main className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-5">
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
          <DropZone
            onFile={(f) => void loadFile(f)}
            onSample={loadSample}
          />
        )}
      </main>
      <BottomBar active={sheet} onSelect={(id) => setSheet(id)} />
      <Sheet
        open={sheet === 'engines'}
        title="Algorithms"
        onClose={closeSheet}
      >
        <EngineSheet
          onPick={(id) => {
            setEngine(id);
            closeSheet();
          }}
        />
      </Sheet>
      <Sheet open={sheet === 'adjust'} title="Tune" onClose={closeSheet}>
        <TuneSheet />
      </Sheet>
      <Sheet open={sheet === 'export'} title="Export" onClose={closeSheet}>
        <ExportSheet
          scale={exportScale}
          onScale={setExportScale}
          filename={exportName}
          onFilenameChange={setExportName}
          onExport={handleExport}
          onUpload={() => fileInputRef.current?.click()}
          disabled={!source || !result || status !== 'ready'}
          outputWidth={(source?.width ?? 0) * exportScale}
          outputHeight={(source?.height ?? 0) * exportScale}
        />
      </Sheet>
      <CustomPaletteSheetMount />
    </div>
  );
}

function CustomPaletteSheetMount() {
  const { customSheetOpen, setCustomSheetOpen } = useSettings();
  return (
    <Sheet
      open={customSheetOpen}
      title="Custom Palette"
      onClose={() => setCustomSheetOpen(false)}
    >
      <CustomPaletteSheet />
    </Sheet>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ErrorBoundary>
        <Studio />
      </ErrorBoundary>
    </SettingsProvider>
  );
}
