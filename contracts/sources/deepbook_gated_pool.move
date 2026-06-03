/// DeepBookGatedPool: a demonstration trading pool that gates order placement
/// on a valid `TrustedAgentCap` from TrustGate-Sui.
///
/// This is NOT a fork of DeepBook. It is a minimal, self-contained pool whose
/// only purpose is to demonstrate the integration pattern any real DeepBook
/// pool (or lending market, DAO, or agent framework) would adopt to require
/// behavioral trust before allowing a privileged action.
///
/// The integration surface is intentionally tiny. To trust-gate an action a
/// protocol adds one parameter (`&TrustedAgentCap`) and one guard
/// (`assert_standard_valid`). Because the cap is a non-transferable owned
/// object, a wallet that does not hold one cannot even construct the
/// transaction. The expiry guard rejects stale caps. Together these give an
/// on-chain, oracle-backed trust check with no runtime oracle call.
module trustgate::deepbook_gated_pool;

use trustgate::trusted_agent_cap::{
    Self,
    TrustedAgentCap,
    TrustedAgentCapElite,
};
use sui::event;
use sui::table::{Self, Table};

// ===== Errors =====

/// Order size must be greater than zero.
const EZeroSize: u64 = 1;
/// Order size exceeds the limit permitted for standard-tier callers.
const EExceedsStandardLimit: u64 = 2;

// ===== Tuning =====

/// Maximum order size a standard cap holder may place. Larger orders require
/// an elite cap. Demonstrates the two-tier gating model.
const STANDARD_SIZE_LIMIT: u64 = 1_000_000;

// ===== Side constants =====

const SIDE_BID: u8 = 0;
const SIDE_ASK: u8 = 1;

// ===== Objects =====

/// A single recorded order. Minimal by design.
public struct Order has store, copy, drop {
    trader: address,
    side: u8,
    price: u64,
    size: u64,
    placed_epoch: u64,
}

/// The shared trading pool. Holds recorded orders keyed by an incrementing id.
public struct GatedPool has key {
    id: UID,
    orders: Table<u64, Order>,
    next_order_id: u64,
    total_orders: u64,
}

// ===== Events =====

public struct OrderPlaced has copy, drop {
    order_id: u64,
    trader: address,
    side: u8,
    price: u64,
    size: u64,
    elite: bool,
    placed_epoch: u64,
}

// ===== Init =====

/// Create and share an empty pool at publish.
fun init(ctx: &mut TxContext) {
    let pool = GatedPool {
        id: object::new(ctx),
        orders: table::new<u64, Order>(ctx),
        next_order_id: 0,
        total_orders: 0,
    };
    transfer::share_object(pool);
}

// ===== Gated order placement =====

/// Place an order gated on a valid standard `TrustedAgentCap`.
///
/// The guard sequence is the whole point of this module:
///   1. The caller must own a `TrustedAgentCap`. The cap is non-transferable,
///      so possession cannot be faked or borrowed; the transaction cannot be
///      built without it.
///   2. `assert_standard_valid` rejects an expired cap.
///   3. Standard callers are limited to `STANDARD_SIZE_LIMIT`; larger orders
///      require an elite cap via `place_elite_order`.
public fun place_gated_order(
    cap: &TrustedAgentCap,
    pool: &mut GatedPool,
    side: u8,
    price: u64,
    size: u64,
    ctx: &mut TxContext,
) {
    trusted_agent_cap::assert_standard_valid(cap, ctx);

    assert!(size > 0, EZeroSize);
    assert!(size <= STANDARD_SIZE_LIMIT, EExceedsStandardLimit);
    assert!(side == SIDE_BID || side == SIDE_ASK, EZeroSize);

    record_order(pool, ctx.sender(), side, price, size, false, ctx);
}

/// Place an order gated on a valid elite `TrustedAgentCapElite`. No size limit:
/// elite trust unlocks high-stakes actions a standard cap cannot.
public fun place_elite_order(
    cap: &TrustedAgentCapElite,
    pool: &mut GatedPool,
    side: u8,
    price: u64,
    size: u64,
    ctx: &mut TxContext,
) {
    trusted_agent_cap::assert_elite_valid(cap, ctx);

    assert!(size > 0, EZeroSize);
    assert!(side == SIDE_BID || side == SIDE_ASK, EZeroSize);

    record_order(pool, ctx.sender(), side, price, size, true, ctx);
}

// ===== Internal =====

fun record_order(
    pool: &mut GatedPool,
    trader: address,
    side: u8,
    price: u64,
    size: u64,
    elite: bool,
    ctx: &TxContext,
) {
    let placed_epoch = ctx.epoch();
    let order_id = pool.next_order_id;

    let order = Order { trader, side, price, size, placed_epoch };
    pool.orders.add(order_id, order);
    pool.next_order_id = order_id + 1;
    pool.total_orders = pool.total_orders + 1;

    event::emit(OrderPlaced {
        order_id,
        trader,
        side,
        price,
        size,
        elite,
        placed_epoch,
    });
}

// ===== Views =====

/// True if `cap` would currently pass the standard gate. Lets a front-end show
/// eligibility before the user signs a transaction. Does not place an order.
public fun can_place_standard(cap: &TrustedAgentCap, ctx: &TxContext): bool {
    trusted_agent_cap::is_standard_valid(cap, ctx)
}

/// True if `cap` would currently pass the elite gate.
public fun can_place_elite(cap: &TrustedAgentCapElite, ctx: &TxContext): bool {
    trusted_agent_cap::is_elite_valid(cap, ctx)
}

/// Total number of orders ever placed in this pool.
public fun total_orders(pool: &GatedPool): u64 {
    pool.total_orders
}

/// True if an order with `order_id` exists.
public fun has_order(pool: &GatedPool, order_id: u64): bool {
    pool.orders.contains(order_id)
}

/// Read the trader of a recorded order. Aborts if the order does not exist.
public fun order_trader(pool: &GatedPool, order_id: u64): address {
    pool.orders[order_id].trader
}

/// Read the size of a recorded order. Aborts if the order does not exist.
public fun order_size(pool: &GatedPool, order_id: u64): u64 {
    pool.orders[order_id].size
}

// ===== Constant accessors =====

public fun standard_size_limit(): u64 { STANDARD_SIZE_LIMIT }
public fun side_bid(): u8 { SIDE_BID }
public fun side_ask(): u8 { SIDE_ASK }

// ===== Test-only =====

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
