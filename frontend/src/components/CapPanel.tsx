"use client";

import type { ReactNode } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Panel, StatRow } from "./Panel";
import { Badge } from "@/components/ui/Badge";
import { useTrustCap } from "@/hooks/useTrustCap";

export function CapPanel() {
  const account = useCurrentAccount();
  const { data, isLoading, isError, error } = useTrustCap(account?.address);

  return (
    <Panel title="TrustedAgentCap" eyebrow="02 / Capability">
      {!account ? (
        <StateLine badge={<Badge intent="default">Not connected</Badge>}>
          Connect a wallet to check for a trust capability.
        </StateLine>
      ) : isLoading ? (
        <StateLine badge={<Badge intent="default">Scanning</Badge>}>
          Scanning owned objects for a cap…
        </StateLine>
      ) : isError ? (
        <StateLine badge={<Badge intent="danger">Error</Badge>}>
          Failed to read caps: {String(error?.message ?? error)}
        </StateLine>
      ) : !data?.cap ? (
        <StateLine badge={<Badge intent="default">No cap</Badge>}>
          This wallet holds no TrustedAgentCap. A cap is minted by the oracle
          once a wallet&apos;s score clears the threshold.
        </StateLine>
      ) : (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge intent="accent">{data.cap.tierKind}</Badge>
            <Badge intent={data.isValid ? "success" : "danger"}>
              {data.isValid ? "Active" : "Expired"}
            </Badge>
          </div>
          <StatRow label="Score at mint">{data.cap.scoreAtMint}</StatRow>
          <StatRow label="Issued epoch">{data.cap.issuedEpoch}</StatRow>
          <StatRow label="Expiry epoch">{data.cap.expiryEpoch}</StatRow>
          <StatRow label="Current epoch">{data.currentEpoch}</StatRow>
          <StatRow label="Epochs remaining">
            {data.isValid
              ? Math.max(0, data.epochsRemaining ?? 0)
              : "0 (expired)"}
          </StatRow>
          {!data.isValid ? (
            <p className="mt-4 text-sm leading-relaxed text-red-400">
              This cap has expired. It can no longer authorize gated actions and
              must be re-issued by the oracle after a fresh score.
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}

function StateLine({
  badge,
  children,
}: {
  badge: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {badge}
      <span className="text-sm leading-relaxed text-[#8A93A6]">{children}</span>
    </div>
  );
}
