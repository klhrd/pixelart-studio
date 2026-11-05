import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/core';

interface PanelSectionProps {
  title: string;
  children: ReactNode;
}

export function PanelSection({ title, children }: PanelSectionProps) {
  const { t } = useI18n();
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {t(title)}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
