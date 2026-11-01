import type { ReactNode } from 'react';

interface PanelSectionProps {
  title: string;
  children: ReactNode;
}

export function PanelSection({ title, children }: PanelSectionProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
