import type { EngineId } from '../../types';

interface EngineIconProps {
  id: EngineId;
  className?: string;
}

export function EngineIcon({ id, className }: EngineIconProps) {
  const cls = className ?? 'h-5 w-5';
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (id) {
    case 'moon':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path
            {...stroke}
            d="M20.5 14.6A8.5 8.5 0 019.4 3.5 8.5 8.5 0 1012 20.6a8.5 8.5 0 008.5-6z"
          />
          <circle cx="16.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'truchet':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path {...stroke} d="M4 4h16v16H4z" />
          <path {...stroke} d="M4 12a8 8 0 018-8M20 12a8 8 0 01-8 8" />
        </svg>
      );
    case 'voronoi':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path {...stroke} d="M12 3.5l8.5 15h-17l8.5-15z" />
          <path {...stroke} d="M12 3.5v8.5M12 12l8.5 6.5M12 12L3.5 18.5" />
        </svg>
      );
    case 'braille':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          {[
            [7, 4.5],
            [7, 9.5],
            [7, 14.5],
            [7, 19.5],
            [15, 4.5],
            [15, 14.5],
            [15, 19.5],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.9" fill="currentColor" />
          ))}
          <circle cx={15} cy={9.5} r="1.9" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case 'dither':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path d="M4 4h7v7H4zM13 13h7v7h-7z" fill="currentColor" />
          <path {...stroke} d="M13 4h7v7h-7zM4 13h7v7H4z" />
        </svg>
      );
  }
}
