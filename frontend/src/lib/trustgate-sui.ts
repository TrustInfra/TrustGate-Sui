/**
 * TrustGate-Sui onchain constants. Single source of truth.
 *
 * Every deployed ID, contract target, and tier rule lives here so nothing in
 * the app is hardcoded twice. If the package is upgraded, only PACKAGE_ID and
 * the call targets change. The shared object IDs (registry, pool) survive an
 * upgrade, so they stay put.
 */

// ===== Network =====

export const SUI_NETWORK = "testnet" as const;

// ===== Deployed objects (Sui testnet) =====

/** Published package. Calls target this. Changes on a package upgrade. */
export const PACKAGE_ID =
  "0x3f06bb8ed79aecdaeecb97feafba276689fcc0fda706953a83718e5a68d4a41a";

/** Shared. The oracle writes scores here, the app reads them. Survives upgrades. */
export const SCORE_REGISTRY_ID =
  "0x02d2ee0f4d0f8aabd79ed10ee02ddb98ce31823fa84757245509b960ddd99c22";

/** Shared. The demo gated pool. Survives upgrades. */
export const GATED_POOL_ID =
  "0x5dca7b3bda58a5ac3596bf1dd67b88af2aa89226ac4f82d9eb01675d3fae92eb";

// ===== Owned object types (for querying a wallet's caps) =====

export const STANDARD_CAP_TYPE = `${PACKAGE_ID}::trusted_agent_cap::TrustedAgentCap`;
export const ELITE_CAP_TYPE = `${PACKAGE_ID}::trusted_agent_cap::TrustedAgentCapElite`;

// ===== Contract call targets =====

export const TARGET = {
  // trust_scoring reads (devInspect, no gas, no signing)
  getScore: `${PACKAGE_ID}::trust_scoring::get_score`,
  getTier: `${PACKAGE_ID}::trust_scoring::get_tier`,
  getConfidence: `${PACKAGE_ID}::trust_scoring::get_confidence`,
  isScored: `${PACKAGE_ID}::trust_scoring::is_scored`,
  isTrusted: `${PACKAGE_ID}::trust_scoring::is_trusted`,
  isBotFlagged: `${PACKAGE_ID}::trust_scoring::is_bot_flagged`,

  // deepbook_gated_pool reads
  canPlaceStandard: `${PACKAGE_ID}::deepbook_gated_pool::can_place_standard`,
  canPlaceElite: `${PACKAGE_ID}::deepbook_gated_pool::can_place_elite`,
  standardSizeLimit: `${PACKAGE_ID}::deepbook_gated_pool::standard_size_limit`,
  totalOrders: `${PACKAGE_ID}::deepbook_gated_pool::total_orders`,

  // deepbook_gated_pool writes (build a tx, sign, submit)
  placeGatedOrder: `${PACKAGE_ID}::deepbook_gated_pool::place_gated_order`,
  placeEliteOrder: `${PACKAGE_ID}::deepbook_gated_pool::place_elite_order`,
} as const;

// ===== Tier model (must match the contract) =====

export const TIER = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  HIGH_ELITE: 3,
} as const;

export const TIER_LABEL: Record<number, string> = {
  0: "LOW",
  1: "MEDIUM",
  2: "HIGH",
  3: "HIGH_ELITE",
};

export const CONFIDENCE = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;

export const CONFIDENCE_LABEL: Record<number, string> = {
  0: "LOW",
  1: "MEDIUM",
  2: "HIGH",
};

// ===== Thresholds and validity (fixed in the contract) =====

/** Minimum score for a standard cap. */
export const STANDARD_THRESHOLD = 70;
/** Minimum score for an elite cap. */
export const ELITE_THRESHOLD = 85;
/** Epochs a cap stays valid after mint. */
export const VALIDITY_EPOCHS = 30;
export const MAX_SCORE = 100;

// ===== Order sides (matches the contract) =====

export const SIDE = {
  BID: 0,
  ASK: 1,
} as const;

// ===== Helpers =====

/** What a given score qualifies for, independent of whether a cap exists yet. */
export function qualifiesFor(score: number): "ELITE" | "STANDARD" | "NONE" {
  if (score >= ELITE_THRESHOLD) return "ELITE";
  if (score >= STANDARD_THRESHOLD) return "STANDARD";
  return "NONE";
}

/** A cap object's shape once parsed from its Move fields. */
export interface TrustCap {
  objectId: string;
  tierKind: "STANDARD" | "ELITE";
  owner: string;
  scoreAtMint: number;
  issuedEpoch: number;
  expiryEpoch: number;
}

/** Valid while the current epoch has not passed the cap's expiry. */
export function isCapValid(cap: TrustCap, currentEpoch: number): boolean {
  return currentEpoch <= cap.expiryEpoch;
}
