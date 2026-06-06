"use client";

import { useState } from "react";
import {
  type CoinScore,
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

/** Circular gauge that fills proportional to score, in the tier color. */
function ScoreGauge({ score, color }: { score: number; color: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="rgba(148,163,184,0.16)"
          strokeWidth="5"
        />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  );
}

interface CoinBadgeProps {
  score: CoinScore;
  defaultExpanded?: boolean;
}

export function CoinBadge({ score, defaultExpanded = false }: CoinBadgeProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const tier = TIER_STYLE[score.tier];
  const s = score.signals;

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border backdrop-blur-sm"
      style={{
        borderColor: `${tier.color}40`,
        background:
          "linear-gradient(160deg, rgba(17,26,48,0.92), rgba(11,17,32,0.92))",
        boxShadow: `0 0 0 1px ${tier.color}10, 0 20px 50px -20px ${tier.color}55`,
      }}
    >
      {/* top accent line */}
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, ${tier.color}, transparent)`,
        }}
      />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <ScoreGauge score={score.score} color={tier.color} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {score.metadata.iconUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={score.metadata.iconUrl}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded-full object-cover"
                />
              )}
              <span className="truncate font-semibold text-slate-100">
                {score.metadata.name}
              </span>
              {score.verified && (
                <span style={{ color: tier.color }} aria-label="verified">
                  &#10003;
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">{score.metadata.symbol}</div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${tier.color}1f`,
                  color: tier.color,
                }}
              >
                {tier.label}
              </span>
              <span className="text-xs text-slate-500">
                {CONFIDENCE_LABEL[score.confidence]}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3.5 text-sm text-slate-400">{tier.blurb}</p>

        {score.flags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {score.flags.map((code) => (
              <span
                key={code}
                className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300"
              >
                {flagLabel(code)}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-slate-200"
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
          <div className="mt-2 border-t border-slate-800 pt-2">
            <SignalRow
              label="Age"
              value={s.ageInDays === null ? "unknown" : `${s.ageInDays} days`}
            />
            <SignalRow label="Holders" value={fmtNum(s.holderCount)} />
            <SignalRow label="Transfers" value={fmtNum(s.transferCount)} />
            <SignalRow label="Liquidity" value={fmtUsd(s.liquidityUsd)} />
            <SignalRow
              label="Top 10 hold"
              value={
                s.supplyConcentrationTop10Pct === null
                  ? "unknown"
                  : `${s.supplyConcentrationTop10Pct.toFixed(1)}%`
              }
            />
            <SignalRow
              label="Deployer score"
              value={
                s.deployerScore === null ? "unscored" : `${s.deployerScore}`
              }
            />
            <SignalRow
              label="Metadata"
              value={s.hasVerifiedMetadata ? "verified" : "unverified"}
            />
            <SignalRow label="Supply" value={s.mintable ? "mintable" : "fixed"} />
          </div>
        )}

        <div className="mt-4 text-[11px] text-slate-600">
          Scored {timeAgo(score.scoredAt)}
        </div>
      </div>
    </div>
  );
}
