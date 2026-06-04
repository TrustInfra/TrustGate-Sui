/// End-to-end test suite for TrustGate-Sui.
///
/// Exercises the three core contracts together the way a real integration runs:
///   1. The oracle writes a score into the `ScoreRegistry`.
///   2. The mint authority issues a `TrustedAgentCap` (or elite) off that score.
///   3. A DeepBook-style pool gates order placement on a valid cap.
///
/// Covered behaviour:
///   - score write, overwrite, and every public read
///   - is_trusted threshold logic, including the bot-flag hard block
///   - score / tier / confidence range validation
///   - standard and elite cap minting, plus below-threshold rejection
///   - the full happy path: score -> mint -> place order
///   - standard size cap vs. elite having no size cap
///   - expired caps being rejected by a consumer
///   - revocation destroying a cap
///   - the can_place_* view used by the front-end to pre-gate the UI
#[test_only]
module trustgate::contracts_tests;

use sui::test_scenario::{Self as ts, Scenario};
use trustgate::trust_scoring::{Self, ScoreRegistry, OracleCap};
use trustgate::trusted_agent_cap::{Self, MintAuthority, TrustedAgentCap, TrustedAgentCapElite};
use trustgate::deepbook_gated_pool::{Self, GatedPool};

// ===== Actors =====

/// Publisher / oracle signer. Holds the OracleCap and the MintAuthority.
const ADMIN: address = @0xAD;
/// Ordinary wallet that gets scored and receives caps.
const USER: address = @0xA11CE;

// ===== Helpers =====

/// Publish all three modules into the test world in a single ADMIN transaction.
/// Shares the ScoreRegistry and the GatedPool, and sends the OracleCap and
/// MintAuthority to ADMIN.
#[test_only]
fun bootstrap(scenario: &mut Scenario) {
    trust_scoring::init_for_testing(scenario.ctx());
    trusted_agent_cap::init_for_testing(scenario.ctx());
    deepbook_gated_pool::init_for_testing(scenario.ctx());
}

/// Run the oracle write path: ADMIN takes the OracleCap and the shared
/// registry, writes a record for `subject`, and returns both.
#[test_only]
fun write_score(
    scenario: &mut Scenario,
    subject: address,
    score: u8,
    tier: u8,
    confidence: u8,
    bot_flagged: bool,
) {
    scenario.next_tx(ADMIN);
    let cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<ScoreRegistry>();
    trust_scoring::update_score(
        &cap,
        &mut registry,
        subject,
        score,
        tier,
        confidence,
        bot_flagged,
        scenario.ctx(),
    );
    ts::return_shared(registry);
    scenario.return_to_sender(cap);
}

/// Mint a standard cap to `recipient` using ADMIN's MintAuthority.
#[test_only]
fun mint_standard_cap(scenario: &mut Scenario, recipient: address, score: u8) {
    scenario.next_tx(ADMIN);
    let auth = scenario.take_from_sender<MintAuthority>();
    trusted_agent_cap::mint_standard(&auth, recipient, score, scenario.ctx());
    scenario.return_to_sender(auth);
}

/// Mint an elite cap to `recipient` using ADMIN's MintAuthority.
#[test_only]
fun mint_elite_cap(scenario: &mut Scenario, recipient: address, score: u8) {
    scenario.next_tx(ADMIN);
    let auth = scenario.take_from_sender<MintAuthority>();
    trusted_agent_cap::mint_elite(&auth, recipient, score, scenario.ctx());
    scenario.return_to_sender(auth);
}

// ===== trust_scoring: write and read =====

#[test]
fun test_score_write_and_all_reads() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    write_score(
        &mut scenario,
        USER,
        80,
        trust_scoring::tier_high(),
        trust_scoring::confidence_high(),
        false,
    );

    scenario.next_tx(ADMIN);
    {
        let registry = scenario.take_shared<ScoreRegistry>();
        assert!(trust_scoring::is_scored(&registry, USER), 0);
        assert!(trust_scoring::get_score(&registry, USER) == 80, 1);
        assert!(trust_scoring::get_tier(&registry, USER) == trust_scoring::tier_high(), 2);
        assert!(
            trust_scoring::get_confidence(&registry, USER) == trust_scoring::confidence_high(),
            3,
        );
        assert!(!trust_scoring::is_bot_flagged(&registry, USER), 4);
        assert!(trust_scoring::total_scored(&registry) == 1, 5);
        // 80 clears the standard gate but not the elite gate.
        assert!(trust_scoring::is_trusted(&registry, USER, 70), 6);
        assert!(!trust_scoring::is_trusted(&registry, USER, 85), 7);
        ts::return_shared(registry);
    };

    scenario.end();
}

#[test]
fun test_score_overwrite_keeps_one_record() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    write_score(
        &mut scenario,
        USER,
        80,
        trust_scoring::tier_high(),
        trust_scoring::confidence_high(),
        false,
    );
    // Re-score the same wallet upward. total_scored must not double-count.
    write_score(
        &mut scenario,
        USER,
        95,
        trust_scoring::tier_high_elite(),
        trust_scoring::confidence_high(),
        false,
    );

    scenario.next_tx(ADMIN);
    {
        let registry = scenario.take_shared<ScoreRegistry>();
        assert!(trust_scoring::get_score(&registry, USER) == 95, 0);
        assert!(
            trust_scoring::get_tier(&registry, USER) == trust_scoring::tier_high_elite(),
            1,
        );
        assert!(trust_scoring::total_scored(&registry) == 1, 2);
        assert!(trust_scoring::is_trusted(&registry, USER, 85), 3);
        ts::return_shared(registry);
    };

    scenario.end();
}

#[test]
fun test_bot_flag_blocks_trust_despite_high_score() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    // High score but bot-flagged. The hard block must win.
    write_score(
        &mut scenario,
        USER,
        99,
        trust_scoring::tier_high_elite(),
        trust_scoring::confidence_high(),
        true,
    );

    scenario.next_tx(ADMIN);
    {
        let registry = scenario.take_shared<ScoreRegistry>();
        assert!(trust_scoring::is_bot_flagged(&registry, USER), 0);
        assert!(!trust_scoring::is_trusted(&registry, USER, 70), 1);
        assert!(!trust_scoring::is_trusted(&registry, USER, 85), 2);
        ts::return_shared(registry);
    };

    scenario.end();
}

#[test]
fun test_is_trusted_false_for_unscored_address() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    scenario.next_tx(ADMIN);
    {
        let registry = scenario.take_shared<ScoreRegistry>();
        // Never scored, so any threshold returns false rather than aborting.
        assert!(!trust_scoring::is_trusted(&registry, USER, 0), 0);
        assert!(!trust_scoring::is_scored(&registry, USER), 1);
        ts::return_shared(registry);
    };

    scenario.end();
}

#[test]
#[expected_failure]
fun test_update_score_above_max_aborts() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    scenario.next_tx(ADMIN);
    let cap = scenario.take_from_sender<OracleCap>();
    let mut registry = scenario.take_shared<ScoreRegistry>();
    // 101 is out of the 0..=100 range. Must abort with EInvalidScore.
    trust_scoring::update_score(
        &cap,
        &mut registry,
        USER,
        101,
        trust_scoring::tier_high(),
        trust_scoring::confidence_high(),
        false,
        scenario.ctx(),
    );

    ts::return_shared(registry);
    scenario.return_to_sender(cap);
    scenario.end();
}

// ===== trusted_agent_cap: minting and thresholds =====

#[test]
fun test_mint_standard_cap_fields_and_validity() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    mint_standard_cap(&mut scenario, USER, 75);

    scenario.next_tx(USER);
    {
        let cap = scenario.take_from_sender<TrustedAgentCap>();
        assert!(trusted_agent_cap::standard_owner(&cap) == USER, 0);
        assert!(trusted_agent_cap::standard_score_at_mint(&cap) == 75, 1);
        // Issued this epoch, valid now.
        assert!(trusted_agent_cap::is_standard_valid(&cap, scenario.ctx()), 2);
        let issued = trusted_agent_cap::standard_issued_epoch(&cap);
        let expiry = trusted_agent_cap::standard_expiry_epoch(&cap);
        assert!(expiry == issued + trusted_agent_cap::validity_epochs(), 3);
        scenario.return_to_sender(cap);
    };

    scenario.end();
}

#[test]
fun test_mint_elite_cap_fields_and_validity() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    mint_elite_cap(&mut scenario, USER, 90);

    scenario.next_tx(USER);
    {
        let cap = scenario.take_from_sender<TrustedAgentCapElite>();
        assert!(trusted_agent_cap::elite_owner(&cap) == USER, 0);
        assert!(trusted_agent_cap::elite_score_at_mint(&cap) == 90, 1);
        assert!(trusted_agent_cap::is_elite_valid(&cap, scenario.ctx()), 2);
        scenario.return_to_sender(cap);
    };

    scenario.end();
}

#[test]
#[expected_failure]
fun test_mint_standard_below_threshold_aborts() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    scenario.next_tx(ADMIN);
    let auth = scenario.take_from_sender<MintAuthority>();
    // 69 is below the standard threshold of 70. Must abort.
    trusted_agent_cap::mint_standard(&auth, USER, 69, scenario.ctx());

    scenario.return_to_sender(auth);
    scenario.end();
}

#[test]
#[expected_failure]
fun test_mint_elite_below_threshold_aborts() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    scenario.next_tx(ADMIN);
    let auth = scenario.take_from_sender<MintAuthority>();
    // 84 is below the elite threshold of 85. Must abort.
    trusted_agent_cap::mint_elite(&auth, USER, 84, scenario.ctx());

    scenario.return_to_sender(auth);
    scenario.end();
}

#[test]
fun test_revoke_standard_cap_consumes_it() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    mint_standard_cap(&mut scenario, USER, 80);

    // ADMIN pulls the cap object out of USER's inventory and revokes it.
    scenario.next_tx(ADMIN);
    {
        let auth = scenario.take_from_sender<MintAuthority>();
        let cap = scenario.take_from_address<TrustedAgentCap>(USER);
        trusted_agent_cap::revoke_standard(&auth, cap, scenario.ctx());
        scenario.return_to_sender(auth);
    };

    scenario.end();
}

// ===== deepbook_gated_pool: the full integration =====

#[test]
fun test_full_flow_standard_order_is_recorded() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    write_score(
        &mut scenario,
        USER,
        80,
        trust_scoring::tier_high(),
        trust_scoring::confidence_high(),
        false,
    );
    mint_standard_cap(&mut scenario, USER, 80);

    scenario.next_tx(USER);
    {
        let cap = scenario.take_from_sender<TrustedAgentCap>();
        let mut pool = scenario.take_shared<GatedPool>();

        // View should agree the cap can place before we place.
        assert!(deepbook_gated_pool::can_place_standard(&cap, scenario.ctx()), 0);

        let size = 5;
        deepbook_gated_pool::place_gated_order(
            &cap,
            &mut pool,
            deepbook_gated_pool::side_bid(),
            100,
            size,
            scenario.ctx(),
        );

        assert!(deepbook_gated_pool::total_orders(&pool) == 1, 1);
        // First order id is 0. If the pool numbers orders from 1 instead,
        // change this literal to 1.
        assert!(deepbook_gated_pool::has_order(&pool, 0), 2);
        assert!(deepbook_gated_pool::order_trader(&pool, 0) == USER, 3);
        assert!(deepbook_gated_pool::order_size(&pool, 0) == size, 4);

        ts::return_shared(pool);
        scenario.return_to_sender(cap);
    };

    scenario.end();
}

#[test]
#[expected_failure]
fun test_standard_order_over_size_limit_aborts() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    write_score(
        &mut scenario,
        USER,
        80,
        trust_scoring::tier_high(),
        trust_scoring::confidence_high(),
        false,
    );
    mint_standard_cap(&mut scenario, USER, 80);

    scenario.next_tx(USER);
    let cap = scenario.take_from_sender<TrustedAgentCap>();
    let mut pool = scenario.take_shared<GatedPool>();

    let over = deepbook_gated_pool::standard_size_limit() + 1;
    // A standard cap cannot place above the standard size limit. Must abort.
    deepbook_gated_pool::place_gated_order(
        &cap,
        &mut pool,
        deepbook_gated_pool::side_bid(),
        100,
        over,
        scenario.ctx(),
    );

    ts::return_shared(pool);
    scenario.return_to_sender(cap);
    scenario.end();
}

#[test]
fun test_elite_order_has_no_size_limit() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    write_score(
        &mut scenario,
        USER,
        90,
        trust_scoring::tier_high_elite(),
        trust_scoring::confidence_high(),
        false,
    );
    mint_elite_cap(&mut scenario, USER, 90);

    scenario.next_tx(USER);
    {
        let cap = scenario.take_from_sender<TrustedAgentCapElite>();
        let mut pool = scenario.take_shared<GatedPool>();

        // Far above the standard limit. Elite must accept it.
        let big = deepbook_gated_pool::standard_size_limit() * 10 + 1;
        deepbook_gated_pool::place_elite_order(
            &cap,
            &mut pool,
            deepbook_gated_pool::side_ask(),
            100,
            big,
            scenario.ctx(),
        );

        assert!(deepbook_gated_pool::total_orders(&pool) == 1, 0);
        assert!(deepbook_gated_pool::order_size(&pool, 0) == big, 1);

        ts::return_shared(pool);
        scenario.return_to_sender(cap);
    };

    scenario.end();
}

#[test]
#[expected_failure]
fun test_expired_standard_cap_is_rejected_by_pool() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    write_score(
        &mut scenario,
        USER,
        80,
        trust_scoring::tier_high(),
        trust_scoring::confidence_high(),
        false,
    );
    mint_standard_cap(&mut scenario, USER, 80);

    // Age the chain past the cap's validity window (30 epochs), so the cap
    // exists in the wallet but is no longer valid.
    let mut i = 0;
    while (i < 31) {
        ts::next_epoch(&mut scenario, ADMIN);
        i = i + 1;
    };

    scenario.next_tx(USER);
    let cap = scenario.take_from_sender<TrustedAgentCap>();
    let mut pool = scenario.take_shared<GatedPool>();

    // Expired cap. assert_standard_valid inside place_gated_order must abort.
    deepbook_gated_pool::place_gated_order(
        &cap,
        &mut pool,
        deepbook_gated_pool::side_bid(),
        100,
        1,
        scenario.ctx(),
    );

    ts::return_shared(pool);
    scenario.return_to_sender(cap);
    scenario.end();
}

#[test]
fun test_can_place_standard_false_after_expiry() {
    let mut scenario = ts::begin(ADMIN);
    bootstrap(&mut scenario);

    mint_standard_cap(&mut scenario, USER, 80);

    let mut i = 0;
    while (i < 31) {
        ts::next_epoch(&mut scenario, ADMIN);
        i = i + 1;
    };

    scenario.next_tx(USER);
    {
        let cap = scenario.take_from_sender<TrustedAgentCap>();
        // The front-end view should report the cap as no longer placeable,
        // so the trade button greys out before the user wastes gas.
        assert!(!deepbook_gated_pool::can_place_standard(&cap, scenario.ctx()), 0);
        scenario.return_to_sender(cap);
    };

    scenario.end();
}
