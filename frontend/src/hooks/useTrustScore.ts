"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import {
  SCORE_REGISTRY_ID,
  TARGET,
  TIER_LABEL,
  CONFIDENCE_LABEL,
  qualifiesFor,
} from "@/lib/trustgate-sui";
import { decodeBool, decodeU8 } from "@/lib/onchain-read";

export interface TrustScore {
  score: number;
  tier: number;
  tierLabel: string;
  confidence: number;
  confidenceLabel: string;
  /**
   * True when a bot hard-cap was applied. A bot-flagged wallet is untrusted
   * regardless of score: `is_trusted` returns false on-chain, so no cap can be
   * minted and every consumer gate rejects it.
   */
  botFlagged: boolean;
  /** Always true here — `null` from the hook means unscored. */
  scored: boolean;
  /** What this score qualifies for, independent of whether a cap was minted. */
  qualifies: "ELITE" | "STANDARD" | "NONE";
}

/**
 * Reads a wallet's trust record from the shared `ScoreRegistry` via devInspect
 * (no gas, no signing). Returns `null` when the oracle has not scored the
 * address — the getters abort on an unscored address, so `is_scored` is checked
 * first and the getters are only run when a record exists.
 */
export function useTrustScore(
  address?: string,
): UseQueryResult<TrustScore | null> {
  const client = useSuiClient();

  return useQuery<TrustScore | null>({
    queryKey: ["trust-score", address],
    enabled: !!address,
    queryFn: async () => {
      const sender = address!;

      // 1) is_scored — cheap guard so the aborting getters never run unscored.
      const scoredTx = new Transaction();
      scoredTx.moveCall({
        target: TARGET.isScored,
        arguments: [
          scoredTx.object(SCORE_REGISTRY_ID),
          scoredTx.pure.address(sender),
        ],
      });
      const scoredRes = await client.devInspectTransactionBlock({
        sender,
        transactionBlock: scoredTx,
      });
      const scoredRv = scoredRes.results?.[0]?.returnValues?.[0];
      if (!scoredRv || !decodeBool(scoredRv)) return null;

      // 2) score, tier, confidence — batched into one inspection.
      const tx = new Transaction();
      const reg = tx.object(SCORE_REGISTRY_ID);
      tx.moveCall({
        target: TARGET.getScore,
        arguments: [reg, tx.pure.address(sender)],
      });
      tx.moveCall({
        target: TARGET.getTier,
        arguments: [reg, tx.pure.address(sender)],
      });
      tx.moveCall({
        target: TARGET.getConfidence,
        arguments: [reg, tx.pure.address(sender)],
      });
      tx.moveCall({
        target: TARGET.isBotFlagged,
        arguments: [reg, tx.pure.address(sender)],
      });

      const res = await client.devInspectTransactionBlock({
        sender,
        transactionBlock: tx,
      });
      const r = res.results;
      if (!r || r.length < 4) return null;

      const score = decodeU8(r[0].returnValues?.[0]);
      const tier = decodeU8(r[1].returnValues?.[0]);
      const confidence = decodeU8(r[2].returnValues?.[0]);
      const botFlagged = decodeBool(r[3].returnValues?.[0]);

      return {
        score,
        tier,
        tierLabel: TIER_LABEL[tier] ?? String(tier),
        confidence,
        confidenceLabel: CONFIDENCE_LABEL[confidence] ?? String(confidence),
        botFlagged,
        scored: true,
        qualifies: qualifiesFor(score),
      };
    },
  });
}
