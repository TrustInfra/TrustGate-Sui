"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useTrustScore } from "@/hooks/useTrustScore";
import { WalletScoreCard } from "@/components/WalletScoreCard";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
  const { data, isFetching, isError, refetch } = useTrustScore(query);

  // Local state for the on-demand scoring flow in the not-scored branch only.
  // "idle": show the score prompt. "pending": request and on-chain polling in
  // flight. "error": the oracle trigger failed. "timeout": the oracle accepted
  // but the on-chain write has not landed within the poll window.
  type ScoringState = "idle" | "pending" | "error" | "timeout";
  const [scoringState, setScoringState] = useState<ScoringState>("idle");
  const [scoreError, setScoreError] = useState<string | null>(null);
  // The address the scoring state belongs to. When the looked-up query differs,
  // the scoring state is stale from a previous lookup and reads as idle, so a
  // new lookup never inherits another address's scoring UI.
  const [scoringFor, setScoringFor] = useState<string | undefined>(undefined);
  const scoring: ScoringState = scoringFor === query ? scoringState : "idle";

  // Triggers a live score, then polls the on-chain read until the score lands.
  // The oracle response is only a trigger and an error signal; the number shown
  // always comes from the existing useTrustScore on-chain read, never from here.
  const scoreWallet = async () => {
    if (!query) return;
    setScoringFor(query);
    setScoringState("pending");
    setScoreError(null);

    let body: { ok?: boolean; error?: string };
    try {
      const res = await fetch("/api/score-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: query }),
      });
      body = (await res.json()) as { ok?: boolean; error?: string };
    } catch {
      setScoringState("error");
      setScoreError("Could not reach the scoring service.");
      return;
    }

    if (!body.ok) {
      setScoringState("error");
      setScoreError(body.error ?? "Scoring failed, try again.");
      return;
    }

    // Poll the on-chain read about every 3 seconds, up to 12 attempts. As soon
    // as a real score appears (data is no longer null), the has-score branch
    // renders the WalletScoreCard from the chain read and we stop.
    for (let attempt = 0; attempt < 12; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const result = await refetch();
      if (result.data) return;
    }

    setScoringState("timeout");
  };

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
    <div className="relative min-h-screen overflow-hidden">
      <Section
        eyebrow="Trust Score"
        title="Check a Sui wallet's on-chain trust score."
        subtitle="Read straight from the registry, no gas and no signing."
        width="narrow"
      >
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") run(input);
                }}
                placeholder="0x..."
                spellCheck={false}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0F1E] px-4 py-3 font-mono text-sm text-[#E6EAF2] outline-none transition placeholder:text-[#5A6478] focus:border-[#44DCEA]/60 focus:ring-2 focus:ring-[#44DCEA]/20"
              />
              <Button onClick={() => run(input)}>Check</Button>
            </div>

            {account && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">
                  Connected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => run(account.address)}
                >
                  Use my wallet ({truncate(account.address)})
                </Button>
              </div>
            )}
          </Card>

          <div className="min-h-[2rem]">
            {invalid && (
              <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Badge intent="default">Invalid</Badge>
                  <span className="text-sm text-[#8A93A6]">
                    That does not look like a Sui address. It should start with
                    0x.
                  </span>
                </div>
              </Card>
            )}

            {loading && (
              <Card>
                <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#44DCEA]" />
                  Reading on-chain
                </div>
              </Card>
            )}

            {isError && (
              <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Badge intent="danger">Error</Badge>
                  <span className="text-sm text-[#8A93A6]">
                    Could not read this address from the registry. Check the
                    address and try again.
                  </span>
                </div>
              </Card>
            )}

            {data && query && <WalletScoreCard score={data} address={query} />}

            {data === null && query && (!isFetching || scoring !== "idle") && (
              <Card>
                {scoring === "error" ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Badge intent="danger">Scoring failed</Badge>
                    <span className="text-sm leading-relaxed text-[#8A93A6]">
                      {scoreError}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Badge intent="default">Unscored</Badge>
                    <span className="text-sm leading-relaxed text-[#8A93A6]">
                      This wallet has not been scored yet. Trust scores are
                      written on-chain by the oracle, so an address only shows a
                      score once it has been scored.
                    </span>
                  </div>
                )}

                <div className="mt-5">
                  {scoring === "pending" ? (
                    <div className="flex flex-col gap-3">
                      <Button disabled>Score this wallet</Button>
                      <span className="text-sm text-[#8A93A6]">
                        Scoring this wallet, this can take a moment.
                      </span>
                    </div>
                  ) : scoring === "timeout" ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        onClick={() => {
                          setScoringState("idle");
                          void refetch();
                        }}
                      >
                        Refresh
                      </Button>
                      <span className="text-sm text-[#8A93A6]">
                        Score is being written on-chain. Refresh in a moment.
                      </span>
                    </div>
                  ) : (
                    <Button onClick={() => void scoreWallet()}>
                      Score this wallet
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
