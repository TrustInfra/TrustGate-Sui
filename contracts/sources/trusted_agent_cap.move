/// TrustedAgentCap: non-transferable trust capability objects for TrustGate-Sui.
///
/// When a wallet's trust score clears a threshold, the oracle mints a
/// capability object directly into that wallet. Consumer protocols (DeepBook
/// pools, lending markets, DAOs, agent frameworks) require a reference to a
/// valid, unexpired cap to authorize high-stakes actions.
///
/// Two tiers exist:
///   - `TrustedAgentCap`      minted at score >= STANDARD_THRESHOLD (70)
///   - `TrustedAgentCapElite` minted at score >= ELITE_THRESHOLD    (85)
///
/// Caps have `key` but NOT `store`: they are non-transferable. Trust cannot be
/// sold, lent, or moved between wallets. Each cap carries an expiry epoch
/// (issue epoch + VALIDITY_EPOCHS). An expired cap must be treated as invalid
/// by every consumer even while it still exists in the holder's wallet.
///
/// Minting and revocation are gated by the `MintAuthority` capability, held by
/// the oracle signer.
module trustgate::trusted_agent_cap;

use sui::event;

// ===== Errors =====

/// Score supplied did not meet the standard threshold.
const EBelowStandardThreshold: u64 = 1;
/// Score supplied did not meet the elite threshold.
const EBelowEliteThreshold: u64 = 2;
/// Score supplied was outside the valid 0..=100 range.
const EInvalidScore: u64 = 3;

// ===== Thresholds and validity =====

/// Minimum score to receive a standard TrustedAgentCap.
const STANDARD_THRESHOLD: u8 = 70;
/// Minimum score to receive an elite TrustedAgentCap.
const ELITE_THRESHOLD: u8 = 85;
/// Maximum valid score.
const MAX_SCORE: u8 = 100;
/// Number of epochs a cap remains valid after issuance.
const VALIDITY_EPOCHS: u64 = 30;

// ===== Mint authority =====

/// Authorizes minting and revoking caps. Minted once at publish and
/// transferred to the oracle signer. Transferable so the oracle key can be
/// rotated.
public struct MintAuthority has key, store {
    id: UID,
}

// ===== Capability objects =====

/// Standard trust capability. Non-transferable (`key` only, no `store`).
public struct TrustedAgentCap has key {
    id: UID,
    /// Wallet this cap was issued to.
    owner: address,
    /// Score at the moment of minting.
    score_at_mint: u8,
    /// Epoch the cap was issued.
    issued_epoch: u64,
    /// Epoch after which the cap is invalid.
    expiry_epoch: u64,
}

/// Elite trust capability. Non-transferable (`key` only, no `store`).
public struct TrustedAgentCapElite has key {
    id: UID,
    owner: address,
    score_at_mint: u8,
    issued_epoch: u64,
    expiry_epoch: u64,
}

// ===== Events =====

public struct StandardCapMinted has copy, drop {
    owner: address,
    score_at_mint: u8,
    issued_epoch: u64,
    expiry_epoch: u64,
}

public struct EliteCapMinted has copy, drop {
    owner: address,
    score_at_mint: u8,
    issued_epoch: u64,
    expiry_epoch: u64,
}

public struct StandardCapRevoked has copy, drop {
    owner: address,
    revoked_epoch: u64,
}

public struct EliteCapRevoked has copy, drop {
    owner: address,
    revoked_epoch: u64,
}

// ===== Init =====

/// Runs once at publish. Mints the `MintAuthority` and sends it to the
/// publisher, who then transfers it to the oracle signer.
fun init(ctx: &mut TxContext) {
    let authority = MintAuthority { id: object::new(ctx) };
    transfer::public_transfer(authority, ctx.sender());
}

// ===== Minting =====

/// Mint a standard cap to `recipient`. Requires the mint authority and a score
/// at or above the standard threshold. The cap is transferred directly to the
/// recipient and cannot be moved afterward.
public fun mint_standard(
    _authority: &MintAuthority,
    recipient: address,
    score: u8,
    ctx: &mut TxContext,
) {
    assert!(score <= MAX_SCORE, EInvalidScore);
    assert!(score >= STANDARD_THRESHOLD, EBelowStandardThreshold);

    let issued_epoch = ctx.epoch();
    let expiry_epoch = issued_epoch + VALIDITY_EPOCHS;

    let cap = TrustedAgentCap {
        id: object::new(ctx),
        owner: recipient,
        score_at_mint: score,
        issued_epoch,
        expiry_epoch,
    };

    event::emit(StandardCapMinted {
        owner: recipient,
        score_at_mint: score,
        issued_epoch,
        expiry_epoch,
    });

    transfer::transfer(cap, recipient);
}

/// Mint an elite cap to `recipient`. Requires the mint authority and a score
/// at or above the elite threshold.
public fun mint_elite(
    _authority: &MintAuthority,
    recipient: address,
    score: u8,
    ctx: &mut TxContext,
) {
    assert!(score <= MAX_SCORE, EInvalidScore);
    assert!(score >= ELITE_THRESHOLD, EBelowEliteThreshold);

    let issued_epoch = ctx.epoch();
    let expiry_epoch = issued_epoch + VALIDITY_EPOCHS;

    let cap = TrustedAgentCapElite {
        id: object::new(ctx),
        owner: recipient,
        score_at_mint: score,
        issued_epoch,
        expiry_epoch,
    };

    event::emit(EliteCapMinted {
        owner: recipient,
        score_at_mint: score,
        issued_epoch,
        expiry_epoch,
    });

    transfer::transfer(cap, recipient);
}

// ===== Revocation =====

/// Revoke (destroy) a standard cap. Requires the mint authority. Used when a
/// re-score drops a wallet below the threshold before natural expiry. The cap
/// must be supplied by the caller; the oracle coordinates this off-chain by
/// targeting the specific cap object id.
public fun revoke_standard(
    _authority: &MintAuthority,
    cap: TrustedAgentCap,
    ctx: &TxContext,
) {
    let TrustedAgentCap { id, owner, score_at_mint: _, issued_epoch: _, expiry_epoch: _ } = cap;
    event::emit(StandardCapRevoked { owner, revoked_epoch: ctx.epoch() });
    id.delete();
}

/// Revoke (destroy) an elite cap. Requires the mint authority.
public fun revoke_elite(
    _authority: &MintAuthority,
    cap: TrustedAgentCapElite,
    ctx: &TxContext,
) {
    let TrustedAgentCapElite { id, owner, score_at_mint: _, issued_epoch: _, expiry_epoch: _ } = cap;
    event::emit(EliteCapRevoked { owner, revoked_epoch: ctx.epoch() });
    id.delete();
}

/// Voluntarily destroy your own standard cap. No authority required: a holder
/// may always relinquish their own capability.
public fun burn_standard(cap: TrustedAgentCap) {
    let TrustedAgentCap { id, owner: _, score_at_mint: _, issued_epoch: _, expiry_epoch: _ } = cap;
    id.delete();
}

/// Voluntarily destroy your own elite cap.
public fun burn_elite(cap: TrustedAgentCapElite) {
    let TrustedAgentCapElite { id, owner: _, score_at_mint: _, issued_epoch: _, expiry_epoch: _ } = cap;
    id.delete();
}

// ===== Validity checks (the canonical consumer API) =====

/// True if the standard cap has not yet expired at the current epoch.
/// Consumers MUST call this rather than assuming a held cap is valid.
public fun is_standard_valid(cap: &TrustedAgentCap, ctx: &TxContext): bool {
    ctx.epoch() <= cap.expiry_epoch
}

/// True if the elite cap has not yet expired at the current epoch.
public fun is_elite_valid(cap: &TrustedAgentCapElite, ctx: &TxContext): bool {
    ctx.epoch() <= cap.expiry_epoch
}

/// Abort unless the standard cap is valid. Convenience guard for consumers that
/// want a hard stop rather than a boolean.
public fun assert_standard_valid(cap: &TrustedAgentCap, ctx: &TxContext) {
    assert!(ctx.epoch() <= cap.expiry_epoch, ECapExpired);
}

/// Abort unless the elite cap is valid.
public fun assert_elite_valid(cap: &TrustedAgentCapElite, ctx: &TxContext) {
    assert!(ctx.epoch() <= cap.expiry_epoch, ECapExpired);
}

/// Cap has expired.
const ECapExpired: u64 = 4;

// ===== Read accessors =====

public fun standard_owner(cap: &TrustedAgentCap): address { cap.owner }
public fun standard_score_at_mint(cap: &TrustedAgentCap): u8 { cap.score_at_mint }
public fun standard_issued_epoch(cap: &TrustedAgentCap): u64 { cap.issued_epoch }
public fun standard_expiry_epoch(cap: &TrustedAgentCap): u64 { cap.expiry_epoch }

public fun elite_owner(cap: &TrustedAgentCapElite): address { cap.owner }
public fun elite_score_at_mint(cap: &TrustedAgentCapElite): u8 { cap.score_at_mint }
public fun elite_issued_epoch(cap: &TrustedAgentCapElite): u64 { cap.issued_epoch }
public fun elite_expiry_epoch(cap: &TrustedAgentCapElite): u64 { cap.expiry_epoch }

// ===== Constant accessors =====

public fun standard_threshold(): u8 { STANDARD_THRESHOLD }
public fun elite_threshold(): u8 { ELITE_THRESHOLD }
public fun validity_epochs(): u64 { VALIDITY_EPOCHS }

// ===== Test-only =====

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
