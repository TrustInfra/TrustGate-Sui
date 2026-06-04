"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Panel, StatRow } from "./Panel";
import { useTrustScore } from "@/hooks/useTrustScore";
import { STANDARD_THRESHOLD, ELITE_THRESHOLD } from "@/lib/trustgate-sui";

const QUALIFIES_COPY: Record<string, string> = {
  ELITE: `Elite tier (score >= ${ELITE_THRESHOLD}) — unlocks elite, unlimited-size gating`,
  STANDARD: `Standard tier (score >= ${STANDARD_THRESHOLD}) — unlocks standard gating`,
  NONE: `Below the standard threshold (${STANDARD_THRESHOLD}) — does not yet qualify`,
};

export function ScorePanel() {
  const account = useCurrentAccount();
  const { data, isLoading, isError, error } = useTrustScore(account?.address);

  return (
    <Panel title="Trust Score" eyebrow="01 / Registry">
      {!account ? (
        <EmptyHint>Connect a wallet to read its on-chain trust score.</EmptyHint>
      ) : isLoading ? (
        <EmptyHint>Reading the score registry…</EmptyHint>
      ) : isError ? (
        <EmptyHint tone="negative">
          Failed to read the registry: {String(error?.message ?? error)}
        </EmptyHint>
      ) : !data ? (
        <EmptyHint>
          The oracle has not scored this wallet yet. Trust scores are written
          on-chain by the off-chain oracle; until then this address has no
          record in the registry.
        </EmptyHint>
      ) : (
        <div>
          <div className="mb-5 flex items-end gap-3">
            <span className="font-display text-5xl font-extrabold leading-none text-accent">
              {data.score}
            </span>
            <span className="pb-1 font-mono text-sm text-muted">/ 100</span>
          </div>
          <StatRow label="Tier">{data.tierLabel}</StatRow>
          <StatRow label="Confidence">{data.confidenceLabel}</StatRow>
          <StatRow label="Bot flagged">
            <span className={data.botFlagged ? "text-negative" : undefined}>
              {data.botFlagged ? "YES" : "no"}
            </span>
          </StatRow>
          <StatRow label="Qualifies for">{data.qualifies}</StatRow>

          {data.botFlagged ? (
            <div className="mt-4 rounded border border-negative/40 bg-negative/10 p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-negative">
                Trust blocked
              </p>
              <p className="mt-2 text-sm leading-relaxed text-negative">
                This wallet is bot-flagged. On-chain trust is denied regardless
                of the numeric score: <code>is_trusted</code> returns false, no
                TrustedAgentCap can be minted, and every gated action rejects it.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {QUALIFIES_COPY[data.qualifies]}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

function EmptyHint({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "negative";
}) {
  return (
    <p
      className={`text-sm leading-relaxed ${
        tone === "negative" ? "text-negative" : "text-muted"
      }`}
    >
      {children}
    </p>
  );
}
