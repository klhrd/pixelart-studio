import { createContext, useContext } from 'react';
import { zhTW } from './dictionary';

export type Lang = 'en' | 'zh-TW';

export const STORAGE_KEY = 'pixelcraft-lang';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  'zh-TW': '正體中文',
};

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh-TW') return saved;
  } catch {
    /* storage unavailable */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
  return nav && nav.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en';
}

export interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}

export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let out = lang === 'zh-TW' ? (zhTW[key] ?? key) : key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
    }
  }
  return out;
}
