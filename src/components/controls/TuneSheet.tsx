import { useState } from 'react';
import { engineMeta } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { EnginePanel } from './EnginePanel';
import { GeneralPanel } from './GeneralPanel';
import { EngineIcon } from '../icons/EngineIcon';
import type { AdjustCategory } from '../canvas/gestureItems';

interface TuneSheetProps {
  /** Called when a gesture-adjustable category is picked; the sheet closes
   *  and the canvas gesture adjuster takes over with that category's items. */
  onAdjust: (category: AdjustCategory) => void;
}

type TuneView = 'menu' | 'general' | 'engine';
type GeneralSubView =
  | null
  | 'image'
  | 'animation'
  | 'mask'
  | 'blend'
  | 'overlay'
  | 'layers'
  | 'presets'
  | 'history';

type ViewMode = 'grid' | 'list';

const TUNE_VIEW_KEY = 'pixelcraft-tune-view';

function loadTuneView(): ViewMode {
  try {
    return localStorage.getItem(TUNE_VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

function saveTuneView(mode: ViewMode): void {
  try {
    localStorage.setItem(TUNE_VIEW_KEY, mode);
  } catch {
    /* storage unavailable */
  }
}

function SubHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex touch-manipulation select-none items-center gap-1.5 py-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-100"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      {title}
    </button>
  );
}

interface MenuItemProps {
  label: string;
  subtitle: string;
  icon: JSX.Element;
  active?: boolean;
  onSelect: () => void;
}

function MenuItem({
  label,
  subtitle,
  icon,
  active = false,
  onSelect,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border p-3.5 text-left transition active:scale-[0.99] ${
        active
          ? 'border-emerald-500/60 bg-emerald-500/10'
          : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${active ? 'text-emerald-300' : 'text-zinc-200'}`}>
          {label}
        </span>
        <span className="block truncate text-xs text-zinc-500">{subtitle}</span>
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4 shrink-0 text-zinc-600"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}

interface TuneTileProps {
  label: string;
  subtitle: string;
  icon: JSX.Element;
  active?: boolean;
  onSelect: () => void;
}

function TuneTile({
  label,
  subtitle,
  icon,
  active = false,
  onSelect,
}: TuneTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full touch-manipulation select-none flex-col items-center gap-2 rounded-xl border p-3 text-left transition active:scale-[0.97] ${
        active
          ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
          : 'border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-600'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {icon}
      </span>
      <span className="block text-center text-sm font-medium leading-tight">
        {label}
      </span>
      <span className="block text-center text-[10px] text-zinc-500 leading-tight">
        {subtitle}
      </span>
    </button>
  );
}

export function TuneSheet({ onAdjust }: TuneSheetProps) {
  const [view, setView] = useState<TuneView>('menu');
  const [viewMode, setViewMode] = useState<ViewMode>(loadTuneView);

const switchTuneView = (mode: ViewMode) => {
  setViewMode(mode);
  saveTuneView(mode);
};
  const [generalSubView, setGeneralSubView] = useState<GeneralSubView>(null);
  const { engine } = useSettings();
  const { t } = useI18n();
  const meta = engineMeta(engine);

  const isEngineActive = view === 'engine';
  const activeGeneralSubView: GeneralSubView | null =
    view === 'general' ? generalSubView : null;

  const imageIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
  const animationIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2a4 4 0 00-4 4v4a4 4 0 004 4h4a4 4 0 004-4v-4a4 4 0 00-4-4h-4zM3.343 6.657l1.414-1.414M20.657 17.343l1.414 1.414M3.343 17.343l1.414 1.414M20.657 6.657l1.414-1.414"
      />
    </svg>
  );
  const maskIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16z"
      />
    </svg>
  );
  const blendIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zM7 12a5 5 0 015-5h.01M12 12a5 5 0 015 5v.01M12 17a5 5 0 01-5-5h-.01M12 7a5 5 0 00-5 5v.01"
      />
    </svg>
  );
  const overlayIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h18v18H3zM12 12m-3 0l3 3 3-3"
      />
    </svg>
  );
  const layersIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h18v18H3zM6 6h6v6H6zM12 12h6v6h-6zM18 18h6v6h-6z"
      />
    </svg>
  );
  const presetsIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      />
    </svg>
  );
  const historyIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zM12 16a4 4 0 110-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
      />
    </svg>
  );

  const tuneItems = [
    {
      label: `${t('Engine Settings')}`,
      subtitle: `${meta.code} · ${t(meta.name)}`,
      icon: <EngineIcon id={engine} className="h-5 w-5" />,
      active: isEngineActive,
      onSelect: () => onAdjust('engine'),
      id: 'engine',
    },
    {
      label: t('Image Adjustments'),
      subtitle: t('Brightness · Contrast · Saturation'),
      icon: imageIcon,
      active: activeGeneralSubView === 'image',
      onSelect: () => onAdjust('image'),
      id: 'image',
    },
    {
      label: t('Animation'),
      subtitle: t('Animates the current engine when it supports motion.'),
      icon: animationIcon,
      active: activeGeneralSubView === 'animation',
      onSelect: () => onAdjust('animation'),
      id: 'animation',
    },
    {
      label: t('Mask'),
      subtitle: t('Ellipse · Rect · Linear · Brush'),
      icon: maskIcon,
      active: activeGeneralSubView === 'mask',
      onSelect: () => onAdjust('mask'),
      id: 'mask',
    },
    {
      label: t('Blend'),
      subtitle: t('Mode · Opacity'),
      icon: blendIcon,
      active: activeGeneralSubView === 'blend',
      onSelect: () => onAdjust('blend'),
      id: 'blend',
    },
    {
      label: t('Palette'),
      subtitle: t('Palette & detailed controls'),
      icon: presetsIcon,
      active: isEngineActive,
      onSelect: () => setView('engine'),
      id: 'palette',
    },
    {
      label: t('Overlay layer'),
      subtitle: t('Text · Sticker · Position'),
      icon: overlayIcon,
      active: activeGeneralSubView === 'overlay',
      onSelect: () => {
        setView('general');
        setGeneralSubView('overlay');
      },
      id: 'overlay',
    },
    {
      label: t('Layers'),
      subtitle: t('Stacks a second engine result over the first.'),
      icon: layersIcon,
      active: activeGeneralSubView === 'layers',
      onSelect: () => {
        setView('general');
        setGeneralSubView('layers');
      },
      id: 'layers',
    },
    {
      label: t('Presets'),
      subtitle: t('Save · Apply · Delete'),
      icon: presetsIcon,
      active: activeGeneralSubView === 'presets',
      onSelect: () => {
        setView('general');
        setGeneralSubView('presets');
      },
      id: 'presets',
    },
    {
      label: t('History'),
      subtitle: t('Snapshots'),
      icon: historyIcon,
      active: activeGeneralSubView === 'history',
      onSelect: () => {
        setView('general');
        setGeneralSubView('history');
      },
      id: 'history',
    },
  ];

  if (view === 'engine') {
    return (
      <div className="space-y-3">
        <SubHeader
          title={`${meta.code} · ${t(meta.name)}`}
          onBack={() => setView('menu')}
        />
        <EnginePanel />
      </div>
    );
  }

  if (view === 'general') {
    return (
      <div className="space-y-3">
        <SubHeader
          title={t('General Adjustments')}
          onBack={() => setView('menu')}
        />
        <GeneralPanel
          subView={generalSubView as NonNullable<GeneralSubView>}
          onBack={() => setView('menu')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400">{t('View')}</span>
        <div className="flex rounded-lg border border-zinc-700 bg-zinc-950/60 p-0.5">
          <button
            type="button"
            onClick={() => switchTuneView('grid')}
            aria-label={t('Grid view')}
            className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
              viewMode === 'grid'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => switchTuneView('list')}
            aria-label={t('List view')}
            className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
              viewMode === 'list'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {tuneItems.map((item) => (
            <TuneTile
              key={item.id}
              label={item.label}
              subtitle={item.subtitle}
              icon={item.icon}
              active={item.active}
              onSelect={item.onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tuneItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              subtitle={item.subtitle}
              icon={item.icon}
              active={item.active}
              onSelect={item.onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
