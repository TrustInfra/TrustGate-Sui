import type { ReactNode } from "react";

type SectionWidth = "narrow" | "default" | "wide";

const WIDTH: Record<SectionWidth, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
};

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  width?: SectionWidth;
  className?: string;
  children?: ReactNode;
}

/**
 * Section wraps a block of page content with consistent padding, a centered
 * container, and an optional header (eyebrow label, title, subtitle).
 * The accent eyebrow uses the mono face to read as a technical label.
 */
export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  width = "default",
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 px-6 py-20 sm:py-24 ${className ?? ""}`}>
      <div className={`mx-auto w-full ${WIDTH[width]}`}>
        {(eyebrow || title || subtitle) && (
          <header className="mb-10">
            {eyebrow && (
              <span className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[#44DCEA]">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-[#E6EAF2] sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#8A93A6]">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
