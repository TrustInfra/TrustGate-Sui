"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useTrustScore } from "@/hooks/useTrustScore";
import { WalletScoreCard } from "@/components/WalletScoreCard";
import { SiteNav } from "@/components/SiteNav";
import { BackgroundPaths } from "@/components/BackgroundPaths";

function isValidSuiAddress(a: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(a.trim());
}

function truncate(a: string): string {
  return a.length > 16 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;
}

export default function TrustScorePage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [invalid, setInvalid] = useState(false);
  const account = useCurrentAccount();
  const { data, isFetching, isError } = useTrustScore(query);

  const run = (value: string) => {
    const v = value.trim();
    if (isValidSuiAddress(v)) {
      setInput(v);
      setInvalid(false);
      setQuery(v);
    } else {
      setInput(v);
      setQuery(undefined);
      setInvalid(v.length > 0);
    }
  };

  const loading = Boolean(query) && isFetching && data === undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0F1E] text-slate-200">
      <BackgroundPaths />
      <SiteNav />

      <main className="relative z-10 mx-auto w-full max-w-xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-teal-300/80">
          Wallet trust
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          Trust Score
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-400">
          {`Check a Sui wallet's on-chain trust score. Read straight from the registry, no gas and no signing.`}
        </p>

        <div className="mt-7 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run(input);
            }}
            placeholder="0x..."
            spellCheck={false}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#0d1426]/70 px-4 py-3 font-mono text-sm text-slate-100 outline-none backdrop-blur transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/15"
          />
          <button
            type="button"
            onClick={() => run(input)}
            className="rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-400/20 transition hover:bg-teal-300 active:scale-[0.98]"
          >
            Check
          </button>
        </div>

        {account && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-600">Connected</span>
            <button
              type="button"
              onClick={() => run(account.address)}
              className="rounded-full border border-slate-700/70 bg-slate-800/40 px-3 py-1 font-mono text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              Use my wallet ({truncate(account.address)})
            </button>
          </div>
        )}

        <div className="mt-8 min-h-[2rem]">
          {invalid && (
            <div className="rounded-xl border border-slate-700 bg-[#0d1426]/80 px-4 py-3 text-sm text-slate-400 backdrop-blur">
              That does not look like a Sui address. It should start with 0x.
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
              Reading on-chain
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              Could not read this address from the registry. Check the address
              and try again.
            </div>
          )}

          {data && query && <WalletScoreCard score={data} address={query} />}

          {data === null && query && !isFetching && (
            <div className="rounded-xl border border-slate-700 bg-[#0d1426]/80 px-4 py-3 text-sm leading-relaxed text-slate-400 backdrop-blur">
              This wallet has not been scored yet. Trust scores are written
              on-chain by the oracle, so an address only shows a score once it
              has been scored.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
