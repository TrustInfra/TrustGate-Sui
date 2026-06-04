/**
 * Helpers for decoding Move return values from `devInspectTransactionBlock`.
 *
 * A devInspect result exposes, per command, a list of `returnValues`, each a
 * tuple of `[bytes, type]` where `bytes` is the BCS-encoded little-endian
 * value. These helpers decode the primitive shapes this app reads.
 */
import { bcs } from "@mysten/sui/bcs";

/** Normalized 32-byte zero address. A valid sender for reads that ignore it. */
export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

/** A single devInspect return value: `[bcsBytes, moveType]`. */
export type ReturnValue = [number[], string];

export function decodeU8(rv: ReturnValue | undefined): number {
  if (!rv) throw new Error("missing u8 return value");
  return bcs.u8().parse(Uint8Array.from(rv[0]));
}

export function decodeU64(rv: ReturnValue | undefined): bigint {
  if (!rv) throw new Error("missing u64 return value");
  // BCS decodes u64 to a decimal string; widen to bigint for the callers.
  return BigInt(bcs.u64().parse(Uint8Array.from(rv[0])));
}

export function decodeBool(rv: ReturnValue | undefined): boolean {
  if (!rv) throw new Error("missing bool return value");
  return bcs.bool().parse(Uint8Array.from(rv[0]));
}
