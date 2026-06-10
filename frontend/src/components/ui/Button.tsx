"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#44DCEA]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1E] disabled:pointer-events-none disabled:opacity-50";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[#44DCEA] text-[#04121A] hover:bg-[#5fe6f2] shadow-[0_8px_30px_-10px_rgba(68,220,234,0.6)]",
  outline:
    "border border-[#44DCEA]/40 text-[#44DCEA] hover:border-[#44DCEA]/70 hover:bg-[#44DCEA]/10",
  ghost: "text-[#E6EAF2] hover:bg-white/[0.06]",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  /** Opens in a new tab with safe rel attributes. */
  external?: boolean;
  "aria-label"?: string;
};

/**
 * Button renders as a real button by default, or as a Next link when given an
 * href (set external to open off-site links in a new tab). One styling source
 * for every call to action on the site.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const classes = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${props.className ?? ""}`;

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={props["aria-label"]}
          className={classes}
        >
          {props.children}
        </a>
      );
    }
    return (
      <Link href={props.href} aria-label={props["aria-label"]} className={classes}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props["aria-label"]}
      className={classes}
    >
      {props.children}
    </button>
  );
}
