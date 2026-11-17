import { useI18n } from '../../i18n/core';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Sheet } from './Sheet';

interface AppMenuProps {
  open: boolean;
  onClose: () => void;
  onShortcuts: () => void;
  lang: 'en' | 'zh-TW';
  toggleLang: () => void;
  onFullscreen: () => void;
  fullscreen: boolean;
  version: string;
}

export function AppMenu({
  open,
  onClose,
  onShortcuts,
  lang,
  toggleLang,
  onFullscreen,
  fullscreen,
  version,
}: AppMenuProps) {
  const { t } = useI18n();
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <Sheet open={open} title={t('Menu')} onClose={onClose}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            onShortcuts();
          }}
          className="flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-left transition hover:border-zinc-600 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
            <span className="material-symbols-rounded" aria-hidden="true">
              keyboard
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-zinc-200">
              {t('Keyboard shortcuts')}
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

        <button
          type="button"
          onClick={() => {
            onClose();
            toggleLang();
          }}
          className="flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-left transition hover:border-zinc-600 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
            <span className="material-symbols-rounded mr-1 text-[16px]" aria-hidden="true">
              translate
            </span>
            <span className="font-mono text-[11px] font-semibold">
              {lang === 'en' ? 'EN' : '中'}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-zinc-200">
              {t('Language')}
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

        {canInstall && (
          <button
            type="button"
            onClick={() => {
              onClose();
              void promptInstall();
            }}
            className="flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-left transition hover:border-zinc-600 active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <span className="material-symbols-rounded" aria-hidden="true">
                cloud_download
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-zinc-200">
                {t('Install PixelCraft Studio for offline use.')}
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
        )}

        <button
          type="button"
          onClick={() => {
            onClose();
            onFullscreen();
          }}
          className="flex w-full touch-manipulation select-none items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-left transition hover:border-zinc-600 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
            <span className="material-symbols-rounded" aria-hidden="true">
              {fullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-zinc-200">
              {fullscreen ? t('Exit fullscreen') : t('Enter fullscreen')}
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

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5">
          <span className="block text-xs text-zinc-500">{t('Version')}</span>
          <span className="block font-mono text-sm text-zinc-300">{version}</span>
        </div>
      </div>
    </Sheet>
  );
}
