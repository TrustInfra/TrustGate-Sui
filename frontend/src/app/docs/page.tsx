"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EVM_SITE } from "@/components/SiteNav";
import {
  PACKAGE_ID,
  GATED_POOL_ID,
  STANDARD_CAP_TYPE,
  ELITE_CAP_TYPE,
} from "@/lib/trustgate-sui";

type Item = { id: string; label: string };
type Group = { id: string; label: string; items: Item[] };

const GROUPS: Group[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { id: "what-is-trustgate", label: "What TrustGate is" },
      { id: "how-it-works", label: "How scoring works" },
    ],
  },
  {
    id: "wallet",
    label: "Wallet Trust Score",
    items: [
      { id: "wallet-trust-score", label: "Overview" },
      { id: "wallet-tiers", label: "Tiers" },
      { id: "trusted-agent-cap", label: "Trusted Agent Cap" },
    ],
  },
  {
    id: "pool",
    label: "Gated Pool",
    items: [
      { id: "gated-pools", label: "How gating works" },
      { id: "cap-tiers", label: "Cap tiers and limits" },
      { id: "integration", label: "Integration guide" },
    ],
  },
  {
    id: "tokenshield",
    label: "TokenShield",
    items: [
      { id: "tokenshield", label: "Overview" },
      { id: "reading-a-badge", label: "Reading a badge" },
      { id: "token-tiers", label: "Tiers" },
      { id: "using-the-checker", label: "Using the checker" },
    ],
  },
  {
    id: "widget",
    label: "Widget",
    items: [
      { id: "widget", label: "Embedding" },
      { id: "widget-config", label: "Configuration" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { id: "faq", label: "FAQ" },
      { id: "everywhere", label: "TrustGate everywhere" },
      { id: "disclaimer", label: "Disclaimer" },
    ],
  },
];

const ALL_IDS = GROUPS.flatMap((group) => group.items.map((item) => item.id));
const GROUP_OF: Record<string, string> = Object.fromEntries(
  GROUPS.flatMap((group) => group.items.map((item) => [item.id, group.id])),
);

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-white/[0.06] pt-12 first:border-t-0 first:pt-0"
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[#E6EAF2]">{title}</h2>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#8A93A6]">{children}</div>
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <Card padded={false} className="my-2">
      <pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed text-[#8A93A6]">
        {children}
      </pre>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0A0F1E] px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A6478]">{label}</p>
      <p className="mt-1 break-all font-mono text-xs text-[#E6EAF2]">{value}</p>
    </div>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#44DCEA]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DocsPage() {
  const [openGroups, setOpenGroups] = useState<string[]>(GROUPS.map((group) => group.id));
  const [active, setActive] = useState<string>(ALL_IDS[0]);

  // Scrollspy: mark the section nearest the top as active.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Keep the active section's group open.
  useEffect(() => {
    const group = GROUP_OF[active];
    if (group) {
      setOpenGroups((prev) => (prev.includes(group) ? prev : [...prev, group]));
    }
  }, [active]);

  const toggle = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">
            Documentation
          </p>
          <nav className="space-y-1">
            {GROUPS.map((group) => {
              const open = openGroups.includes(group.id);
              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => toggle(group.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-[#E6EAF2] transition-colors hover:bg-white/[0.04]"
                  >
                    <span>{group.label}</span>
                    <span className="text-[#5A6478]">
                      <ChevronIcon open={open} />
                    </span>
                  </button>
                  {open && (
                    <ul className="mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                              active === item.id
                                ? "bg-[#44DCEA]/10 text-[#44DCEA]"
                                : "text-[#8A93A6] hover:text-[#E6EAF2]"
                            }`}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="mb-12">
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.22em] text-[#44DCEA]">
            Documentation
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[#E6EAF2]">
            TrustGate on Sui
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#8A93A6]">
            A trust layer for Sui. This covers all four surfaces: the wallet Trust Score,
            gated pools and the trusted-agent caps, TokenShield for coins, and the
            embeddable widget. It is free, public, and running on Sui testnet.
          </p>
        </header>

        <div className="space-y-12">
          <DocSection id="what-is-trustgate" title="What TrustGate is">
            <p>
              On-chain, a scam and the real thing can look identical. TrustGate reads
              behavior that is already public and turns it into something you can act on:
              a readable score, a capability that gates access, and a signal you can drop
              into any app.
            </p>
            <p>It runs on four surfaces, and each is documented below:</p>
            <Bullets
              items={[
                <>
                  <span className="text-[#E6EAF2]">Wallet Trust Score</span>: a 0 to 100
                  score and tier for any address, read straight from the on-chain registry.
                </>,
                <>
                  <span className="text-[#E6EAF2]">Gated pools and trusted-agent caps</span>:
                  a wallet that clears the bar earns a capability that pools check before a
                  trade.
                </>,
                <>
                  <span className="text-[#E6EAF2]">TokenShield</span>: the same kind of read
                  for coins, holders, liquidity, authority, age, and concentration.
                </>,
                <>
                  <span className="text-[#E6EAF2]">The widget</span>: a one-line embed that
                  puts the TokenShield badge where people actually trade.
                </>,
              ]}
            />
            <p>
              TrustGate also runs on EVM at a separate product. This site is the Sui build.
            </p>
          </DocSection>

          <DocSection id="how-it-works" title="How scoring works">
            <p>
              A score blends several independent signals drawn from SuiScan data and live
              on-chain activity. No single number tells the whole story, so the score weighs
              the signals together and the formula stays transparent in what it looks at.
            </p>
            <p>For a wallet, the read is behavioral:</p>
            <Bullets
              items={[
                "Age, how long the wallet has been active",
                "Activity, how much and how consistently it transacts",
                "Counterparties, who it interacts with",
                "Patterns that look automated or adversarial",
              ]}
            />
            <p>For a coin, the read is structural:</p>
            <Bullets
              items={[
                "Holders, how many wallets hold it and how spread out they are",
                "Liquidity on live DEX pools",
                "Mint and freeze authority, whether supply can still change",
                "Age and the concentration of supply in the top holders",
              ]}
            />
            <p>
              Every input is something you can point to on-chain. TrustGate on Sui does not
              use a reputation graph or a trust-propagation algorithm. It reads observable
              signals and shows the result.
            </p>
          </DocSection>

          <DocSection id="wallet-trust-score" title="Wallet Trust Score">
            <p>
              Every wallet leaves a trail. The wallet Trust Score reads that trail into a
              single 0 to 100 score and a tier. Reading it is free: no wallet connection, no
              gas, and no signing, because the score is read directly from the on-chain
              registry. Anyone can look up any address on the Trust Score page.
            </p>
            <p>
              An address that has not been scored yet simply returns no score until the
              oracle writes one for it.
            </p>
          </DocSection>

          <DocSection id="wallet-tiers" title="Wallet tiers">
            <p>The score maps to a tier so you can read it at a glance:</p>
            <div className="flex flex-wrap gap-2">
              <Badge intent="success">High</Badge>
              <Badge intent="warn">Medium</Badge>
              <Badge intent="danger">Low</Badge>
              <Badge intent="danger">Blocked</Badge>
            </div>
            <p>
              High signals a well-established, well-behaved wallet. Medium is mixed or still
              building history. Low signals little history or risky patterns. A wallet flagged
              as automated or adversarial is marked Blocked regardless of its raw number, and
              it does not qualify for a cap.
            </p>
          </DocSection>

          <DocSection id="trusted-agent-cap" title="Trusted Agent Cap">
            <p>
              A wallet that clears the trust bar can hold a Trusted Agent Cap: a
              non-transferable capability object that lives in the wallet on-chain. It is the
              key that gated pools check. There are two tiers, Standard and Elite, and a cap
              stays valid for a window of epochs before it needs to be refreshed.
            </p>
            <p>
              The cap is not bought or self-minted. It is issued by the oracle to wallets that
              earn it, and it carries the score it was minted at, its issue epoch, and its
              expiry epoch.
            </p>
          </DocSection>

          <DocSection id="gated-pools" title="How gating works">
            <p>
              A gated pool checks one thing at trade time: does the wallet hold a valid
              Trusted Agent Cap. There is no oracle call from the pool and no integration tax.
              Trusted wallets trade, and everyone else is rejected.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
                <span className="text-sm text-[#E6EAF2]">Holds a valid cap</span>
                <span className="font-mono text-xs text-emerald-300">Order placed</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
                <span className="text-sm text-[#E6EAF2]">No cap or expired</span>
                <span className="font-mono text-xs text-red-400">Rejected</span>
              </div>
            </div>
          </DocSection>

          <DocSection id="cap-tiers" title="Cap tiers and limits">
            <p>
              The cap tier controls how much a wallet can do. A Standard cap can trade up to a
              size limit that the pool reads on-chain. An Elite cap clears larger orders. The
              limit is enforced by the pool, not by the interface, so the rule holds no matter
              how an order is submitted.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge intent="accent">Standard</Badge>
              <Badge intent="accent">Elite</Badge>
            </div>
          </DocSection>

          <DocSection id="integration" title="Integration guide">
            <p>
              To gate your own pool or action, check the wallet for a Trusted Agent Cap before
              you allow it. The cap types and the deployed objects are public on testnet:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Package" value={PACKAGE_ID} />
              <Field label="Gated pool" value={GATED_POOL_ID} />
              <Field label="Standard cap type" value={STANDARD_CAP_TYPE} />
              <Field label="Elite cap type" value={ELITE_CAP_TYPE} />
            </div>
            <p>Read the wallet for a cap of either type:</p>
            <Code>{`import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

const owned = await client.getOwnedObjects({
  owner: walletAddress,
  filter: {
    MatchAny: [
      { StructType: STANDARD_CAP_TYPE },
      { StructType: ELITE_CAP_TYPE },
    ],
  },
  options: { showType: true, showContent: true },
});

const hasCap = owned.data.length > 0;`}</Code>
            <p>
              A cap also carries an expiry epoch, so confirm it has not lapsed against the
              current epoch before you trust it. Elite caps clear larger sizes than Standard.
            </p>
          </DocSection>

          <DocSection id="tokenshield" title="TokenShield">
            <p>
              TokenShield gives a Sui coin a single legitimacy score from 0 to 100 and a clear
              tier, so you can judge a token at a glance before you trade. It is free and
              public, with no wallet or sign in, and it scores Sui mainnet coins.
            </p>
          </DocSection>

          <DocSection id="reading-a-badge" title="Reading a badge">
            <p>A badge carries three things:</p>
            <Bullets
              items={[
                <>
                  <span className="text-[#E6EAF2]">The score</span>, 0 to 100, the headline
                  read.
                </>,
                <>
                  <span className="text-[#E6EAF2]">The tier</span>, a plain-language label
                  for the score.
                </>,
                <>
                  <span className="text-[#E6EAF2]">The signals</span>, the inputs behind the
                  number, and any flags worth knowing.
                </>,
              ]}
            />
            <p>
              A high score with verified metadata and no flags is a clean read. A low score,
              or flags like an open mint authority or supply concentrated in a few wallets, is
              the part to slow down on.
            </p>
          </DocSection>

          <DocSection id="token-tiers" title="Coin tiers">
            <div className="flex flex-wrap gap-2">
              <Badge intent="success">Verified</Badge>
              <Badge intent="success">High</Badge>
              <Badge intent="warn">Medium</Badge>
              <Badge intent="danger">Low</Badge>
              <Badge intent="danger">Flagged</Badge>
            </div>
            <p>
              Verified and High are strong reads. Medium is mixed. Low and Flagged mean the
              signals raise real concerns, and Flagged in particular points at something the
              score wants you to see before you commit funds.
            </p>
          </DocSection>

          <DocSection id="using-the-checker" title="Using the checker">
            <p>
              Open TokenShield, paste a Sui coin type, and run it. You get the score, the
              tier, and the signals behind it, with a toggle to expand the full signal
              breakdown. A coin type looks like this:
            </p>
            <Code>{`0x2::sui::SUI`}</Code>
          </DocSection>

          <DocSection id="widget" title="Embedding the widget">
            <p>
              The widget puts a TokenShield badge straight into a DEX or wallet interface, so
              the signal shows up at the moment of the swap. It is one script tag:
            </p>
            <Code>{`<script
  src="https://sui.trustgated.xyz/widget.js"
  data-coin="0x2::sui::SUI">
</script>`}</Code>
            <p>The script renders the badge inline where you place the tag.</p>
          </DocSection>

          <DocSection id="widget-config" title="Widget configuration">
            <p>The widget is configured with data attributes on the script tag:</p>
            <Bullets
              items={[
                <>
                  <span className="font-mono text-[#E6EAF2]">data-coin</span>: the Sui coin
                  type to score. Required.
                </>,
                <>
                  <span className="font-mono text-[#E6EAF2]">data-mode</span>: the display
                  style, a full badge or a compact inline mark.
                </>,
              ]}
            />
            <p>
              The badge fetches its score from the same source as the site, so what the widget
              shows matches what TokenShield shows.
            </p>
          </DocSection>

          <DocSection id="faq" title="FAQ">
            <div className="space-y-5">
              <div>
                <p className="font-medium text-[#E6EAF2]">Is it free?</p>
                <p className="mt-1">
                  Yes. Reading a wallet score or a coin score takes no wallet, no sign in, and
                  no gas.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#E6EAF2]">Is this on mainnet?</p>
                <p className="mt-1">
                  The wallet score, the caps, and the gated pool run on Sui testnet.
                  TokenShield scores Sui mainnet coins.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#E6EAF2]">
                  Does it use a reputation graph or trust propagation?
                </p>
                <p className="mt-1">
                  No. TrustGate on Sui scores from transparent on-chain and market signals.
                  There is no graph and no trust-propagation algorithm here.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#E6EAF2]">Can I self-mint a cap?</p>
                <p className="mt-1">
                  No. Caps are issued by the oracle to wallets that earn the score, and they
                  are non-transferable.
                </p>
              </div>
            </div>
          </DocSection>

          <DocSection id="everywhere" title="TrustGate everywhere">
            <p>
              The same idea runs on EVM as a separate product. Wallets, tokens, and gated
              access, one trust layer reaching across chains.
            </p>
            <p>
              <a
                href={EVM_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#44DCEA] transition-colors hover:text-[#5fe6f2]"
              >
                Visit TrustGate on EVM
              </a>
            </p>
          </DocSection>

          <DocSection id="disclaimer" title="Disclaimer">
            <p>
              TrustGate scores are risk signals, not financial advice. A high score is not a
              guarantee and a low score is not a verdict. Always do your own research before
              you commit funds. The Sui surfaces described here run on testnet.
            </p>
          </DocSection>
        </div>
      </main>
    </div>
  );
}
