const STORAGE_KEY = 'pixelcraft-overlay';

let img: HTMLImageElement | null = null;
type Listener = () => void;
const listeners = new Set<Listener>();

export function getOverlayImage(): HTMLImageElement | null {
  return img;
}

export function setOverlayImage(image: HTMLImageElement | null): void {
  img = image;
}

export function onOverlayImageChange(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function notifyOverlayImageChange(): void {
  for (const cb of listeners) cb();
}

export function loadOverlayImageDataUrl(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveOverlayImageDataUrl(dataUrl: string | null): void {
  try {
    if (dataUrl) localStorage.setItem(STORAGE_KEY, dataUrl);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function clearOverlayImage(): void {
  img = null;
  saveOverlayImageDataUrl(null);
  notifyOverlayImageChange();
}

export function loadOverlayImageFromDataUrl(dataUrl: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      setOverlayImage(image);
      notifyOverlayImageChange();
      resolve();
    };
    image.onerror = () => resolve();
    image.src = dataUrl;
  });
}
