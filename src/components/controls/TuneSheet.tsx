import { useState } from 'react';
import { engineMeta } from '../../engines';
import { useSettings } from '../../store/settingsContext';
import { useI18n } from '../../i18n/core';
import { EnginePanel } from './EnginePanel';
import { GeneralPanel } from './GeneralPanel';
import { EngineIcon } from '../icons/EngineIcon';

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

export function TuneSheet() {
  const [view, setView] = useState<TuneView>('menu');
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
      <MenuItem
        label={`${t('Engine Settings')}`}
        subtitle={`${meta.code} · ${t(meta.name)}`}
        icon={<EngineIcon id={engine} className="h-5 w-5" />}
        active={isEngineActive}
        onSelect={() => setView('engine')}
      />
      <div className="mt-2 space-y-2">
        <MenuItem
          label={t('Image Adjustments')}
          subtitle={t('Brightness · Contrast · Saturation · Palette')}
          icon={imageIcon}
          active={activeGeneralSubView === 'image'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('image');
          }}
        />
        <MenuItem
          label={t('Animation')}
          subtitle={t('Animates the current engine when it supports motion.')}
          icon={animationIcon}
          active={activeGeneralSubView === 'animation'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('animation');
          }}
        />
        <MenuItem
          label={t('Mask')}
          subtitle={t('Ellipse · Rect · Linear · Brush')}
          icon={maskIcon}
          active={activeGeneralSubView === 'mask'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('mask');
          }}
        />
        <MenuItem
          label={t('Blend')}
          subtitle={t('Mode · Opacity')}
          icon={blendIcon}
          active={activeGeneralSubView === 'blend'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('blend');
          }}
        />
        <MenuItem
          label={t('Overlay layer')}
          subtitle={t('Text · Sticker · Position')}
          icon={overlayIcon}
          active={activeGeneralSubView === 'overlay'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('overlay');
          }}
        />
        <MenuItem
          label={t('Layers')}
          subtitle={t('Stacks a second engine result over the first.')}
          icon={layersIcon}
          active={activeGeneralSubView === 'layers'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('layers');
          }}
        />
        <MenuItem
          label={t('Presets')}
          subtitle={t('Save · Apply · Delete')}
          icon={presetsIcon}
          active={activeGeneralSubView === 'presets'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('presets');
          }}
        />
        <MenuItem
          label={t('History')}
          subtitle={t('Snapshots')}
          icon={historyIcon}
          active={activeGeneralSubView === 'history'}
          onSelect={() => {
            setView('general');
            setGeneralSubView('history');
          }}
        />
      </div>
    </div>
  );
}
