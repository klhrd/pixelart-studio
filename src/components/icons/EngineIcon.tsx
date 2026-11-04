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
    case 'stipple':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          {[
            [5.5, 6, 1.9],
            [13, 4.5, 1.3],
            [18.5, 9, 2.2],
            [7, 14.5, 1.4],
            [14.5, 13.5, 1.8],
            [19, 19, 1.2],
            [10.5, 19.5, 2.0],
            [3.5, 20, 1.1],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" />
          ))}
        </svg>
      );
    case 'flow':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path
            {...stroke}
            d="M3 7c3-3.5 6 3.5 9 0s6 3.5 9 0M3 13c3-3.5 6 3.5 9 0s6 3.5 9 0M3 19c3-3.5 6 3.5 9 0s6 3.5 9 0"
          />
        </svg>
      );
    case 'scanline':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path {...stroke} d="M3.5 5h17v14h-17z" />
          <path
            {...stroke}
            d="M6 8.5h12M6 12h8M6 15.5h12M17 12h1"
          />
        </svg>
      );
    case 'hanzi':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <text
            x="12"
            y="17.5"
            textAnchor="middle"
            fontSize="17"
            fill="currentColor"
          >
            文
          </text>
        </svg>
      );
    case 'hexdump':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <text
            x="12"
            y="16.5"
            textAnchor="middle"
            fontSize="11"
            fontFamily="ui-monospace, Menlo, Consolas, monospace"
            fill="currentColor"
          >
            3F7
          </text>
          <path {...stroke} d="M4 19.5h16" strokeDasharray="2 2.4" />
        </svg>
      );
    case 'benday':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="9.5" cy="9.5" r="5" fill="currentColor" opacity="0.45" />
          <circle cx="14.5" cy="9.5" r="5" fill="currentColor" opacity="0.45" />
          <circle cx="12" cy="14.5" r="5" fill="currentColor" opacity="0.45" />
        </svg>
      );
    case 'wave':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path
            {...stroke}
            d="M2 9c3-6 5.5-6 8.5 0s5.5 6 8.5 0M2 17c3-6 5.5-6 8.5 0s5.5 6 8.5 0"
            transform="translate(1.5 0) scale(0.9)"
          />
        </svg>
      );
    case 'contour':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="6"
            ry="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="2.8"
            ry="2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'hatch':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path {...stroke} strokeWidth="1.1" d="M5 9.5l6.5-3.5M5 14l9.5-5M6 18l11-6M10 19l8-4.5" />
        </svg>
      );
    case 'glyphs':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path
            d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9-1.9 5.6-1.9-5.6L4.5 11l5.6-1.9z"
            fill="currentColor"
          />
        </svg>
      );
    case 'moire':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          {[2.6, 5.2, 7.8, 10.4].map((r) => (
            <circle
              key={r}
              cx="12"
              cy="12"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          ))}
        </svg>
      );
    case 'stringart':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path {...stroke} d="M3 3h18v18H3z" />
          <path {...stroke} d="M3 3l18 18M21 3l-18 18" strokeWidth="0.8" opacity="0.4" />
          <circle cx="6" cy="6" r="1" fill="currentColor" />
          <circle cx="18" cy="6" r="1" fill="currentColor" />
          <circle cx="6" cy="18" r="1" fill="currentColor" />
          <circle cx="18" cy="18" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case 'turing':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.35" />
          <circle cx="12" cy="9" r="3" fill="currentColor" opacity="0.55" />
          <circle cx="16" cy="7" r="1.5" fill="currentColor" opacity="0.35" />
          <circle cx="9" cy="14" r="2.5" fill="currentColor" opacity="0.45" />
          <circle cx="15" cy="15" r="2" fill="currentColor" opacity="0.45" />
          <circle cx="6" cy="17" r="1.2" fill="currentColor" opacity="0.35" />
          <circle cx="19" cy="17" r="1.2" fill="currentColor" opacity="0.35" />
        </svg>
      );
    case 'pixelsort':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path {...stroke} d="M4 4h6v6H4zM13 4h6v6h-6zM13 13h6v6h-6z" fill="currentColor" />
          <path {...stroke} d="M4 13h6v6H4z" fill="currentColor" opacity="0.45" />
        </svg>
      );
  }
}
