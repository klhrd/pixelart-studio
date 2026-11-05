import type { GestureItem } from '../../hooks/useGestureControls';
import {
  GESTURE_GROUP_LABELS,
  GESTURE_ITEM_PITCH,
} from '../../hooks/useGestureControls';
import { useI18n } from '../../i18n/core';

interface GestureListProps {
  items: GestureItem[];
  listOffset: number;
  activeIndex: number;
}

export function GestureList({ items, listOffset, activeIndex }: GestureListProps) {
  const { t } = useI18n();
  const groupStarts: number[] = [];
  for (let i = 0; i < items.length; i++) {
    if (i === 0 || items[i].group !== items[i - 1].group) {
      groupStarts.push(i);
    }
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-1/2 z-50 -translate-y-1/2"
      data-gesture-list=""
      role="status"
      aria-live="polite"
      aria-label={t('Parameter selector')}
    >
      <div
        className="relative mx-auto h-[260px] w-full max-w-md overflow-hidden bg-zinc-950/75 backdrop-blur-sm"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
          maskImage:
            'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 border-y border-emerald-400/50 bg-emerald-400/10" />

        {groupStarts.map((start) => {
          const rel = (start - 0.5 - listOffset) * GESTURE_ITEM_PITCH;
          const dist = Math.abs(start - 0.5 - listOffset);
          const opacity = Math.max(0, Math.min(0.9, 1 - dist * 0.25));
          return (
            <div
              key={`group-${start}`}
              className="absolute inset-x-0 top-1/2 flex h-5 items-center justify-center gap-2"
              style={{
                transform: `translateY(calc(-50% + ${rel}px))`,
                opacity,
              }}
            >
              <span className="h-px w-8 bg-zinc-700/80" />
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                {t(GESTURE_GROUP_LABELS[items[start].group])}
              </span>
              <span className="h-px w-8 bg-zinc-700/80" />
            </div>
          );
        })}

        {items.map((item, i) => {
          const rel = (i - listOffset) * GESTURE_ITEM_PITCH;
          const dist = Math.abs(i - listOffset);
          const opacity = Math.max(0, 1 - dist * 0.3);
          const scale = Math.max(0.78, 1 - dist * 0.1);
          const isCenter = i === activeIndex;
          const isGeneral = item.group === 'general';
          return (
            <div
              key={String(item.key)}
              className="absolute inset-x-0 top-1/2 flex h-11 items-center justify-center"
              style={{ transform: `translateY(calc(-50% + ${rel}px))` }}
            >
              <span
                className={`${
                  isGeneral ? 'font-sans text-[13px] tracking-wide' : 'font-mono text-sm'
                } ${
                  isCenter
                    ? 'font-semibold text-emerald-300'
                    : isGeneral
                      ? 'text-zinc-400'
                      : 'text-zinc-300'
                }`}
                style={{ opacity, transform: `scale(${scale})` }}
              >
                {t(item.label)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
