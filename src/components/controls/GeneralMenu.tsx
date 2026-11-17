import { useI18n } from '../../i18n/core';

interface CategoryItem {
  id: string;
  label: string;
  subtitle: string;
  icon: JSX.Element;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'image',
    label: 'Image Adjustments',
    subtitle: 'Brightness · Contrast · Saturation',
    icon: (
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
    ),
  },
  {
    id: 'animation',
    label: 'Animation',
    subtitle: 'Animate phase · Speed',
    icon: (
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
    ),
  },
  {
    id: 'mask',
    label: 'Mask',
    subtitle: 'Ellipse · Rect · Linear · Brush',
    icon: (
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
    ),
  },
  {
    id: 'blend',
    label: 'Blend',
    subtitle: 'Mode · Opacity',
    icon: (
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
    ),
  },
  {
    id: 'overlay',
    label: 'Overlay layer',
    subtitle: 'Text · Sticker · Position',
    icon: (
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
    ),
  },
  {
    id: 'layers',
    label: 'Layers',
    subtitle: 'Stack engine results',
    icon: (
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
    ),
  },
  {
    id: 'presets',
    label: 'Presets',
    subtitle: 'Save · Apply · Delete',
    icon: (
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
    ),
  },
  {
    id: 'history',
    label: 'History',
    subtitle: 'Snapshots',
    icon: (
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
    ),
  },
];

interface GeneralMenuProps {
  onSelect: (id: string) => void;
}

export function GeneralMenu({ onSelect }: GeneralMenuProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className="flex touch-manipulation select-none items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-left transition hover:border-zinc-600 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
            {cat.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-zinc-100">
              {t(cat.label)}
            </span>
            <span className="block truncate text-xs text-zinc-500">
              {t(cat.subtitle)}
            </span>
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
      ))}
    </div>
  );
}
