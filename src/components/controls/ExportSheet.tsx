import { useState } from 'react';

interface ExportSheetProps {
  scale: number;
  onScale: (scale: number) => void;
  onExport: () => void;
  disabled: boolean;
  outputWidth: number;
  outputHeight: number;
}

const SCALES = [1, 2, 3, 4];

export function ExportSheet({
  scale,
  onScale,
  onExport,
  disabled,
  outputWidth,
  outputHeight,
}: ExportSheetProps) {
  const [saved, setSaved] = useState(false);

  const handleExport = () => {
    onExport();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Output
        </div>
        <div className="mt-1 font-mono text-lg text-zinc-100">
          {outputWidth} × {outputHeight} px
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs text-zinc-400">
          Resolution Scale
        </span>
        <div className="flex gap-1.5">
          {SCALES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onScale(s)}
              className={`flex-1 touch-manipulation select-none rounded-lg border py-2.5 font-mono text-sm transition active:scale-95 ${
                scale === s
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="btn-primary w-full justify-center py-3"
        disabled={disabled}
        onClick={handleExport}
      >
        {saved ? (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Saved
          </>
        ) : (
          'Export PNG'
        )}
      </button>
      {disabled && (
        <p className="text-center text-[11px] text-zinc-500">
          Load an image and wait for processing to finish.
        </p>
      )}
    </div>
  );
}
