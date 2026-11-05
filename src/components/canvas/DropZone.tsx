import { useRef, useState } from 'react';
import { useI18n } from '../../i18n/core';

interface DropZoneProps {
  onFile: (file: File) => void;
  onSample: () => void;
}

export function DropZone({ onFile, onSample }: DropZoneProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) onFile(file);
      }}
      className={`flex h-full w-full max-w-xl flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition ${
        dragging
          ? 'border-emerald-400 bg-emerald-500/10'
          : 'border-zinc-800 bg-zinc-900/40'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="mb-4 h-10 w-10 text-zinc-600"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z"
        />
      </svg>
      <h2 className="text-lg font-semibold text-zinc-200">
        {t('Drop an image to begin')}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        {t('Everything runs locally in your browser. Your image never leaves this device.')}
      </p>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => inputRef.current?.click()}
        >
          {t('Select Image')}
        </button>
        <button type="button" className="btn" onClick={onSample}>
          {t('Load Sample')}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
