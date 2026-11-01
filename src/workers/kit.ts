export interface WorkerReturn<R> {
  result: R;
  transfer?: Transferable[];
}

type Scope = {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  addEventListener(
    type: 'message',
    listener: (ev: MessageEvent) => void,
  ): void;
};

export function handle<P, R>(compute: (payload: P) => WorkerReturn<R>): void {
  const scope = self as unknown as Scope;
  scope.addEventListener('message', (ev: MessageEvent) => {
    const { id, payload } = ev.data as { id: number; payload: P };
    try {
      const { result, transfer } = compute(payload);
      scope.postMessage({ id, ok: true, result }, transfer ?? []);
    } catch (err) {
      scope.postMessage({
        id,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
