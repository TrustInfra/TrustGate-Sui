"use client";

import { useState } from "react";
import { useCoinScore } from "@/hooks/useCoinScore";
import { CoinBadge } from "@/components/CoinBadge";
import { TOKENSHIELD_LIVE } from "@/lib/tokenshield";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const EXAMPLES: Array<{ label: string; type: string }> = [
  { label: "SUI", type: "0x2::sui::SUI" },
  {
    label: "DeepBook",
    type: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  },
  {
    label: "Walrus",
    type: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
  },
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <Section
          eyebrow="TokenShield"
          title="Check a Sui coin for legitimacy before you trade."
          subtitle="Paste a coin type and get a score, a tier, and the signals behind it."
          width="narrow"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">
                Sui mainnet
              </span>
              {!TOKENSHIELD_LIVE && <Badge intent="warn">Preview</Badge>}
            </div>

            <Card>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") run(input);
                  }}
                  placeholder="Coin type, e.g. 0x2::sui::SUI"
                  spellCheck={false}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0F1E] px-4 py-3 font-mono text-sm text-[#E6EAF2] outline-none transition placeholder:text-[#5A6478] focus:border-[#44DCEA]/60 focus:ring-2 focus:ring-[#44DCEA]/20"
                />
                <Button onClick={() => run(input)}>Check</Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">
                  Try
                </span>
                {EXAMPLES.map((ex) => (
                  <Button
                    key={ex.type}
                    variant="outline"
                    size="sm"
                    onClick={() => run(ex.type)}
                  >
                    {ex.label}
                  </Button>
                ))}
              </div>
            </Card>

            <div className="min-h-[2rem]">
              {loading && (
                <Card>
                  <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#44DCEA]" />
                    Scoring
                  </div>
                </Card>
              )}
              {isError && (
                <Card>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Badge intent="danger">Error</Badge>
                    <span className="text-sm text-[#8A93A6]">
                      Could not reach the scoring service. Try again in a moment.
                    </span>
                  </div>
                </Card>
              )}
              {data?.status === "OK" && <CoinBadge score={data.data} />}
              {data?.status === "PENDING" && (
                <Card>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Badge intent="warn">Pending</Badge>
                    <span className="text-sm text-[#8A93A6]">
                      Not scored yet. Scoring in progress, this updates
                      automatically.
                    </span>
                  </div>
                </Card>
              )}
              {data?.status === "NOT_FOUND" && (
                <Card>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Badge intent="default">Not found</Badge>
                    <span className="text-sm text-[#8A93A6]">
                      No coin found for that type on Sui mainnet.
                    </span>
                  </div>
                </Card>
              )}
              {data?.status === "INVALID" && (
                <Card>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Badge intent="default">Invalid</Badge>
                    <span className="text-sm text-[#8A93A6]">
                      That does not look like a valid coin type. Format is
                      0x[package]::[module]::[NAME].
                    </span>
                  </div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title}>
                  <div className="font-display text-sm font-semibold tracking-tight text-[#E6EAF2]">
                    {f.title}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#8A93A6]">
                    {f.body}
                  </p>
                </Card>
              ))}
            </div>

            {!TOKENSHIELD_LIVE && (
              <p className="font-mono text-[11px] leading-relaxed text-[#5A6478]">
                Preview shows sample data. The live endpoint scores real Sui
                mainnet coins.
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
