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
    case 'kaleidoscope':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path
            {...stroke}
            d="M12 12l9 0M12 12l6.4 6.4M12 12l0 9M12 12l-6.4 6.4M12 12l-9 0M12 12l-6.4-6.4M12 12l0-9M12 12l6.4-6.4"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case 'quadtree':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path {...stroke} d="M4 4h16v16H4z" />
          <path {...stroke} d="M12 4v16M4 12h16" />
          <path {...stroke} d="M16 4v8M12 8h8" />
          <path d="M16 4h4v4h-4z" fill="currentColor" opacity="0.55" />
        </svg>
      );
    case 'chladni':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2.5" {...stroke} />
          <path
            {...stroke}
            d="M4 12c3-4 6 4 8 0s5-4 8 0M12 4c-4 3-4 6 0 8s4 5 0 8"
          />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
        </svg>
      );
    case 'ascii':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <text
            x="12"
            y="16.5"
            textAnchor="middle"
            fontSize="14"
            fontFamily="ui-monospace, Menlo, Consolas, monospace"
            fill="currentColor"
          >
            {'@'}
          </text>
          <path {...stroke} d="M5 20h3M10.5 20h3M16 20h3" strokeWidth="1.4" />
        </svg>
      );
    case 'posterize':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <rect x="4" y="4" width="5" height="5" fill="currentColor" opacity="0.9" />
          <rect x="9" y="4" width="5" height="5" fill="currentColor" opacity="0.65" />
          <rect x="14" y="4" width="5" height="5" fill="currentColor" opacity="0.4" />
          <rect x="4" y="9" width="5" height="5" fill="currentColor" opacity="0.65" />
          <rect x="9" y="9" width="5" height="5" fill="currentColor" opacity="0.4" />
          <rect x="14" y="9" width="5" height="5" fill="currentColor" opacity="0.2" />
          <rect x="4" y="14" width="5" height="5" fill="currentColor" opacity="0.4" />
          <rect x="9" y="14" width="5" height="5" fill="currentColor" opacity="0.2" />
          <rect x="14" y="14" width="5" height="5" fill="currentColor" opacity="0.1" />
        </svg>
      );
    case 'edge':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path
            {...stroke}
            d="M4 4c0-1.1 0.9-2 2-2h2c1.1 0 2 0.9 2 2v2c0 1.1-0.9 2-2 2h-2c-1.1 0-2-0.9-2-2zM20 20c0-1.1 0.9-2 2-2h2c1.1 0 2 0.9 2 2v2c0 1.1-0.9 2-2 2h-2c-1.1 0-2-0.9-2-2zM12 12c0-1.1 0.9-2 2-2h2c1.1 0 2 0.9 2 2v2c0 1.1-0.9 2-2 2h-2c-1.1 0-2-0.9-2-2z"
            fill="currentColor"
          />
          <path
            {...stroke}
            d="M4 20h16M20 4v16M4 4l8 8M20 20l-8-8"
            strokeWidth="0.8"
            opacity="0.4"
          />
          </svg>
      );
    case 'duotone':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <rect x="6" y="4" width="12" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <rect x="8" y="8" width="8" height="8" fill="currentColor" opacity="0.9" />
          <rect x="8" y="16" width="4" height="4" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case 'solarize':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path
            {...stroke}
            d="M12 2v2M12 20v2M2 12h2M20 12h2M6.34 6.34l1.41 1.41M17.66 17.66l1.41 1.41M6.34 17.66l-1.41 1.41M17.66 6.34l-1.41-1.41"
          />
          </svg>
      );
    case 'emboss':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <rect x="7" y="7" width="10" height="10" fill="currentColor" opacity="0.3" />
          <path
            {...stroke}
            d="M6 6l2 2M18 18l-2-2M18 6l-2 2M6 18l2-2"
            strokeWidth="1"
            opacity="0.6"
          />
        </svg>
      );
    case 'negative':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <rect x="6" y="6" width="12" height="12" fill="currentColor" opacity="0.25" />
          <path
            {...stroke}
            d="M6 18l12-12M18 18l-12-12"
            strokeWidth="1"
            opacity="0.6"
          />
        </svg>
      );
  }
}
