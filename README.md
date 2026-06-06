<div align="center">
  <img src="frontend/public/logo.png" alt="TrustGate" width="640" />

  <h3>Trust infrastructure for Sui</h3>
  <p>Know a token before you trade it. TrustGate scores every Sui coin for legitimacy and shows the risk at a glance.</p>

  <p>
    <img src="https://img.shields.io/badge/network-Sui-2DD4BF" alt="Sui" />
    <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/license-MIT-22D3EE" alt="MIT" />
    <img src="https://img.shields.io/badge/status-testnet-FBBF24" alt="Testnet" />
  </p>

  <p>
    <a href="https://trustgated.xyz">TrustGate EVM</a> &nbsp;&bull;&nbsp;
    <a href="https://x.com/TrustGated">X</a> &nbsp;&bull;&nbsp;
    <a href="https://youtube.com/@TrustGated">YouTube</a> &nbsp;&bull;&nbsp;
    <a href="https://discord.gg/4QJSdc8gbC">Discord</a>
  </p>
</div>

---

## About

TrustGate-Sui brings the TrustGate trust layer to Sui. Anyone can mint a token in minutes, and on-chain a scam and a blue chip look identical. TrustGate reads the on-chain and market signals for you and returns a single legitimacy score, so the risk is visible before funds move.

This repository holds the Sui frontend, the scoring proxy, the embeddable widget, and the deployed Move contracts for trust-gated access.

> [!NOTE]
> TrustGate-Sui is on testnet and under active development. It is provided as is. Scores are risk signals, not financial advice. Always do your own research.

## TokenShield

TokenShield scores a Sui coin from 0 to 100 and assigns a plain tier. The signals behind a score include token age, holder count and distribution, liquidity depth, deployer reputation, supply controls, and metadata. The exact weighting is kept private so the score cannot be gamed.

| Tier | Meaning |
| --- | --- |
| Verified | Known good token on the allowlist |
| High | Strong signals, low risk |
| Medium | Mixed signals, trade with care |
| Low | Weak signals, elevated risk |
| Flagged | Active danger signals, avoid |

Scoring reads Sui mainnet data. It does not use EigenTrust, AgentRank, or a knowledge graph. It is free and public, with no wallet or fee required.

## Features

| Surface | What it does |
| --- | --- |
| Checker | Paste a coin type at `/token-shield` and read its score, tier, and signals |
| Widget | One script tag puts a live trust badge next to any token on any site |
| Docs | How scoring works, what each tier means, how to read a badge, at `/docs` |
| Trust gating | Move contracts that gate access to a pool by on-chain trust |

## Deployed contracts (Sui testnet)

The trust-gating layer is deployed on Sui testnet. These object IDs are public on-chain.

| Object | ID |
| --- | --- |
| Package | `set in frontend/src/lib/trustgate-sui.ts` |
| ScoreRegistry | `set in frontend/src/lib/trustgate-sui.ts` |
| GatedPool | `set in frontend/src/lib/trustgate-sui.ts` |
| OracleCap | `set in frontend/src/lib/trustgate-sui.ts` |
| MintAuthority | `set in frontend/src/lib/trustgate-sui.ts` |

The live IDs are kept in the frontend constants file as the single source of truth.

## Running locally

Requirements: Node 20+ and npm.

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Environment

Create `frontend/.env.local`:

```bash
# Coin scoring oracle, read server-side by the proxy
COIN_ORACLE_URL=https://your-oracle-url

# Switch off the mock and score against the live oracle
NEXT_PUBLIC_TOKENSHIELD_LIVE=true
```

Coin scoring is served through a same-origin proxy at `/api/coin`, so the oracle is reached server-side and its location never ships to the client. With `NEXT_PUBLIC_TOKENSHIELD_LIVE` unset, the app serves sample data.

## Embed the widget

Any site can show a TrustGate badge. Add the script once, then mark any element with a coin type.

```html
<script
  src="https://sui.trustgated.xyz/widget.js"
  data-api="https://sui.trustgated.xyz/api/coin"
  defer></script>

<span data-trustgate-coin="0x2::sui::SUI"></span>
```

For token lists that render after load, call `window.TrustGate.scan()` once the rows mount. The widget has no dependencies and its styles are isolated, so it will not clash with the host page.

## Project structure

```
frontend/
  public/
    widget.js              embeddable badge
    widget-demo.html       widget demo page
  src/
    app/
      page.tsx             landing page
      token-shield/        coin checker
      docs/                documentation
      dashboard/           trust-gated pool
      api/coin/route.ts    server-side oracle proxy
    components/            SiteNav, CoinBadge, BackgroundPaths
    hooks/                 useCoinScore
    lib/                   tokenshield, trustgate-sui constants
```

## Links

- TrustGate EVM: https://trustgated.xyz
- X: https://x.com/TrustGated
- YouTube: https://youtube.com/@TrustGated
- Discord: https://discord.gg/4QJSdc8gbC

## License

MIT. See [LICENSE](LICENSE).
