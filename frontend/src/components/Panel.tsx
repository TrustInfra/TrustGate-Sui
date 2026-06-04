import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  /** Short uppercase tag shown in the panel header, e.g. a section index. */
  eyebrow?: string;
  children: ReactNode;
}

/** A bordered surface card. The single container primitive across the app. */
export function Panel({ title, eyebrow, children }: PanelProps) {
  return (
    <section className="rounded border border-border bg-surface p-6">
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {eyebrow ? (
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {eyebrow}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}

/** Label/value row used inside panels for compact data display. */
export function StatRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-mono text-sm">{children}</span>
    </div>
  );
}
