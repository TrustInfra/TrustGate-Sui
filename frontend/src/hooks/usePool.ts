"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { GATED_POOL_ID, TARGET } from "@/lib/trustgate-sui";
import { ZERO_ADDRESS, decodeU64 } from "@/lib/onchain-read";

/** Total orders ever placed in the gated pool. Read via devInspect. */
export function useTotalOrders(): UseQueryResult<number> {
  const client = useSuiClient();

  return useQuery<number>({
    queryKey: ["total-orders"],
    queryFn: async () => {
      const tx = new Transaction();
      tx.moveCall({
        target: TARGET.totalOrders,
        arguments: [tx.object(GATED_POOL_ID)],
      });
      const res = await client.devInspectTransactionBlock({
        sender: ZERO_ADDRESS,
        transactionBlock: tx,
      });
      const rv = res.results?.[0]?.returnValues?.[0];
      return rv ? Number(decodeU64(rv)) : 0;
    },
  });
}

/**
 * The on-chain order-size ceiling for standard-tier callers. Read rather than
 * hardcoded so the UI tracks the contract if the limit ever changes.
 */
export function useStandardSizeLimit(): UseQueryResult<bigint> {
  const client = useSuiClient();

  return useQuery<bigint>({
    queryKey: ["standard-size-limit"],
    staleTime: Infinity,
    queryFn: async () => {
      const tx = new Transaction();
      tx.moveCall({ target: TARGET.standardSizeLimit, arguments: [] });
      const res = await client.devInspectTransactionBlock({
        sender: ZERO_ADDRESS,
        transactionBlock: tx,
      });
      const rv = res.results?.[0]?.returnValues?.[0];
      return rv ? decodeU64(rv) : 0n;
    },
  });
}
