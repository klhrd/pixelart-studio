import { registerSW } from 'virtual:pwa-register';

type Listener = () => void;

const listeners = new Set<Listener>();
let needRefresh = false;
let offlineReady = false;
let updateSWFn: ((reloadPage?: boolean) => Promise<void>) | null = null;

function emit(): void {
  for (const l of listeners) l();
}

export function registerPwa(): void {
  updateSWFn = registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh = true;
      emit();
    },
    onOfflineReady() {
      offlineReady = true;
      emit();
    },
  });
}

export function subscribePwa(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getNeedRefresh(): boolean {
  return needRefresh;
}

export function getOfflineReady(): boolean {
  return offlineReady;
}

export function dismissOfflineReady(): void {
  offlineReady = false;
  emit();
}

export function applyUpdate(): void {
  void updateSWFn?.(true);
}
