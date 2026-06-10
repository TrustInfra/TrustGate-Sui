"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BackgroundPaths } from "@/components/BackgroundPaths";
import { EVM_SITE } from "@/components/SiteNav";

/* ---------- small inline icons ---------- */

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15 19 4M15 5l2 2M18 8l1.5 1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- sample visuals (decorative, representative) ---------- */

function ProblemVisual() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">Same chart, different truth</p>
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#44DCEA]/40 to-[#44DCEA]/5" />
            <span className="text-sm text-[#E6EAF2]">REALCOIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-emerald-300">92</span>
            <Badge intent="success">Verified</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#44DCEA]/40 to-[#44DCEA]/5" />
            <span className="text-sm text-[#E6EAF2]">REALC0IN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-red-400">18</span>
            <Badge intent="danger">Flagged</Badge>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#5A6478]">
        Identical icons and tickers. One is real. TrustGate tells them apart.
      </p>
    </Card>
  );
}

function WalletScoreVisual() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#8A93A6]">0xa1d2...6f39</span>
        <Badge intent="accent">High</Badge>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <span className="font-display text-5xl font-semibold leading-none text-[#E6EAF2]">84</span>
        <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A6478]">/ 100 trust</span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-[#2BA7B3] to-[#44DCEA]" />
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-[#44DCEA]/20 bg-[#44DCEA]/[0.06] px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-[#E6EAF2]">
          <span className="text-[#44DCEA]">
            <KeyIcon />
          </span>
          Trusted Agent Cap
        </span>
        <Badge intent="accent">Standard</Badge>
      </div>
    </Card>
  );
}

function GatedPoolVisual() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">DeepBook gated pool</p>
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
          <span className="text-sm text-[#E6EAF2]">Holds cap</span>
          <span className="flex items-center gap-2 font-mono text-xs text-emerald-300">
            <CheckIcon /> Order placed
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
          <span className="text-sm text-[#E6EAF2]">No cap</span>
          <span className="flex items-center gap-2 font-mono text-xs text-red-400">
            <CrossIcon /> Rejected
          </span>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#5A6478]">
        One ownership check at trade time. No oracle call from the pool.
      </p>
    </Card>
  );
}

function TokenShieldVisual() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <div className="rounded-lg border border-white/[0.08] bg-[#0A0F1E] px-3 py-2 font-mono text-xs text-[#8A93A6]">
        0x2::sui::SUI
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-end gap-2">
          <span className="font-display text-4xl font-semibold leading-none text-[#E6EAF2]">99</span>
          <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A6478]">score</span>
        </div>
        <Badge intent="success">Verified</Badge>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge>Holders</Badge>
        <Badge>Liquidity</Badge>
        <Badge>Mint authority</Badge>
        <Badge>Age</Badge>
      </div>
    </Card>
  );
}

function WidgetVisual() {
  return (
    <Card className="mx-auto w-full max-w-sm" padded={false}>
      <div className="border-b border-white/[0.06] px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">One script tag</span>
      </div>
      <pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed text-[#8A93A6]">
        {`<script
  src="https://sui.trustgated.xyz/widget.js"
  data-coin="0x2::sui::SUI">
</script>`}
      </pre>
      <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A6478]">Renders</span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0A0F1E] px-3 py-1.5">
          <span className="text-sm text-[#E6EAF2]">SUI</span>
          <span className="font-mono text-sm font-semibold text-[#44DCEA]">99</span>
          <Badge intent="success">Verified</Badge>
        </span>
      </div>
    </Card>
  );
}

/* ---------- beat layout ---------- */

function Beat({
  eyebrow,
  title,
  body,
  cta,
  visual,
  flip = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: ReactNode;
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className={`text-center lg:text-left ${flip ? "lg:order-2" : ""}`}>
        <span className="mb-5 inline-block font-mono text-xs uppercase tracking-[0.22em] text-[#44DCEA]">
          {eyebrow}
        </span>
        <h2 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-[#E6EAF2] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[#8A93A6]">{body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">{cta}</div>
      </div>
      <div className={flip ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}

/* ---------- closing surfaces ---------- */

const SURFACES: ReadonlyArray<{ label: string; desc: string; href: string }> = [
  { label: "TokenShield", desc: "Score any coin", href: "/token-shield" },
  { label: "Trust Score", desc: "Score any wallet", href: "/trust-score" },
  { label: "Gated Pool", desc: "Cap-gated trading", href: "/dashboard" },
  { label: "Widget", desc: "Drop-in badge", href: "/docs#widget" },
];

export default function HomePage() {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const innerRefs = useRef<Array<HTMLDivElement | null>>([]);

  const panels: ReactNode[] = [
    // 0. Hero
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
        <BackgroundPaths />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <Badge intent="accent" dot>
          Live on Sui Testnet
        </Badge>
        <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight text-[#E6EAF2] sm:text-6xl">
          Trust you can see, on Sui.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#8A93A6]">
          Wallets and tokens carry their whole history. TrustGate reads it, turns it
          into a score you can act on, and gates the things that matter.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button href="/token-shield" size="lg">
            Check a token
          </Button>
          <Button href="/docs" variant="outline" size="lg">
            Read the docs
          </Button>
        </div>
        <div className="mt-12 inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0D1322]/70 px-4 py-3 backdrop-blur-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">Sample</span>
          <span className="h-4 w-px bg-white/10" />
          <span className="text-sm text-[#E6EAF2]">SUI</span>
          <span className="font-mono text-sm font-semibold text-[#44DCEA]">99</span>
          <Badge intent="success">Verified</Badge>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce font-mono text-[11px] uppercase tracking-[0.2em] text-[#5A6478]">
        Scroll
      </div>
    </>,

    // 1. Why it exists
    <Beat
      key="why"
      eyebrow="The problem"
      title="On-chain, a scam and the real thing look identical."
      body="Same address format, same green chart, same confident site. By the time the difference shows, the money is already gone. TrustGate makes the risk readable before you act."
      visual={<ProblemVisual />}
      cta={
        <Button href="/docs#how-it-works" variant="outline">
          See how scoring works
        </Button>
      }
    />,

    // 2. Wallets
    <Beat
      key="wallets"
      eyebrow="Wallets"
      title="Behavior becomes a score. The score becomes a key."
      body="Every wallet leaves a trail: age, activity, who it deals with, how it moves. TrustGate reads that into a single score, and a wallet that clears the bar earns a non-transferable capability it holds on-chain."
      flip
      visual={<WalletScoreVisual />}
      cta={
        <>
          <Button href="/trust-score">Check a wallet</Button>
          <Button href="/docs#wallet-trust-score" variant="ghost">
            How it works
          </Button>
        </>
      }
    />,

    // 3. Gated pools
    <Beat
      key="gated"
      eyebrow="For builders"
      title="A pool that checks one thing: do you hold the cap."
      body="No oracle call at trade time, no integration tax. A gated pool just looks for the capability object in the wallet. Trusted wallets trade, the rest do not, and higher-stakes orders need a higher tier."
      visual={<GatedPoolVisual />}
      cta={
        <>
          <Button href="/docs#gated-pools">Integration guide</Button>
          <Button href="/dashboard" variant="ghost">
            See the dashboard
          </Button>
        </>
      }
    />,

    // 4. TokenShield
    <Beat
      key="tokens"
      eyebrow="Tokens"
      title="Coins get the same read."
      body="Paste a Sui coin type and TokenShield scores it: holders, liquidity, mint and freeze authority, age, concentration. One badge tells you what you are actually looking at."
      flip
      visual={<TokenShieldVisual />}
      cta={<Button href="/token-shield">Open TokenShield</Button>}
    />,

    // 5. Widget
    <Beat
      key="widget"
      eyebrow="Everywhere"
      title="Put the warning where people actually trade."
      body="One script tag drops the TokenShield badge straight into a DEX or wallet interface. The signal shows up at the moment of the swap, not in a report nobody opens."
      visual={<WidgetVisual />}
      cta={
        <Button href="/docs#widget" variant="outline">
          Embed the widget
        </Button>
      }
    />,

    // 6. Closing
    <div key="closing" className="relative z-10 mx-auto w-full max-w-4xl text-center">
      <span className="mb-5 inline-block font-mono text-xs uppercase tracking-[0.22em] text-[#44DCEA]">
        One trust layer
      </span>
      <h2 className="text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-[#E6EAF2] sm:text-5xl">
        Sui is the newest ecosystem. Not the only one.
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#8A93A6]">
        The same idea runs on EVM at trustgated.xyz. Wallets, tokens, and gated access,
        one trust layer reaching across chains.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button href="/token-shield" size="lg">
          Check a token
        </Button>
        <Button href={EVM_SITE} external variant="outline" size="lg">
          Visit TrustGate EVM
        </Button>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SURFACES.map((surface) => (
          <Link key={surface.href} href={surface.href}>
            <Card interactive padded={false} className="h-full">
              <div className="p-4 text-left">
                <p className="text-sm font-medium text-[#E6EAF2]">{surface.label}</p>
                <p className="mt-1 text-xs text-[#5A6478]">{surface.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>,
  ];

  const count = panels.length;

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (let i = 0; i < count; i += 1) {
        const inner = innerRefs.current[i];
        if (!inner) continue;
        const next = sectionRefs.current[i + 1];
        if (!next) {
          inner.style.transform = "";
          inner.style.opacity = "";
          inner.style.filter = "";
          continue;
        }
        const nextTop = next.getBoundingClientRect().top;
        let progress = 1 - nextTop / viewport;
        progress = Math.min(1, Math.max(0, progress));
        const scale = 1 - 0.08 * progress;
        const lift = -28 * progress;
        const tilt = 7 * progress;
        const fade = 1 - 0.55 * progress;
        const dim = 1 - 0.4 * progress;
        inner.style.transform = `translateY(${lift}px) scale(${scale}) rotateX(${tilt}deg)`;
        inner.style.opacity = `${fade}`;
        inner.style.filter = `brightness(${dim})`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <div className="bg-[#0A0F1E]">
      {panels.map((content, i) => (
        <section
          key={i}
          ref={(el) => {
            sectionRefs.current[i] = el;
          }}
          className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0F1E]"
          style={{ zIndex: i, perspective: "1200px" }}
        >
          <div
            ref={(el) => {
              innerRefs.current[i] = el;
            }}
            className="relative flex min-h-screen w-full items-center justify-center px-6 py-24"
            style={{ transformOrigin: "center top", willChange: "transform, opacity" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#44DCEA]/30 to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#44DCEA]/[0.05] blur-[120px]"
            />
            {content}
          </div>
        </section>
      ))}
    </div>
  );
}
