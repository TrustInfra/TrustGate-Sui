"use client";

import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";

/** Top bar: brand mark on the left, nav and wallet connect on the right. */
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="TrustGate"
            width={30}
            height={30}
            priority
            className="h-[30px] w-auto"
          />
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Sui · Testnet
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/token-shield"
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            TokenShield
          </Link>
          <Link
            href="/docs"
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            Docs
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
