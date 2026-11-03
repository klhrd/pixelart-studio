import type { GestureItem } from '../../hooks/useGestureControls';
import { GESTURE_ITEM_PITCH } from '../../hooks/useGestureControls';

interface GestureListProps {
  items: GestureItem[];
  listOffset: number;
  activeIndex: number;
}

export function GestureList({ items, listOffset, activeIndex }: GestureListProps) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-1/2 z-50 -translate-y-1/2"
      data-gesture-list=""
      role="status"
      aria-live="polite"
      aria-label="Parameter selector"
    >
      <div
        className="relative mx-auto h-[220px] w-full max-w-md overflow-hidden bg-zinc-950/70 backdrop-blur-sm"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 24%, black 76%, transparent)',
          maskImage:
            'linear-gradient(to bottom, transparent, black 24%, black 76%, transparent)',
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 border-y border-emerald-400/50 bg-emerald-400/10" />
        {items.map((item, i) => {
          const dist = Math.abs(i - listOffset);
          if (dist > 3.6) return null;
          const rel = (i - listOffset) * GESTURE_ITEM_PITCH;
          const opacity = Math.max(0, 1 - dist * 0.4);
          const scale = Math.max(0.72, 1 - dist * 0.14);
          const isCenter = i === activeIndex;
          return (
            <div
              key={String(item.key)}
              className="absolute inset-x-0 top-1/2 flex h-11 items-center justify-center"
              style={{ transform: `translateY(calc(-50% + ${rel}px))` }}
            >
              <span
                className={`font-mono text-sm ${
                  isCenter
                    ? 'font-semibold text-emerald-300'
                    : 'text-zinc-400'
                }`}
                style={{ opacity, transform: `scale(${scale})` }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
