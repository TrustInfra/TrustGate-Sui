"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCoinScore, type CoinScoreResult } from "@/lib/tokenshield";

/**
 * Looks up a coin score. Pass null to stay idle. While the oracle reports
 * PENDING (coin queued but not scored yet) this polls every 5s until it
 * resolves, matching the spec's first-lookup behavior.
 */
export function useCoinScore(coinType: string | null) {
  return useQuery<CoinScoreResult>({
    queryKey: ["coinScore", coinType],
    queryFn: () => fetchCoinScore(coinType as string),
    enabled: Boolean(coinType),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 5000 : false,
    staleTime: 60_000,
    retry: 1,
  });
}
