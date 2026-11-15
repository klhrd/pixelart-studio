import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/core';

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, title, onClose, children }: SheetProps) {
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  // Move focus into the sheet on open and restore it on close.
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      prevFocus.current?.focus?.();
    };
  }, [open]);

  // Trap Tab within the topmost dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs.length > 0 && dialogs[dialogs.length - 1] !== panel) return;
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? panel.contains(active) : false;
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  if (!open) return null;
  return (
    <>
      <div
        className="animate-fade fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-sheet fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg">
        <div
          ref={panelRef}
          className="rounded-t-2xl border-x border-t border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/60"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="relative flex items-center justify-center px-4 pb-2 pt-4">
            <span className="absolute top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-zinc-700" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              {title}
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t('Close')}
              className="absolute right-3 top-3 flex h-9 w-9 touch-manipulation select-none items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="max-h-[62vh] overflow-y-auto overscroll-contain px-4 pt-2">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
