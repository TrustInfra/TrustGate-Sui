"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Panel, StatRow } from "./Panel";
import { useTrustCap } from "@/hooks/useTrustCap";

export function CapPanel() {
  const account = useCurrentAccount();
  const { data, isLoading, isError, error } = useTrustCap(account?.address);

  return (
    <Panel title="TrustedAgentCap" eyebrow="02 / Capability">
      {!account ? (
        <Hint>Connect a wallet to check for a trust capability.</Hint>
      ) : isLoading ? (
        <Hint>Scanning owned objects for a cap…</Hint>
      ) : isError ? (
        <Hint tone="negative">
          Failed to read caps: {String(error?.message ?? error)}
        </Hint>
      ) : !data?.cap ? (
        <Hint>
          This wallet holds no TrustedAgentCap. A cap is minted by the oracle
          once a wallet&apos;s score clears the threshold.
        </Hint>
      ) : (
        <div>
          <div className="mb-5 flex items-center gap-3">
            <StatusDot ok={data.isValid} />
            <span className="font-display text-2xl font-bold">
              {data.cap.tierKind} cap
            </span>
            <span
              className={`font-mono text-xs uppercase tracking-widest ${
                data.isValid ? "text-positive" : "text-negative"
              }`}
            >
              {data.isValid ? "valid" : "expired"}
            </span>
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
            <p className="mt-4 text-sm leading-relaxed text-negative">
              This cap has expired. It can no longer authorize gated actions and
              must be re-issued by the oracle after a fresh score.
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        ok ? "bg-positive" : "bg-negative"
      }`}
    />
  );
}

function Hint({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "negative";
}) {
  return (
    <p
      className={`text-sm leading-relaxed ${
        tone === "negative" ? "text-negative" : "text-muted"
      }`}
    >
      {children}
    </p>
  );
}
