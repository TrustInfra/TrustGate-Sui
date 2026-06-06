"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// TrustGate EVM site. Single source of truth, imported where needed.
export const EVM_SITE = "https://trustgated.xyz";

const LINKS: Array<{ label: string; href: string; external: boolean }> = [
  { label: "TokenShield", href: "/token-shield", external: false },
  { label: "Docs", href: "/docs", external: false },
  { label: "EVM", href: EVM_SITE, external: true },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-400/15 text-sm font-bold text-teal-300">
          T
        </span>
        <span className="text-sm font-semibold tracking-tight text-slate-100">
          TrustGate<span className="ml-1.5 font-normal text-slate-500">Sui</span>
        </span>
      </Link>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/40 text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-40 w-48 overflow-hidden rounded-xl border border-slate-700 bg-[#0d1426] py-1.5 shadow-xl shadow-black/40">
            {LINKS.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800/60 hover:text-slate-100"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800/60 hover:text-slate-100"
                >
                  {l.label}
                </Link>
              ),
            )}
            <div className="mx-2 my-1.5 border-t border-slate-800" />
            <Link
              href="/token-shield"
              onClick={() => setOpen(false)}
              className="mx-2 block rounded-lg bg-teal-400 px-3 py-2 text-center text-sm font-semibold text-slate-900 transition hover:bg-teal-300"
            >
              Check a token
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
