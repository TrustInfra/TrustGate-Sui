"use client";

import { useState } from "react";
import Link from "next/link";
import { useCoinScore } from "@/hooks/useCoinScore";
import { CoinBadge } from "@/components/CoinBadge";
import { BackgroundPaths } from "@/components/BackgroundPaths";
import { TOKENSHIELD_LIVE } from "@/lib/tokenshield";

const EXAMPLES: Array<{ label: string; type: string }> = [
  { label: "SUI", type: "0x2::sui::SUI" },
  { label: "Sample coin", type: "0xabc::sample::COIN" },
  { label: "Flagged", type: "0x99::scam::RUG" },
  { label: "Pending", type: "0x55::new::SOON" },
];

const FEATURES: Array<{ title: string; body: string }> = [
  { title: "SuiScan data", body: "Holder count, distribution, supply" },
  { title: "Live DEX liquidity", body: "Pool depth across Sui DEXes" },
  { title: "Free and public", body: "No wallet, no key, no fee" },
];

const DEFAULT_QUERY = "0x2::sui::SUI";

export default function TokenShieldPage() {
  const [input, setInput] = useState(DEFAULT_QUERY);
  const [query, setQuery] = useState<string | null>(DEFAULT_QUERY);
  const { data, isFetching, isError } = useCoinScore(query);

  const run = (value: string) => {
    const v = value.trim();
    if (v.length > 0) {
      setInput(v);
      setQuery(v);
    }
  };

  const loading = Boolean(query) && isFetching && data?.status !== "PENDING";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0F1E] text-slate-200">
      <BackgroundPaths />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-400/15 text-sm font-bold text-teal-300">
            T
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            TrustGate
            <span className="ml-1.5 font-normal text-slate-500">Sui</span>
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-slate-400 transition hover:text-slate-100">
            Dashboard
          </Link>
          <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400">
            Sui Testnet
          </span>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-teal-300/80">
            Token legitimacy
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Sui mainnet
          </span>
          {!TOKENSHIELD_LIVE && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
              Preview
            </span>
          )}
        </div>

        <h1 className="mt-3 bg-gradient-to-br from-white via-slate-100 to-teal-200 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          TokenShield
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
          Check a Sui coin for legitimacy before you trade. Paste a coin type
          and get a score, a tier, and the signals behind it.
        </p>

        <div className="mt-7 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run(input);
            }}
            placeholder="0x2::sui::SUI"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#0d1426]/70 px-4 py-3 text-sm text-slate-100 outline-none backdrop-blur transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/15"
          />
          <button
            type="button"
            onClick={() => run(input)}
            className="rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-400/20 transition hover:bg-teal-300 active:scale-[0.98]"
          >
            Check
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600">Try</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.type}
              type="button"
              onClick={() => run(ex.type)}
              className="rounded-full border border-slate-700/70 bg-slate-800/40 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-[2rem]">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
              Scoring
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              Could not reach the scoring service. Try again in a moment.
            </div>
          )}
          {data?.status === "OK" && <CoinBadge score={data.data} />}
          {data?.status === "PENDING" && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0d1426]/80 px-4 py-3 text-sm text-slate-400 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Not scored yet. Scoring in progress, this updates automatically.
            </div>
          )}
          {data?.status === "NOT_FOUND" && (
            <div className="rounded-xl border border-slate-700 bg-[#0d1426]/80 px-4 py-3 text-sm text-slate-400 backdrop-blur">
              No coin found for that type on Sui mainnet.
            </div>
          )}
          {data?.status === "INVALID" && (
            <div className="rounded-xl border border-slate-700 bg-[#0d1426]/80 px-4 py-3 text-sm text-slate-400 backdrop-blur">
              That does not look like a valid coin type. Format is
              0x[package]::[module]::[NAME].
            </div>
          )}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-800/80 bg-[#0d1426]/40 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                {f.title}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        {!TOKENSHIELD_LIVE && (
          <p className="mt-8 text-[11px] text-slate-600">
            Preview shows sample data. The live endpoint scores real Sui mainnet
            coins.
          </p>
        )}
      </main>
    </div>
  );
}
