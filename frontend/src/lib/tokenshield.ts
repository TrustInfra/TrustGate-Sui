/**
 * TokenShield (Sui) coin scoring. Frontend source of truth.
 *
 * The client never calls the oracle directly. It calls a same-origin proxy at
 * /api/coin, which forwards to the oracle server-side. That avoids mixed
 * content (oracle is http on a raw IP for now) and CORS, and keeps the oracle
 * location out of client code.
 *
 * Nald's oracle returns a flat shape with slightly different field names than
 * our spec. The normalize step below maps his wire format to one clean
 * internal CoinScore, so the rest of the app and the widget read a stable
 * shape no matter how his output is named.
 */

// ===== Live switch and route =====

/** Mock until explicitly switched on. Set NEXT_PUBLIC_TOKENSHIELD_LIVE=true. */
export const TOKENSHIELD_LIVE =
  process.env.NEXT_PUBLIC_TOKENSHIELD_LIVE === "true";

/** Same-origin proxy path. The server route forwards to the oracle. */
export function coinScoreUrl(coinType: string): string {
  return `/api/coin?type=${encodeURIComponent(coinType)}`;
}

// ===== Tier and confidence model =====

export const COIN_TIER = [
  "VERIFIED",
  "HIGH",
  "MEDIUM",
  "LOW",
  "FLAGGED",
] as const;
export type CoinTier = (typeof COIN_TIER)[number];

export type CoinConfidence = "LOW" | "MEDIUM" | "HIGH";

// ===== Clean internal shape (what the app and widget read) =====

export interface CoinScoreSignals {
  ageInDays: number | null;
  holderCount: number | null;
  transferCount: number | null;
  liquidityUsd: number | null;
  deployerScore: number | null;
  supplyConcentrationTop10Pct: number | null;
  hasVerifiedMetadata: boolean;
  frozenTreasury: boolean;
  mintable: boolean;
}

export interface CoinMetadata {
  name: string;
  symbol: string;
  decimals: number;
  iconUrl: string | null;
  description?: string;
}

export interface CoinScore {
  coinType: string;
  score: number;
  tier: CoinTier;
  confidence: CoinConfidence;
  verified: boolean;
  signals: CoinScoreSignals;
  flags: string[];
  metadata: CoinMetadata;
  scoredAt: string;
  nextRescoreAt: string;
}

export type CoinScoreResult =
  | { status: "OK"; data: CoinScore }
  | { status: "PENDING"; coinType: string }
  | { status: "NOT_FOUND"; coinType: string }
  | { status: "INVALID"; coinType: string };

// ===== Oracle wire shape (Nald's flat response) =====

interface RawSignals {
  ageInDays: number | null;
  holderCount: number | null;
  transferCount: number | null;
  liquidityUsd: number | null;
  deployerScore: number | null;
  supplyConcentrationTop10Pct: number | null;
  hasVerifiedMetadata: boolean;
  isMintable: boolean;
  isFrozen: boolean;
}

interface RawMetadata {
  name: string;
  symbol: string;
  description?: string;
  iconUrl?: string;
  decimals: number;
  totalSupply?: number | null;
}

interface RawCoinSuccess {
  coinType: string;
  score: number;
  tier: CoinTier;
  confidence: CoinConfidence;
  verified: boolean;
  signals: RawSignals;
  flags: string[];
  metadata: RawMetadata;
  scoredAt: string;
  nextRescoreAt: string;
}

/** Maps Nald's flat wire shape to the clean internal CoinScore. */
function normalizeCoin(raw: RawCoinSuccess): CoinScore {
  const icon = raw.metadata.iconUrl;
  return {
    coinType: raw.coinType,
    score: raw.score,
    tier: raw.tier,
    confidence: raw.confidence,
    verified: raw.verified,
    signals: {
      ageInDays: raw.signals.ageInDays,
      holderCount: raw.signals.holderCount,
      transferCount: raw.signals.transferCount,
      liquidityUsd: raw.signals.liquidityUsd,
      deployerScore: raw.signals.deployerScore,
      supplyConcentrationTop10Pct: raw.signals.supplyConcentrationTop10Pct,
      hasVerifiedMetadata: raw.signals.hasVerifiedMetadata,
      frozenTreasury: raw.signals.isFrozen,
      mintable: raw.signals.isMintable,
    },
    flags: raw.flags ?? [],
    metadata: {
      name: raw.metadata.name,
      symbol: raw.metadata.symbol,
      decimals: raw.metadata.decimals,
      iconUrl: icon && icon.length > 0 ? icon : null,
      description: raw.metadata.description || undefined,
    },
    scoredAt: raw.scoredAt,
    nextRescoreAt: raw.nextRescoreAt,
  };
}

// ===== Display tokens =====

export interface TierStyle {
  label: string;
  color: string;
  blurb: string;
}

export const TIER_STYLE: Record<CoinTier, TierStyle> = {
  VERIFIED: { label: "Verified", color: "#2DD4BF", blurb: "Known good token on the allowlist" },
  HIGH: { label: "High", color: "#4ADE80", blurb: "Strong legitimacy signals, low risk" },
  MEDIUM: { label: "Medium", color: "#FBBF24", blurb: "Mixed signals, trade with care" },
  LOW: { label: "Low", color: "#F97316", blurb: "Weak signals, elevated risk" },
  FLAGGED: { label: "Flagged", color: "#F43F5E", blurb: "Active danger signals, avoid" },
};

export const CONFIDENCE_LABEL: Record<CoinConfidence, string> = {
  LOW: "Low confidence",
  MEDIUM: "Medium confidence",
  HIGH: "High confidence",
};

export const FLAG_LABEL: Record<string, string> = {
  NEW_TOKEN: "New token",
  LOW_LIQUIDITY: "Low liquidity",
  CONCENTRATED_HOLDERS: "Concentrated holders",
  MINTABLE_SUPPLY: "Mintable supply",
  UNVERIFIED_METADATA: "Unverified metadata",
  DEPLOYER_UNTRUSTED: "Untrusted deployer",
  FEW_HOLDERS: "Few holders",
};

export function flagLabel(code: string): string {
  return FLAG_LABEL[code] ?? code.replace(/_/g, " ").toLowerCase();
}

// ===== Fetcher =====

/**
 * Body-driven, since the oracle signals its state through the response body
 * rather than relying only on HTTP status. Throws on network or 5xx so React
 * Query surfaces it as an error; returns the union for known states.
 */
export async function fetchCoinScore(
  coinType: string,
): Promise<CoinScoreResult> {
  if (!TOKENSHIELD_LIVE) return mockCoinScore(coinType);

  const res = await fetch(coinScoreUrl(coinType), {
    headers: { accept: "application/json" },
  });

  if (res.status >= 500) {
    throw new Error(`oracle responded ${res.status}`);
  }

  const body: unknown = await res.json().catch(() => null);
  const b = body as Record<string, unknown> | null;

  if (b && typeof b.score === "number" && typeof b.tier === "string") {
    return { status: "OK", data: normalizeCoin(b as unknown as RawCoinSuccess) };
  }
  if (b && b.status === "PENDING") {
    return { status: "PENDING", coinType };
  }
  if (res.status === 404 || (b && b.code === "NOT_FOUND")) {
    return { status: "NOT_FOUND", coinType };
  }
  return { status: "INVALID", coinType };
}

// ===== Mock (canonical shape, used until LIVE) =====

export function mockCoinScore(coinType: string): CoinScoreResult {
  const t = coinType.trim();
  if (t.length === 0 || !t.includes("::")) return { status: "INVALID", coinType: t };
  if (t.includes("::new::") || t.endsWith("::PENDING")) return { status: "PENDING", coinType: t };
  if (t.includes("::notfound::")) return { status: "NOT_FOUND", coinType: t };

  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();

  if (t === "0x2::sui::SUI") {
    return {
      status: "OK",
      data: {
        coinType: t, score: 99, tier: "VERIFIED", confidence: "HIGH", verified: true,
        signals: {
          ageInDays: 760, holderCount: 1_900_000, transferCount: 480_000_000,
          liquidityUsd: 84_000_000, deployerScore: 100, supplyConcentrationTop10Pct: 41.2,
          hasVerifiedMetadata: true, frozenTreasury: true, mintable: false,
        },
        flags: [],
        metadata: { name: "Sui", symbol: "SUI", decimals: 9, iconUrl: null },
        scoredAt: iso(now - 36e5), nextRescoreAt: iso(now + 72 * 36e5),
      },
    };
  }

  if (t.toLowerCase().includes("scam") || t.toLowerCase().includes("rug")) {
    return {
      status: "OK",
      data: {
        coinType: t, score: 8, tier: "FLAGGED", confidence: "HIGH", verified: false,
        signals: {
          ageInDays: 2, holderCount: 14, transferCount: 31, liquidityUsd: 120,
          deployerScore: 11, supplyConcentrationTop10Pct: 96.4,
          hasVerifiedMetadata: false, frozenTreasury: false, mintable: true,
        },
        flags: ["NEW_TOKEN", "CONCENTRATED_HOLDERS", "MINTABLE_SUPPLY", "DEPLOYER_UNTRUSTED", "UNVERIFIED_METADATA", "LOW_LIQUIDITY"],
        metadata: { name: "Unknown Token", symbol: "???", decimals: 9, iconUrl: null },
        scoredAt: iso(now - 12e5), nextRescoreAt: iso(now + 36e5),
      },
    };
  }

  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  const score = 35 + (h % 55);
  const tier: CoinTier = score >= 75 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const confidence: CoinConfidence = score >= 75 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";
  const flags: string[] = [];
  if (score < 60) flags.push("LOW_LIQUIDITY");
  if (score < 50) flags.push("FEW_HOLDERS");
  if (h % 3 === 0) flags.push("MINTABLE_SUPPLY");

  return {
    status: "OK",
    data: {
      coinType: t, score, tier, confidence, verified: false,
      signals: {
        ageInDays: 20 + (h % 400), holderCount: 200 + (h % 9000), transferCount: 1000 + (h % 50000),
        liquidityUsd: score < 60 ? null : 5000 + (h % 400000), deployerScore: 30 + (h % 60),
        supplyConcentrationTop10Pct: 20 + (h % 60), hasVerifiedMetadata: score >= 60,
        frozenTreasury: h % 2 === 0, mintable: h % 3 === 0,
      },
      flags,
      metadata: { name: "Sample Coin", symbol: t.split("::").pop()?.slice(0, 6).toUpperCase() ?? "COIN", decimals: 9, iconUrl: null },
      scoredAt: iso(now - 24 * 36e5), nextRescoreAt: iso(now + 24 * 36e5),
    },
  };
}
