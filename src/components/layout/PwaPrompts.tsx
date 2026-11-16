import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/core';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import {
  applyUpdate,
  dismissOfflineReady,
  getNeedRefresh,
  getOfflineReady,
  subscribePwa,
} from '../../pwa';

export function PwaPrompts() {
  const { t } = useI18n();
  const [, force] = useState(0);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const [dismissedOffline, setDismissedOffline] = useState(false);
  const { canInstall, promptInstall } = useInstallPrompt();

  useEffect(() => subscribePwa(() => force((n) => n + 1)), []);

  const needRefresh = getNeedRefresh();
  const offlineReady = getOfflineReady();

  const chip =
    'pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-2 shadow-lg shadow-black/40 backdrop-blur';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[60] flex flex-col items-center gap-2 px-3">
      {needRefresh && (
        <div className={`${chip} border-emerald-500/50 bg-zinc-900/95`}>
          <span className="text-xs text-zinc-200">{t('A new version is ready.')}</span>
          <button
            type="button"
            className="btn-primary px-3 py-1 text-xs"
            onClick={applyUpdate}
          >
            {t('Refresh')}
          </button>
        </div>
      )}
      {canInstall && !dismissedInstall && !needRefresh && (
        <div className={`${chip} border-zinc-700 bg-zinc-900/95`}>
          <span className="text-xs text-zinc-200">
            {t('Install PixelCraft Studio for offline use.')}
          </span>
          <button
            type="button"
            className="btn-primary px-3 py-1 text-xs"
            onClick={() => void promptInstall()}
          >
            {t('Install app')}
          </button>
          <button
            type="button"
            aria-label={t('Dismiss')}
            onClick={() => setDismissedInstall(true)}
            className="text-zinc-500 transition hover:text-zinc-200"
          >
            ×
          </button>
        </div>
      )}
      {offlineReady && !dismissedOffline && (
        <div className={`${chip} border-zinc-700 bg-zinc-900/95`}>
          <span className="text-xs text-zinc-200">{t('Ready to work offline.')}</span>
          <button
            type="button"
            aria-label={t('Dismiss')}
            onClick={() => {
              dismissOfflineReady();
              setDismissedOffline(true);
            }}
            className="text-zinc-500 transition hover:text-zinc-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
