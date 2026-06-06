"use client";

import Link from "next/link";
import { BackgroundPaths } from "@/components/BackgroundPaths";
import { SiteNav, EVM_SITE } from "@/components/SiteNav";

const SOCIALS = {
  x: "https://x.com/TrustGated",
  youtube: "https://youtube.com/@TrustGated",
  discord: "https://discord.gg/4QJSdc8gbC",
};

const ICONS: Record<string, string> = {
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  discord: "M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.198.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
};

function Social({ kind, href }: { kind: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={kind}
      className="text-slate-500 transition hover:text-teal-300"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d={ICONS[kind]} />
      </svg>
    </a>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-400/20 transition hover:bg-teal-300 active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 transition hover:text-teal-200"
    >
      {children}
      <span aria-hidden>&#8594;</span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0A0F1E] text-slate-200">
      {/* Nav */}
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <BackgroundPaths />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-20 pt-16 text-center sm:pt-24">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/40 px-3 py-1 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Trust infrastructure for Sui
          </div>
          <h1 className="bg-gradient-to-br from-white via-slate-100 to-teal-200 bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-6xl">
            Know a token<br />before you trade it
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-slate-400">
            {`A scam coin and a real one look identical in your wallet. TrustGate scores every Sui token for legitimacy and shows you the risk before you commit a cent.`}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <PrimaryLink href="/token-shield">Check a token</PrimaryLink>
            <GhostLink href="/docs">Read the docs</GhostLink>
          </div>

          {/* decorative badge */}
          <div className="mx-auto mt-14 w-full max-w-sm rounded-2xl border border-teal-400/30 bg-[#0d1426]/80 p-5 text-left backdrop-blur" style={{ boxShadow: "0 20px 50px -20px rgba(45,212,191,0.4)" }}>
            <div className="h-[3px] w-full rounded-full" style={{ background: "linear-gradient(90deg,#2DD4BF,transparent)" }} />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  Sui <span className="text-teal-300">&#10003;</span>
                </div>
                <div className="text-xs text-slate-500">SUI</div>
              </div>
              <div className="text-3xl font-bold text-teal-300">99</div>
            </div>
            <div className="mt-3">
              <span className="rounded-full bg-teal-400/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-300">
                Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why TrustGate exists */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-teal-300/80">The problem</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">Why TrustGate exists</h2>
        <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-slate-400">
          <p>{`Anyone can mint a token in minutes. Most are harmless. Some are traps built to drain whoever buys in. The hard part is that you cannot tell which is which by looking, because on a chain a scam and a blue chip wear the same clothes.`}</p>
          <p>{`People do not lose money because they are careless. They lose it because trust is invisible on-chain. There is no face, no track record, nothing on the surface that says this one is safe and that one is not.`}</p>
          <p>{`TrustGate makes that visible. One score that reads the on-chain and market signals for you and tells you, plainly, whether a token has earned trust or raised flags. It started on EVM. Now it scores Sui.`}</p>
        </div>
        <div className="mt-6">
          <GhostLink href="/docs#how-it-works">See how the score works</GhostLink>
        </div>
      </section>

      {/* The trust score */}
      <section className="border-y border-slate-800/60 bg-[#0b1120]/40">
        <div className="mx-auto w-full max-w-3xl px-6 py-20">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-teal-300/80">The score</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">What a trust score tells you</h2>
          <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-slate-400">
            <p>{`Every coin gets a number from 0 to 100 and a plain tier. Behind that number are real signals: how old the token is, how many wallets hold it, whether a handful of them control the supply, how deep the liquidity runs, who deployed it, and whether the supply can still be inflated.`}</p>
            <p>{`You do not have to read all of that. The badge does the reading and hands you a verdict at a glance: Verified, High, Medium, Low, or Flagged. Green means breathe easy. Red means walk away.`}</p>
          </div>
          <div className="mt-6">
            <GhostLink href="/token-shield">Check a token now</GhostLink>
          </div>
        </div>
      </section>

      {/* Why every DEX needs the widget */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-teal-300/80">For builders</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">Why every DEX should run this</h2>
        <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-slate-400">
          <p>{`A warning only helps if someone sees it at the moment they trade. That moment happens on your exchange, not on some other site they were never going to visit first.`}</p>
          <p>{`TrustGate is one script tag. Drop it in and every token on your DEX shows a trust badge right where users decide to buy. They trade with their eyes open, you cut the rugs that wreck a platform's reputation, and it costs you nothing. Free, public, no wallet, no fee.`}</p>
        </div>
        <div className="mt-6">
          <GhostLink href="/docs#embed">Read the integration guide</GhostLink>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-50">Three ways in</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/token-shield" className="group rounded-2xl border border-slate-800 bg-[#0d1426]/60 p-6 transition hover:border-teal-400/40">
              <div className="text-sm font-semibold text-slate-100">TokenShield checker</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{`Paste any Sui coin type and read its score, tier, and signals in seconds.`}</p>
              <div className="mt-4 text-sm font-medium text-teal-300 opacity-0 transition group-hover:opacity-100">Open &#8594;</div>
            </Link>
            <Link href="/docs#embed" className="group rounded-2xl border border-slate-800 bg-[#0d1426]/60 p-6 transition hover:border-teal-400/40">
              <div className="text-sm font-semibold text-slate-100">Embeddable widget</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{`One script tag puts a live trust badge next to every token on your site.`}</p>
              <div className="mt-4 text-sm font-medium text-teal-300 opacity-0 transition group-hover:opacity-100">Integrate &#8594;</div>
            </Link>
            <Link href="/docs" className="group rounded-2xl border border-slate-800 bg-[#0d1426]/60 p-6 transition hover:border-teal-400/40">
              <div className="text-sm font-semibold text-slate-100">Documentation</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{`How scoring works, what each tier means, and how to read a badge.`}</p>
              <div className="mt-4 text-sm font-medium text-teal-300 opacity-0 transition group-hover:opacity-100">Read &#8594;</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystems */}
      <section className="border-t border-slate-800/60 bg-[#0b1120]/40">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50">One trust layer, every chain</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
            {`TokenShield on Sui is one part of TrustGate. The original runs on EVM, scoring wallets and tokens across chains. Sui is the newest ecosystem to join.`}
          </p>
          <div className="mt-6">
            <a href={EVM_SITE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 transition hover:text-teal-200">
              Visit TrustGate EVM <span aria-hidden>&#8594;</span>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <h2 className="bg-gradient-to-br from-white to-teal-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Start with one token
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-slate-400">
          {`No wallet, no sign up. Paste a coin and see what the chain already knows about it.`}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <PrimaryLink href="/token-shield">Check a token</PrimaryLink>
          <GhostLink href="/docs">Read the docs</GhostLink>
        </div>
      </section>

      <footer className="border-t border-slate-800/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-6 py-8 sm:flex-row sm:justify-between">
          <span className="text-xs text-slate-600">TrustGate Sui. Free and public.</span>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <Link href="/token-shield" className="transition hover:text-slate-400">TokenShield</Link>
            <Link href="/docs" className="transition hover:text-slate-400">Docs</Link>
            <a href={EVM_SITE} target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-400">EVM</a>
          </div>
          <div className="flex items-center gap-4">
            <Social kind="x" href={SOCIALS.x} />
            <Social kind="youtube" href={SOCIALS.youtube} />
            <Social kind="discord" href={SOCIALS.discord} />
          </div>
        </div>
      </footer>
    </div>
  );
}
