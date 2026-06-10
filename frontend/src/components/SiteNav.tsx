"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import { Badge } from "@/components/ui/Badge";

// TrustGate EVM site. Single source of truth, imported where needed.
export const EVM_SITE = "https://trustgated.xyz";

const NAV_LINKS: ReadonlyArray<{ label: string; href: string; external?: boolean }> = [
  { label: "TokenShield", href: "/token-shield" },
  { label: "Trust Score", href: "/trust-score" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Docs", href: "/docs" },
  { label: "EVM", href: EVM_SITE, external: true },
];

/**
 * SiteNav is the shared header for every route. It carries the brand mark, the
 * primary links, and the wallet connect control. On narrow screens the links
 * collapse into a dropdown that closes on outside click, Escape, or selection.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0A0F1E]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight text-[#E6EAF2]">TrustGate</span>
          <Badge intent="accent">Sui Testnet</Badge>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#8A93A6] transition-colors hover:text-[#E6EAF2]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#8A93A6] transition-colors hover:text-[#E6EAF2]"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ConnectButton />
          </div>

          <div ref={menuRef} className="relative md:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] text-[#E6EAF2] transition-colors hover:border-[#44DCEA]/40"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                )}
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D1322] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
                <ul className="py-2">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#8A93A6] transition-colors hover:bg-white/[0.04] hover:text-[#E6EAF2]"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#8A93A6] transition-colors hover:bg-white/[0.04] hover:text-[#E6EAF2]"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-white/[0.06] p-3 sm:hidden">
                  <ConnectButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
