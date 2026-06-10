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

            {data === null && query && !isFetching && (
              <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <Badge intent="default">Unscored</Badge>
                  <span className="text-sm leading-relaxed text-[#8A93A6]">
                    This wallet has not been scored yet. Trust scores are written
                    on-chain by the oracle, so an address only shows a score once
                    it has been scored.
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
