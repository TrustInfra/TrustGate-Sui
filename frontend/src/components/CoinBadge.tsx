"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  type CoinScore,
  type CoinTier,
  TIER_STYLE,
  CONFIDENCE_LABEL,
  flagLabel,
} from "@/lib/tokenshield";

function fmtNum(n: number | null): string {
  if (n === null) return "unknown";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function fmtUsd(n: number | null): string {
  if (n === null) return "unknown";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type BadgeIntent = "success" | "warn" | "danger" | "accent";

/**
 * Maps the tier the oracle already provides to a Badge intent. No score
 * thresholds live here, the tier label is the single source of truth.
 */
function tierIntent(tier: CoinTier): BadgeIntent {
  switch (tier) {
    case "VERIFIED":
    case "HIGH":
      return "success";
    case "MEDIUM":
      return "warn";
    case "LOW":
    case "FLAGGED":
      return "danger";
    default:
      return "accent";
  }
}

interface CoinBadgeProps {
  score: CoinScore;
  defaultExpanded?: boolean;
}

export function CoinBadge({ score, defaultExpanded = false }: CoinBadgeProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const tier = TIER_STYLE[score.tier];
  const s = score.signals;

  // Same signal set as before, formatted into label/value chips.
  const signals: Array<{ label: string; value: string }> = [
    {
      label: "Age",
      value: s.ageInDays === null ? "unknown" : `${s.ageInDays} days`,
    },
    { label: "Holders", value: fmtNum(s.holderCount) },
    { label: "Transfers", value: fmtNum(s.transferCount) },
    { label: "Liquidity", value: fmtUsd(s.liquidityUsd) },
    {
      label: "Top 10 hold",
      value:
        s.supplyConcentrationTop10Pct === null
          ? "unknown"
          : `${s.supplyConcentrationTop10Pct.toFixed(1)}%`,
    },
    {
      label: "Deployer score",
      value: s.deployerScore === null ? "unscored" : `${s.deployerScore}`,
    },
    {
      label: "Metadata",
      value: s.hasVerifiedMetadata ? "verified" : "unverified",
    },
    { label: "Supply", value: s.mintable ? "mintable" : "fixed" },
  ];

  return (
    <Card className="w-full">
      <div className="break-all rounded-lg border border-white/[0.08] bg-[#0A0F1E] px-3 py-2 font-mono text-xs text-[#8A93A6]">
        {score.coinType}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {score.metadata.iconUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={score.metadata.iconUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
            )}
            <span className="truncate font-display font-semibold tracking-tight text-[#E6EAF2]">
              {score.metadata.name}
            </span>
            {score.verified && (
              <span className="text-[#44DCEA]" aria-label="verified">
                &#10003;
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">
            {score.metadata.symbol}
          </div>
        </div>
        <Badge intent={tierIntent(score.tier)}>{tier.label}</Badge>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-end gap-2">
          <span className="font-display text-4xl font-semibold leading-none text-[#E6EAF2]">
            {score.score}
          </span>
          <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A6478]">
            score
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">
          {CONFIDENCE_LABEL[score.confidence]}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#8A93A6]">{tier.blurb}</p>

      {score.flags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {score.flags.map((code) => (
            <Badge key={code} intent="danger">
              {flagLabel(code)}
            </Badge>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478] transition hover:text-[#8A93A6]"
      >
        {open ? "Hide signals" : "Show signals"}
        <span
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          &#8964;
        </span>
      </button>

      {open && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.08] pt-4">
          {signals.map((sig) => (
            <Badge key={sig.label}>{`${sig.label} ${sig.value}`}</Badge>
          ))}
        </div>
      )}

      <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A6478]">
        Scored {timeAgo(score.scoredAt)}
      </div>
    </Card>
  );
}
