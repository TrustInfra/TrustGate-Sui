"use client";

import { useMemo, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import type { SuiTransactionBlockResponse } from "@mysten/sui/jsonRpc";
import { Panel, StatRow } from "./Panel";
import { useTrustCap } from "@/hooks/useTrustCap";
import { useStandardSizeLimit, useTotalOrders } from "@/hooks/usePool";
import { GATED_POOL_ID, PACKAGE_ID, SIDE, TARGET } from "@/lib/trustgate-sui";

const ORDER_PLACED_TYPE = `${PACKAGE_ID}::deepbook_gated_pool::OrderPlaced`;

interface OrderPlacedEvent {
  order_id: string;
  side: string;
  price: string;
  size: string;
  elite: boolean;
  placed_epoch: string;
}

const isU64 = (s: string) => /^\d+$/.test(s.trim());

export function GatedPoolWidget() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const queryClient = useQueryClient();

  const { data: capData } = useTrustCap(account?.address);
  const { data: totalOrders } = useTotalOrders();
  const { data: sizeLimit } = useStandardSizeLimit();

  const [side, setSide] = useState<number>(SIDE.BID);
  const [price, setPrice] = useState("100");
  const [size, setSize] = useState("1000");
  const [placed, setPlaced] = useState<OrderPlacedEvent | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const cap = capData?.cap ?? null;
  const hasValidCap = !!cap && capData?.isValid === true;
  const isElite = cap?.tierKind === "ELITE";

  const { mutate: signAndExecute, isPending } =
    useSignAndExecuteTransaction<SuiTransactionBlockResponse>({
      execute: async ({ bytes, signature }) =>
        client.executeTransactionBlock({
          transactionBlock: bytes,
          signature,
          options: { showEvents: true, showEffects: true },
        }),
    });

  // Standard callers are capped at the on-chain size limit; elite callers are not.
  const exceedsStandardLimit = useMemo(() => {
    if (isElite || !isU64(size) || sizeLimit === undefined) return false;
    return BigInt(size) > sizeLimit;
  }, [isElite, size, sizeLimit]);

  const validInputs =
    isU64(price) && isU64(size) && BigInt(size || "0") > 0n;
  const canSubmit =
    hasValidCap && validInputs && !exceedsStandardLimit && !isPending;

  function onSubmit() {
    setFormError(null);
    setPlaced(null);

    if (!cap || !hasValidCap) return;
    if (!validInputs) {
      setFormError("Price and size must be non-negative integers, size > 0.");
      return;
    }
    if (exceedsStandardLimit) {
      setFormError(
        `Size exceeds the standard limit of ${sizeLimit?.toString()}. An elite cap is required for larger orders.`,
      );
      return;
    }

    const tx = new Transaction();
    // Elite caps route to the unlimited elite path; standard caps to the gated path.
    tx.moveCall({
      target: isElite ? TARGET.placeEliteOrder : TARGET.placeGatedOrder,
      arguments: [
        tx.object(cap.objectId),
        tx.object(GATED_POOL_ID),
        tx.pure.u8(side),
        tx.pure.u64(BigInt(price)),
        tx.pure.u64(BigInt(size)),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (res) => {
          const event = res.events?.find((e) => e.type === ORDER_PLACED_TYPE);
          if (event?.parsedJson) {
            setPlaced(event.parsedJson as OrderPlacedEvent);
          }
          // Refresh the pool order count and the wallet's cap state.
          queryClient.invalidateQueries({ queryKey: ["total-orders"] });
          queryClient.invalidateQueries({ queryKey: ["trust-cap"] });
        },
        onError: (err) => setFormError(err.message),
      },
    );
  }

  return (
    <Panel title="Gated Pool" eyebrow="03 / DeepBook demo">
      <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
        <StatRow label="Total orders">{totalOrders ?? "—"}</StatRow>
        <StatRow label="Your tier">
          {isElite ? "ELITE" : cap ? "STANDARD" : "—"}
        </StatRow>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Side</Label>
          <div className="flex gap-2">
            <SideButton
              active={side === SIDE.BID}
              onClick={() => setSide(SIDE.BID)}
            >
              Bid
            </SideButton>
            <SideButton
              active={side === SIDE.ASK}
              onClick={() => setSide(SIDE.ASK)}
            >
              Ask
            </SideButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price" value={price} onChange={setPrice} />
          <Field label="Size" value={size} onChange={setSize} />
        </div>

        {exceedsStandardLimit ? (
          <p className="text-sm text-negative">
            Size exceeds the standard limit ({sizeLimit?.toString()}). Elite cap
            required for larger orders.
          </p>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full rounded border border-accent bg-accent/10 px-4 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-accent transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted"
        >
          {isPending
            ? "Placing order…"
            : isElite
              ? "Place elite order"
              : "Place gated order"}
        </button>

        {!hasValidCap ? (
          <p className="text-sm leading-relaxed text-negative">
            No TrustedAgentCap, you do not qualify yet.
            {cap && !capData?.isValid
              ? " The cap held by this wallet has expired."
              : ""}
          </p>
        ) : null}

        {formError ? (
          <p className="text-sm text-negative">{formError}</p>
        ) : null}

        {placed ? (
          <div className="rounded border border-positive/40 bg-positive/5 p-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-positive">
              OrderPlaced
            </p>
            <StatRow label="Order id">{placed.order_id}</StatRow>
            <StatRow label="Side">
              {placed.side === String(SIDE.BID) ? "Bid" : "Ask"}
            </StatRow>
            <StatRow label="Price">{placed.price}</StatRow>
            <StatRow label="Size">{placed.size}</StatRow>
            <StatRow label="Elite">{placed.elite ? "yes" : "no"}</StatRow>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-border bg-surface-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

function SideButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded border px-3 py-2 font-mono text-sm uppercase tracking-widest transition ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
