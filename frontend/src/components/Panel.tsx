import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface PanelProps {
  title: string;
  /** Short uppercase tag shown in the panel header, e.g. a section index. */
  eyebrow?: string;
  children: ReactNode;
}

/** A bordered surface card. The single container primitive across the app. */
export function Panel({ title, eyebrow, children }: PanelProps) {
  return (
    <Card className="h-full">
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold tracking-tight text-[#E6EAF2]">
          {title}
        </h2>
        {eyebrow ? (
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">
            {eyebrow}
          </span>
        ) : null}
      </header>
      {children}
    </Card>
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
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-2 last:border-0">
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#5A6478]">
        {label}
      </span>
      <span className="font-mono text-sm text-[#E6EAF2]">{children}</span>
    </div>
  );
}
