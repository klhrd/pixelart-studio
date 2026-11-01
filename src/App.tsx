import { useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { MobileEngineNav, Sidebar } from './components/layout/Sidebar';
import { DropZone } from './components/canvas/DropZone';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { SettingsProvider } from './store/settings';
import { useSettings } from './store/settingsContext';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useSourceImage } from './hooks/useSourceImage';
import { exportPng } from './utils/exportImage';

function Studio() {
  const { engine, settings, palette } = useSettings();
  const { source, error: loadError, loadFile, loadSample } = useSourceImage();
  const { result, status, error } = useImageProcessor(
    source,
    engine,
    settings,
    palette,
  );
  const [exportScale, setExportScale] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (source && result && status === 'ready') {
      void exportPng(source, engine, result, settings, palette, exportScale);
    }
  };

  return (
    <div className="flex min-h-full bg-zinc-950 text-zinc-200 lg:h-full">
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
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          status={status}
          error={loadError ?? error}
          canExport={Boolean(source) && status === 'ready'}
          exportScale={exportScale}
          onExportScaleChange={setExportScale}
          onUpload={() => fileInputRef.current?.click()}
          onExport={handleExport}
        />
        <MobileEngineNav />
        <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="relative flex h-[52vh] min-h-[300px] shrink-0 items-center justify-center p-4 sm:h-[56vh] lg:h-auto lg:min-h-0 lg:flex-1 lg:shrink">
            {source ? (
              <PreviewCanvas
                source={source}
                engine={engine}
                result={result}
                status={status}
                settings={settings}
                palette={palette}
              />
            ) : (
              <DropZone onFile={(f) => void loadFile(f)} onSample={loadSample} />
            )}
          </section>
          <aside className="w-full border-t border-zinc-800 bg-zinc-900/40 lg:w-96 lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0 xl:w-[26rem]">
            <ControlPanel />
          </aside>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <Studio />
    </SettingsProvider>
  );
}
