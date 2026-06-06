"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// TrustGate EVM site. Single source of truth for the cross-link.
const EVM_SITE = "https://trustgated.xyz";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How scoring works" },
  { id: "reading", label: "Reading a badge" },
  { id: "tiers", label: "Tiers" },
  { id: "checker", label: "Using the checker" },
  { id: "embed", label: "Embed the widget" },
  { id: "faq", label: "FAQ" },
  { id: "ecosystems", label: "TrustGate everywhere" },
  { id: "disclaimer", label: "Disclaimer" },
];

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-slate-800/60 py-10 first:pt-0">
      <h2 className="text-xl font-semibold tracking-tight text-slate-100">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-400">
        {children}
      </div>
    </section>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export default function DocsPage() {
  const active = useScrollSpy(SECTIONS.map((s) => s.id));

  return (
    <div className="relative min-h-screen bg-[#0A0F1E] text-slate-200">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(45,212,191,0.10), transparent 70%)",
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-400/15 text-sm font-bold text-teal-300">
            T
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            TrustGate<span className="ml-1.5 font-normal text-slate-500">Sui</span>
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/token-shield" className="text-slate-400 transition hover:text-slate-100">
            TokenShield
          </Link>
          <a
            href={EVM_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition hover:text-slate-100"
          >
            EVM
          </a>
          <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400">
            Docs
          </span>
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-12 px-6 pb-28 pt-6">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-8 space-y-1">
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
              Documentation
            </div>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`block rounded-md px-3 py-1.5 text-sm transition ${
                  active === s.id
                    ? "bg-teal-400/10 font-medium text-teal-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 max-w-2xl flex-1">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-teal-300/80">
            TokenShield
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-50">Documentation</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
            TokenShield scores Sui coins for legitimacy so you can judge a token
            at a glance before you trade. This page explains what the score
            means, how to read a badge, and how to put one on your own site.
          </p>

          <div className="mt-8">
            <Section id="overview" title="Overview">
              <p>
                Every day people lose money to tokens that look real and are
                not. TokenShield gives a coin a single legitimacy score from 0
                to 100 and a clear tier, built from on-chain and market signals,
                so the risk is visible before you commit funds.
              </p>
              <p>
                It is free and public. No wallet, no sign in, no fee. You can
                check a coin on this site or read the same score through an
                embeddable badge on a DEX or wallet. Scores cover Sui mainnet
                coins.
              </p>
            </Section>

            <Section id="how-it-works" title="How scoring works">
              <p>
                A score blends several independent signals drawn from SuiScan
                data and live on-chain DEX liquidity. No single number tells the
                whole story, so the score weighs them together:
              </p>
              <ul className="list-disc space-y-1.5 pl-5 marker:text-slate-600">
                <li>Age, how long the coin has existed</li>
                <li>Holders, how many wallets hold it and how it is spread</li>
                <li>Distribution, whether a few wallets control most of supply</li>
                <li>Liquidity, how deep the market is and whether you could exit</li>
                <li>Deployer reputation, the standing of the wallet that minted it</li>
                <li>Supply controls, whether the supply can still be inflated or the treasury is locked</li>
                <li>Metadata, whether the coin presents proper, verified details</li>
              </ul>
              <p>
                Alongside the score, each result carries a confidence level. A
                brand new coin with thin data still gets a score, but a lower
                confidence, so you know how much the number is leaning on
                limited information. The exact weighting is kept private so the
                score cannot be gamed.
              </p>
            </Section>

            <Section id="reading" title="Reading a badge">
              <p>
                A badge shows three things. The score, 0 to 100, higher is
                safer. The tier, a plain label for the score band. And flags,
                short warnings that call out specific risks like a mintable
                supply or holders that are too concentrated.
              </p>
              <p>
                On the full badge you can expand the signals to see the numbers
                behind the score: holders, liquidity, age, distribution, and
                supply controls. When a signal cannot be measured yet, it reads
                as unknown rather than guessing.
              </p>
            </Section>

            <Section id="tiers" title="Tiers">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Pill color="#2DD4BF" label="Verified" />
                  <span>A known good token on the allowlist, such as native SUI or major stablecoins.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Pill color="#4ADE80" label="High" />
                  <span>Strong signals across the board. Low risk.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Pill color="#FBBF24" label="Medium" />
                  <span>Mixed signals. Worth a closer look before trading.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Pill color="#F97316" label="Low" />
                  <span>Weak signals and elevated risk. Proceed with caution.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Pill color="#F43F5E" label="Flagged" />
                  <span>Active danger signals. Best avoided.</span>
                </div>
              </div>
            </Section>

            <Section id="checker" title="Using the checker">
              <p>
                Head to the{" "}
                <Link href="/token-shield" className="text-teal-300 underline-offset-2 hover:underline">
                  TokenShield checker
                </Link>
                , paste a Sui coin type, and read the result. A coin type looks
                like 0x[package]::[module]::[NAME], for example 0x2::sui::SUI.
              </p>
              <p>
                The first time anyone looks up a fresh coin, it may show as
                scoring while the data is gathered. Give it a few seconds and
                the badge updates on its own.
              </p>
            </Section>

            <Section id="embed" title="Embed the widget">
              <p>
                Any site can show a TokenShield badge. Add the script once, then
                mark any element with a coin type. The widget fills it with a
                badge that expands on hover to show the signals.
              </p>
              <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0d1426] p-4 text-xs leading-relaxed text-slate-300">
{`<script
  src="https://your-domain/widget.js"
  data-api="https://your-domain/api/coin"
  defer></script>

<span data-trustgate-coin="0x2::sui::SUI"></span>`}
              </pre>
              <p>
                For token lists that render after the page loads, call
                window.TrustGate.scan() once your rows mount and any new
                placeholders get a badge. The widget has no dependencies and its
                styles are isolated, so it will not clash with your own design.
              </p>
            </Section>

            <Section id="faq" title="FAQ">
              <p className="font-medium text-slate-200">Is it really free?</p>
              <p>Yes. The score is a public good. No wallet or payment is needed to read it.</p>
              <p className="font-medium text-slate-200">Does a high score mean a coin is safe?</p>
              <p>
                No. A score is a risk signal, not a promise. A high score means
                the visible signals look healthy, not that a token cannot fail.
                Always do your own research.
              </p>
              <p className="font-medium text-slate-200">Why does a coin show unknown signals?</p>
              <p>
                Newer or thinly traded coins have less data to read, so some
                signals come back unknown and the confidence is lower. As a coin
                matures, the picture fills in.
              </p>
              <p className="font-medium text-slate-200">Which network does it cover?</p>
              <p>Sui mainnet.</p>
            </Section>

            <Section id="ecosystems" title="TrustGate everywhere">
              <p>
                TokenShield on Sui is one part of TrustGate, a trust layer that
                spans multiple chains. The original lives on EVM at{" "}
                <a
                  href={EVM_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-300 underline-offset-2 hover:underline"
                >
                  trustgated.xyz
                </a>
                , where the same idea scores wallets and tokens across EVM
                chains. Sui is the newest ecosystem to join.
              </p>
            </Section>

            <Section id="disclaimer" title="Disclaimer">
              <p>
                TokenShield provides risk signals for informational purposes
                only. It is not financial advice and not a guarantee of safety.
                Scores can be incomplete or wrong, and a token can behave in ways
                no signal predicts. You are responsible for your own decisions.
                Always do your own research before trading.
              </p>
            </Section>
          </div>

          <div className="mt-10 text-xs text-slate-600">
            TrustGate Sui. Free and public.
          </div>
        </main>
      </div>
    </div>
  );
}
