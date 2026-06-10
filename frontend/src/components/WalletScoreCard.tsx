"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { TrustScore } from "@/hooks/useTrustScore";

const TIER_STYLE: Record<number, { label: string; blurb: string }> = {
  0: { label: "Low", blurb: "Below the trust threshold." },
  1: { label: "Medium", blurb: "Some trust signals, not enough for gated access." },
  2: { label: "High", blurb: "Trusted wallet." },
  3: { label: "Elite", blurb: "Top tier trust." },
};

type BadgeIntent = "success" | "warn" | "danger" | "accent";

/**
 * Maps the tier label the hook already provides to a Badge intent. A bot-flagged
 * wallet is always danger. No score thresholds live here.
 */
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

function truncate(a: string): string {
  return a.length > 16 ? `${a.slice(0, 8)}...${a.slice(-6)}` : a;
}

export function WalletScoreCard({
  score,
  address,
}: {
  score: TrustScore;
  address: string;
}) {
  const tier = TIER_STYLE[score.tier] ?? TIER_STYLE[0];

  const qualifiesText = score.botFlagged
    ? "Access denied"
    : score.qualifies === "ELITE"
      ? "Qualifies for elite gated access"
      : score.qualifies === "STANDARD"
        ? "Qualifies for standard gated access"
        : "Does not meet the trust threshold";

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-[#8A93A6]">
          {truncate(address)}
        </span>
        <Badge intent={tierIntent(score.tierLabel, score.botFlagged)}>
          {score.botFlagged ? "Blocked" : tier.label}
        </Badge>
      </div>

      <div className="mt-5 flex items-end gap-3">
        <span className="font-display text-5xl font-semibold leading-none text-[#E6EAF2]">
          {score.score}
        </span>
        <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A6478]">
          / 100 trust
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2BA7B3] to-[#44DCEA]"
          style={{ width: `${score.score}%` }}
        />
      </div>

      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">
        {score.confidenceLabel.toLowerCase()} confidence
      </div>

      {score.botFlagged && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
          Trust blocked. This wallet is bot-flagged and is treated as untrusted
          regardless of score.
        </div>
      )}

      <p className="mt-4 text-sm leading-relaxed text-[#8A93A6]">
        {score.botFlagged
          ? "No cap can be minted and every gate rejects it."
          : tier.blurb}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
        <span className="text-sm text-[#8A93A6]">{qualifiesText}</span>
        {!score.botFlagged && score.qualifies !== "NONE" && (
          <Button href="/dashboard" variant="ghost" size="sm">
            Open pool &#8594;
          </Button>
        )}
      </div>
    </Card>
  );
}
