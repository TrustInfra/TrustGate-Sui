"use client";

import Link from "next/link";
import type { TrustScore } from "@/hooks/useTrustScore";

const TIER_STYLE: Record<number, { label: string; color: string; blurb: string }> = {
  0: { label: "Low", color: "#F97316", blurb: "Below the trust threshold." },
  1: { label: "Medium", color: "#FBBF24", blurb: "Some trust signals, not enough for gated access." },
  2: { label: "High", color: "#4ADE80", blurb: "Trusted wallet." },
  3: { label: "Elite", color: "#2DD4BF", blurb: "Top tier trust." },
};

const BLOCKED = "#F43F5E";

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
  const color = score.botFlagged ? BLOCKED : tier.color;

  const r = 26;
  const c = 2 * Math.PI * r;
  const filled = (score.score / 100) * c;

  const qualifiesText = score.botFlagged
    ? "Access denied"
    : score.qualifies === "ELITE"
      ? "Qualifies for elite gated access"
      : score.qualifies === "STANDARD"
        ? "Qualifies for standard gated access"
        : "Does not meet the trust threshold";

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border backdrop-blur-sm"
      style={{
        borderColor: `${color}40`,
        background:
          "linear-gradient(160deg, rgba(17,26,48,0.92), rgba(11,17,32,0.92))",
        boxShadow: `0 20px 50px -20px ${color}55`,
      }}
    >
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative h-[68px] w-[68px] shrink-0">
            <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
              <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="5" />
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
                {score.score}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-mono text-sm text-slate-200">{truncate(address)}</div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${color}1f`, color }}
              >
                {score.botFlagged ? "Blocked" : tier.label}
              </span>
              <span className="text-xs text-slate-500">
                {score.confidenceLabel.toLowerCase()} confidence
              </span>
            </div>
          </div>
        </div>

        {score.botFlagged && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            Trust blocked. This wallet is bot-flagged and is treated as untrusted
            regardless of score.
          </div>
        )}

        <p className="mt-3.5 text-sm text-slate-400">
          {score.botFlagged
            ? "No cap can be minted and every gate rejects it."
            : tier.blurb}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
          <span className="text-sm text-slate-300">{qualifiesText}</span>
          {!score.botFlagged && score.qualifies !== "NONE" && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-teal-300 transition hover:text-teal-200"
            >
              Open pool &#8594;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
