import type { ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ open, title, onClose, children }: SheetProps) {
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
          className="rounded-t-2xl border-x border-t border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/60"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
        >
          <div className="relative flex items-center justify-center px-4 pb-2 pt-4">
            <span className="absolute top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-zinc-700" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
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
