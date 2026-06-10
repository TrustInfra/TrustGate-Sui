"use client";

import type { ReactNode } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Panel } from "./Panel";
import { Badge } from "@/components/ui/Badge";
import { useTrustScore } from "@/hooks/useTrustScore";
import { STANDARD_THRESHOLD, ELITE_THRESHOLD } from "@/lib/trustgate-sui";

const QUALIFIES_COPY: Record<string, string> = {
  ELITE: `Elite tier (score >= ${ELITE_THRESHOLD}). Unlocks elite, unlimited-size gating`,
  STANDARD: `Standard tier (score >= ${STANDARD_THRESHOLD}). Unlocks standard gating`,
  NONE: `Below the standard threshold (${STANDARD_THRESHOLD}). Does not yet qualify`,
};

type BadgeIntent = "success" | "warn" | "danger" | "accent";

/** Maps the tier label the hook already provides to a Badge intent. */
function tierIntent(tierLabel: string, botFlagged: boolean): BadgeIntent {
  if (botFlagged) return "danger";
  switch (tierLabel) {
    case "HIGH":
    case "HIGH_ELITE":
      return "success";
    case "MEDIUM":
      return "warn";
    case "LOW":
      return "danger";
    default:
      return "accent";
  }
}

export function ScorePanel() {
  const account = useCurrentAccount();
  const { data, isLoading, isError, error } = useTrustScore(account?.address);

  return (
    <Panel title="Trust Score" eyebrow="01 / Registry">
      {!account ? (
        <StateLine badge={<Badge intent="default">Not connected</Badge>}>
          Connect a wallet to read its on-chain trust score.
        </StateLine>
      ) : isLoading ? (
        <StateLine badge={<Badge intent="default">Reading</Badge>}>
          Reading the score registry…
        </StateLine>
      ) : isError ? (
        <StateLine badge={<Badge intent="danger">Error</Badge>}>
          Failed to read the registry: {String(error?.message ?? error)}
        </StateLine>
      ) : !data ? (
        <StateLine badge={<Badge intent="default">Unscored</Badge>}>
          The oracle has not scored this wallet yet. Trust scores are written
          on-chain by the off-chain oracle; until then this address has no
          record in the registry.
        </StateLine>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">
              {data.confidenceLabel.toLowerCase()} confidence
            </span>
            <Badge intent={tierIntent(data.tierLabel, data.botFlagged)}>
              {data.botFlagged ? "Blocked" : data.tierLabel}
            </Badge>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-5xl font-semibold leading-none text-[#E6EAF2]">
              {data.score}
            </span>
            <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A6478]">
              / 100
            </span>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2BA7B3] to-[#44DCEA]"
              style={{ width: `${data.score}%` }}
            />
          </div>

          {data.botFlagged ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-red-400">
                Trust blocked
              </p>
              <p className="mt-2 text-sm leading-relaxed text-red-400">
                This wallet is bot-flagged. On-chain trust is denied regardless
                of the numeric score: <code>is_trusted</code> returns false, no
                TrustedAgentCap can be minted, and every gated action rejects it.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-[#8A93A6]">
              {QUALIFIES_COPY[data.qualifies]}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

function StateLine({
  badge,
  children,
}: {
  badge: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {badge}
      <span className="text-sm leading-relaxed text-[#8A93A6]">{children}</span>
    </div>
  );
}
