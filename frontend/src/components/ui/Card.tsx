import type { ReactNode } from "react";

interface CardProps {
  children?: ReactNode;
  className?: string;
  /** Adds a hover lift, border highlight, and soft glow. */
  interactive?: boolean;
  /** Uses the teal border instead of the neutral hairline. */
  accent?: boolean;
  /** Default inner padding. Set false for full-bleed content. */
  padded?: boolean;
}

/**
 * Card is the core surface used across the site. It carries a single hairline
 * border, a faint teal gradient along the top edge for depth, and an optional
 * interactive state that lifts and glows on hover.
 */
export function Card({
  children,
  className,
  interactive = false,
  accent = false,
  padded = true,
}: CardProps) {
  const classes = [
    "relative overflow-hidden rounded-2xl border bg-[#0D1322]/80",
    accent ? "border-[#44DCEA]/30" : "border-white/[0.08]",
    interactive
      ? "transition-all duration-300 hover:-translate-y-1 hover:border-[#44DCEA]/40 hover:shadow-[0_20px_60px_-20px_rgba(68,220,234,0.25)]"
      : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#44DCEA]/50 to-transparent"
      />
      {padded ? <div className="relative p-6 sm:p-7">{children}</div> : <div className="relative">{children}</div>}
    </div>
  );
}
