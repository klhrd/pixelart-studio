const STORAGE_KEY = 'pixelcraft-mask';

let holder: HTMLCanvasElement | null = null;
type Listener = () => void;
const listeners = new Set<Listener>();

export function getBrushMask(): HTMLCanvasElement | null {
  return holder;
}

export function setBrushMask(canvas: HTMLCanvasElement | null): void {
  holder = canvas;
}

export function onBrushMaskChange(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function notifyBrushMaskChange(): void {
  for (const cb of listeners) cb();
}

export function loadBrushMaskDataUrl(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveBrushMaskDataUrl(dataUrl: string | null): void {
  try {
    if (dataUrl) localStorage.setItem(STORAGE_KEY, dataUrl);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function clearBrushMask(): void {
  if (!holder) return;
  holder.getContext('2d')?.clearRect(0, 0, holder.width, holder.height);
  saveBrushMaskDataUrl(null);
  notifyBrushMaskChange();
}
