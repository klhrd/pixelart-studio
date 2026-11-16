import type { Settings } from '../types';

export const RENDER_ONLY_KEYS = [
  'maskShape','maskX','maskY','maskSize','maskFeather','maskInvert','maskBrushSize','maskErase',
  'blendMode','blendOpacity','layers','overlayType','overlayText','overlayX','overlayY',
  'overlaySize','overlayRotation','overlayColor','overlayOpacity','overlayBlend',
] as const satisfies readonly (keyof Settings)[];

/** Returns a copy of `settings` with every render-only key replaced by `defaults`. */
export function stripRenderOnly(settings: Settings, defaults: Settings): Settings {
  const out = { ...settings };
  for (const key of RENDER_ONLY_KEYS) {
    (out as Record<string, unknown>)[key] = defaults[key];
  }
  return out;
}

/** Stable signature of ONLY the render-only settings (used to trigger cheap redraws). */
export function renderSignature(settings: Settings): string {
  const picked: Record<string, unknown> = {};
  for (const key of RENDER_ONLY_KEYS) picked[key] = settings[key];
  return JSON.stringify(picked);
}
