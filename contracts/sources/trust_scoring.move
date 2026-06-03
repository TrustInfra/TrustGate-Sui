/// TrustScoring: on-chain trust score registry for TrustGate-Sui.
///
/// A single shared `ScoreRegistry` object holds a score record for every
/// address that has been scored by the off-chain oracle. Only the holder of
/// the `OracleCap` capability can write scores. All reads are public so that
/// other packages (lending protocols, DAOs, DeepBook pools) and front-ends
/// can consume trust data permissionlessly.
module trustgate::trust_scoring;

use std::string::{Self, String};
use sui::event;
use sui::table::{Self, Table};

// ===== Errors =====

/// Score supplied was outside the valid 0..=100 range.
const EInvalidScore: u64 = 1;
/// Tier supplied did not match a known tier constant.
const EInvalidTier: u64 = 2;
/// Confidence supplied did not match a known confidence constant.
const EInvalidConfidence: u64 = 3;
/// Requested address has no score record in the registry.
const EAddressNotScored: u64 = 4;

// ===== Tier constants =====

const TIER_LOW: u8 = 0;
const TIER_MEDIUM: u8 = 1;
const TIER_HIGH: u8 = 2;
const TIER_HIGH_ELITE: u8 = 3;

// ===== Confidence constants =====

const CONFIDENCE_LOW: u8 = 0;
const CONFIDENCE_MEDIUM: u8 = 1;
const CONFIDENCE_HIGH: u8 = 2;

// ===== Score bounds =====

const MAX_SCORE: u8 = 100;

// ===== Capability =====

/// Authorizes its holder to write score records. Minted once at publish and
/// transferred to the oracle signer. Transferable so the oracle key can be
/// rotated by moving the cap to a new address.
public struct OracleCap has key, store {
    id: UID,
}

// ===== Core objects =====

/// A single address's trust data.
public struct ScoreRecord has store, copy, drop {
    /// Trust score, 0..=100.
    score: u8,
    /// Tier band: one of the TIER_* constants.
    tier: u8,
    /// Confidence in the score: one of the CONFIDENCE_* constants.
    confidence: u8,
    /// Whether a bot hard-cap was applied to this address.
    bot_flagged: bool,
    /// Epoch at which this record was last written.
    updated_epoch: u64,
}

/// Shared registry holding every scored address.
public struct ScoreRegistry has key {
    id: UID,
    /// address -> latest score record.
    scores: Table<address, ScoreRecord>,
    /// Total number of distinct addresses ever scored.
    total_scored: u64,
}

// ===== Events =====

/// Emitted on every successful score write.
public struct TrustScoreUpdated has copy, drop {
    subject: address,
    score: u8,
    tier: u8,
    confidence: u8,
    bot_flagged: bool,
    updated_epoch: u64,
}

// ===== Init =====

/// Runs once at publish. Creates and shares the registry, mints the oracle
/// capability, and sends it to the publisher. The publisher then transfers it
/// to the oracle signer in a follow-up transaction.
fun init(ctx: &mut TxContext) {
    let registry = ScoreRegistry {
        id: object::new(ctx),
        scores: table::new<address, ScoreRecord>(ctx),
        total_scored: 0,
    };
    transfer::share_object(registry);

    let cap = OracleCap { id: object::new(ctx) };
    transfer::public_transfer(cap, ctx.sender());
}

// ===== Oracle write path =====

/// Write or overwrite the score record for `subject`. Requires the oracle
/// capability. Validates score, tier, and confidence ranges, updates the
/// registry, and emits a `TrustScoreUpdated` event.
public fun update_score(
    _cap: &OracleCap,
    registry: &mut ScoreRegistry,
    subject: address,
    score: u8,
    tier: u8,
    confidence: u8,
    bot_flagged: bool,
    ctx: &TxContext,
) {
    assert!(score <= MAX_SCORE, EInvalidScore);
    assert!(tier <= TIER_HIGH_ELITE, EInvalidTier);
    assert!(confidence <= CONFIDENCE_HIGH, EInvalidConfidence);

    let current_epoch = ctx.epoch();
    let record = ScoreRecord {
        score,
        tier,
        confidence,
        bot_flagged,
        updated_epoch: current_epoch,
    };

    if (registry.scores.contains(subject)) {
        let existing = &mut registry.scores[subject];
        *existing = record;
    } else {
        registry.scores.add(subject, record);
        registry.total_scored = registry.total_scored + 1;
    };

    event::emit(TrustScoreUpdated {
        subject,
        score,
        tier,
        confidence,
        bot_flagged,
        updated_epoch: current_epoch,
    });
}

// ===== Public reads =====

/// True if `subject` has a score record.
public fun is_scored(registry: &ScoreRegistry, subject: address): bool {
    registry.scores.contains(subject)
}

/// Returns the score for `subject`. Aborts if not scored.
public fun get_score(registry: &ScoreRegistry, subject: address): u8 {
    assert!(registry.scores.contains(subject), EAddressNotScored);
    registry.scores[subject].score
}

/// Returns the tier for `subject`. Aborts if not scored.
public fun get_tier(registry: &ScoreRegistry, subject: address): u8 {
    assert!(registry.scores.contains(subject), EAddressNotScored);
    registry.scores[subject].tier
}

/// Returns the confidence for `subject`. Aborts if not scored.
public fun get_confidence(registry: &ScoreRegistry, subject: address): u8 {
    assert!(registry.scores.contains(subject), EAddressNotScored);
    registry.scores[subject].confidence
}

/// Returns whether `subject` is bot-flagged. Aborts if not scored.
public fun is_bot_flagged(registry: &ScoreRegistry, subject: address): bool {
    assert!(registry.scores.contains(subject), EAddressNotScored);
    registry.scores[subject].bot_flagged
}

/// Returns the epoch at which `subject` was last scored. Aborts if not scored.
public fun get_updated_epoch(registry: &ScoreRegistry, subject: address): u64 {
    assert!(registry.scores.contains(subject), EAddressNotScored);
    registry.scores[subject].updated_epoch
}

/// True if `subject` is scored at or above `threshold` and not bot-flagged.
/// The canonical check other packages should use for gating.
public fun is_trusted(
    registry: &ScoreRegistry,
    subject: address,
    threshold: u8,
): bool {
    if (!registry.scores.contains(subject)) {
        return false
    };
    let record = &registry.scores[subject];
    !record.bot_flagged && record.score >= threshold
}

/// Total number of distinct addresses ever scored.
public fun total_scored(registry: &ScoreRegistry): u64 {
    registry.total_scored
}

// ===== Tier helpers =====

/// Human-readable tier label for a tier constant.
public fun tier_label(tier: u8): String {
    if (tier == TIER_LOW) {
        string::utf8(b"LOW")
    } else if (tier == TIER_MEDIUM) {
        string::utf8(b"MEDIUM")
    } else if (tier == TIER_HIGH) {
        string::utf8(b"HIGH")
    } else if (tier == TIER_HIGH_ELITE) {
        string::utf8(b"HIGH_ELITE")
    } else {
        abort EInvalidTier
    }
}

public fun tier_low(): u8 { TIER_LOW }
public fun tier_medium(): u8 { TIER_MEDIUM }
public fun tier_high(): u8 { TIER_HIGH }
public fun tier_high_elite(): u8 { TIER_HIGH_ELITE }

public fun confidence_low(): u8 { CONFIDENCE_LOW }
public fun confidence_medium(): u8 { CONFIDENCE_MEDIUM }
public fun confidence_high(): u8 { CONFIDENCE_HIGH }

// ===== Test-only =====

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
