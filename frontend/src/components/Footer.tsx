import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

// TrustGate EVM site. Mirrors EVM_SITE in SiteNav; kept here so the footer has
// no dependency on the client nav module.
const EVM_SITE = "https://trustgated.xyz";

const SOCIALS = {
  x: "https://x.com/TrustGated",
  youtube: "https://youtube.com/@TrustGated",
  discord: "https://discord.gg/4QJSdc8gbC",
};

const PRODUCT_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "TokenShield", href: "/token-shield" },
  { label: "Trust Score", href: "/trust-score" },
  { label: "Gated Pool", href: "/dashboard" },
  { label: "Docs", href: "/docs" },
];

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const SOCIAL_ITEMS: ReadonlyArray<{ label: string; href: string; Icon: () => React.ReactElement }> = [
  { label: "TrustGate on X", href: SOCIALS.x, Icon: XIcon },
  { label: "TrustGate on YouTube", href: SOCIALS.youtube, Icon: YouTubeIcon },
  { label: "TrustGate on Discord", href: SOCIALS.discord, Icon: DiscordIcon },
];

/**
 * Footer is shared across the whole site. It belongs in the root layout so
 * every route renders the same footer with no per-page drift.
 */
export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#0A0F1E]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#44DCEA]/30 to-transparent"
      />
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold tracking-tight text-[#E6EAF2]">TrustGate</span>
              <Badge intent="accent">Sui Testnet</Badge>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#8A93A6]">
              A trust layer for Sui. Behavioral on-chain activity becomes a readable
              score, a capability that gates access, and a signal you can drop into
              any app.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_ITEMS.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-[#8A93A6] transition-colors hover:border-[#44DCEA]/40 hover:text-[#44DCEA]"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Product" className="text-sm">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">Product</p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[#8A93A6] transition-colors hover:text-[#E6EAF2]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Ecosystem" className="text-sm">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#5A6478]">Ecosystem</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={EVM_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8A93A6] transition-colors hover:text-[#E6EAF2]"
                >
                  TrustGate on EVM
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-[#5A6478] sm:flex-row sm:items-center sm:justify-between">
          <p>TrustGate Sui. Free and public. Scores are risk signals, not financial advice.</p>
          <p>Built by TrustInfra.</p>
        </div>
      </div>
    </footer>
  );
}
