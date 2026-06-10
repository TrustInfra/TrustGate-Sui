import type { ReactNode } from "react";

type Intent = "default" | "accent" | "success" | "warn" | "danger" | "neutral";

const INTENT: Record<Intent, string> = {
  default: "border-white/10 bg-white/[0.04] text-[#8A93A6]",
  accent: "border-[#44DCEA]/30 bg-[#44DCEA]/10 text-[#44DCEA]",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-400",
  neutral: "border-white/10 bg-white/[0.04] text-[#E6EAF2]",
};

interface BadgeProps {
  intent?: Intent;
  /** Renders a small leading dot in the current text color. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Badge is a compact mono pill for labels, statuses, and tier markers. Colors
 * are intent-based so the same component covers neutral labels through to
 * danger states without ad hoc styling.
 */
export function Badge({ intent = "default", dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${INTENT[intent]} ${className ?? ""}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
