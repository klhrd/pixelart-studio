import type { SheetId } from '../../types';
import { useI18n } from '../../i18n/core';

const NAV_ITEMS: {
  id: Exclude<SheetId, null>;
  label: string;
}[] = [
  { id: 'presets', label: 'Looks' },
  { id: 'engines', label: 'Tools' },
  { id: 'export', label: 'Export' },
];

interface BottomBarProps {
  active: SheetId;
  onSelect: (id: Exclude<SheetId, null>) => void;
}

export function BottomBar({ active, onSelect }: BottomBarProps) {
  const { t } = useI18n();
  return (
    <nav
      className="border-t border-zinc-800 bg-zinc-900/95 backdrop-blur"
      aria-label={t('Modules')}
    >
      <div className="mx-auto flex max-w-md">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex flex-1 touch-manipulation select-none items-center justify-center py-3.5 text-sm font-medium transition active:scale-95 ${
              active === item.id
                ? 'text-emerald-300'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-pressed={active === item.id}
            aria-label={t(item.label)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>
    </nav>
  );
}
