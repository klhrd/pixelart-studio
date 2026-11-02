import type { EngineId, Settings } from '../types';

export interface SharedState {
  engine?: EngineId;
  settings?: Partial<Settings>;
  custom?: { name: string; colors: string[] };
}

export function buildShareHash(
  engine: EngineId,
  settings: Settings,
  custom?: { name: string; colors: string[] } | null,
): string {
  const payload = {
    e: engine,
    s: settings,
    c: custom ?? undefined,
  };
  return `#s=${btoa(encodeURIComponent(JSON.stringify(payload)))}`;
}

export function parseShareHash(hash: string): SharedState | null {
  const m = /#s=([A-Za-z0-9+/=_-]+)/.exec(hash);
  if (!m) return null;
  try {
    const json = decodeURIComponent(atob(m[1]));
    const p = JSON.parse(json) as {
      e?: EngineId;
      s?: Partial<Settings>;
      c?: { name?: string; colors?: string[] };
    };
    if (!p.e && !p.s) return null;
    return {
      engine: p.e,
      settings: p.s,
      custom:
        p.c && Array.isArray(p.c.colors) && p.c.colors.length >= 2
          ? { name: p.c.name ?? 'Shared', colors: p.c.colors }
          : undefined,
    };
  } catch {
    return null;
  }
}
