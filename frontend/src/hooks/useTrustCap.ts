"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  STANDARD_CAP_TYPE,
  ELITE_CAP_TYPE,
  isCapValid,
  type TrustCap,
} from "@/lib/trustgate-sui";

export interface TrustCapResult {
  /** The wallet's effective cap (elite preferred), or null if it holds none. */
  cap: TrustCap | null;
  /** Current epoch from the Sui system state, used to evaluate validity. */
  currentEpoch: number;
  /** Whether `cap` exists and has not expired at `currentEpoch`. */
  isValid: boolean;
  /** Epochs left before expiry (may be <= 0 if expired); null when no cap. */
  epochsRemaining: number | null;
}

interface CapFields {
  owner: string;
  score_at_mint: string | number;
  issued_epoch: string | number;
  expiry_epoch: string | number;
}

/**
 * Finds the connected wallet's TrustedAgentCap. Queries owned objects filtered
 * to the standard and elite cap types, parses each cap's fields, and resolves a
 * single effective cap — elite takes precedence, then the furthest expiry. Also
 * fetches the current epoch so `isCapValid` can be evaluated client-side.
 */
export function useTrustCap(
  address?: string,
): UseQueryResult<TrustCapResult> {
  const client = useSuiClient();

  return useQuery<TrustCapResult>({
    queryKey: ["trust-cap", address],
    enabled: !!address,
    queryFn: async () => {
      const owner = address!;

      const [owned, system] = await Promise.all([
        client.getOwnedObjects({
          owner,
          filter: {
            MatchAny: [
              { StructType: STANDARD_CAP_TYPE },
              { StructType: ELITE_CAP_TYPE },
            ],
          },
          options: { showContent: true, showType: true },
        }),
        client.getLatestSuiSystemState(),
      ]);

      const currentEpoch = Number(system.epoch);

      const caps: TrustCap[] = [];
      for (const obj of owned.data) {
        const content = obj.data?.content;
        if (!content || content.dataType !== "moveObject") continue;

        const fields = content.fields as unknown as CapFields;
        const tierKind = content.type === ELITE_CAP_TYPE ? "ELITE" : "STANDARD";

        caps.push({
          objectId: obj.data!.objectId,
          tierKind,
          owner: fields.owner,
          scoreAtMint: Number(fields.score_at_mint),
          issuedEpoch: Number(fields.issued_epoch),
          expiryEpoch: Number(fields.expiry_epoch),
        });
      }

      // Elite first, then the cap with the most runway.
      caps.sort((a, b) => {
        if (a.tierKind !== b.tierKind) return a.tierKind === "ELITE" ? -1 : 1;
        return b.expiryEpoch - a.expiryEpoch;
      });

      const cap = caps[0] ?? null;
      const isValid = cap ? isCapValid(cap, currentEpoch) : false;
      const epochsRemaining = cap ? cap.expiryEpoch - currentEpoch : null;

      return { cap, currentEpoch, isValid, epochsRemaining };
    },
  });
}
