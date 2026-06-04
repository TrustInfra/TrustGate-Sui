# TrustGate-Sui — Tasks

Date: 2026-06-04

## Current Task
Frontend scaffold (Next.js dashboard for the deployed Sui testnet contracts).

## Completed This Session
- Scaffolded `frontend/` with create-next-app: Next 16.2.7, React 19.2, TypeScript, Tailwind v4, App Router, src dir, ESLint, `@/*` alias.
- Installed and pinned: `@mysten/dapp-kit` 1.0.6, `@mysten/sui` 2.17.0, `@tanstack/react-query` 5.101.0. Pinned all scaffolded dev deps to exact versions.
- Added `.npmrc` with `min-release-age=7` (note: npm 10.9.3 does not enforce this key — see Blockers).
- Providers (`src/app/providers.tsx`): QueryClientProvider > SuiClientProvider (testnet only) > WalletProvider autoConnect; imports `@mysten/dapp-kit/dist/index.css`.
- Read hooks (devInspect, react-query): `useTrustScore`, `useTrustCap`, plus `usePool` (`useTotalOrders`, `useStandardSizeLimit`). All onchain IDs/targets imported from `src/lib/trustgate-sui.ts` — nothing hardcoded.
- Components: `Header` (ConnectButton), `ScorePanel`, `CapPanel`, `GatedPoolWidget` (gated trade form; submit enabled only with a valid cap, routes elite caps to placeEliteOrder), `Panel` primitives.
- Single dashboard page (`src/app/page.tsx`).
- Brand theme in `globals.css`: navy #0A0F1E, cyan accent, Syne headings / Geist body.
- `npm run build` passes (type check + static gen). `npm run lint` clean.

## sui 2.0 API notes (carried forward)
- `getFullnodeUrl` -> `getJsonRpcFullnodeUrl` from `@mysten/sui/jsonRpc`.
- `NetworkConfig` requires `{ network, url }`.
- `SuiTransactionBlockResponse` imports from `@mysten/sui/jsonRpc`.
- tsconfig target bumped ES2017 -> ES2020 (BigInt literals).
- `bcs.u64().parse()` returns a string; coerced to bigint in `decodeU64`.

## Session 2026-06-04 (cont.)
- Installed `geist` 1.7.2 (pinned, --save-exact). Was imported in `layout.tsx` but never installed — app would NOT have compiled. Now present.
- Closed the `bot_flagged` gap (was unread/unsurfaced anywhere):
  - `useTrustScore`: added `TARGET.isBotFlagged` to the batched devInspect; return now includes `botFlagged` and `scored`.
  - `ScorePanel`: added a "Bot flagged" row + loud "Trust blocked" warning when flagged (trust denied regardless of score).
- Verified real testnet object shapes via direct JSON-RPC (no wallet):
  - Registry scores Table id path: `content.fields.scores.fields.id.id`.
  - ScoreRecord (dynamic field): `content.fields.value.fields.{score,tier,confidence,bot_flagged,updated_epoch}`. Live record 0xa1d2..6f39 = score 80 / tier 2 / conf 2 / bot_flagged false / epoch 1120.
  - Cap: `content.fields.{owner,score_at_mint,issued_epoch,expiry_epoch}`. Live STANDARD cap = score_at_mint 80, issued 1120, expiry 1150.
- `npm run build` clean (compile + tsc + lint). `npm run dev` boots, route compiles, GET / => 200 with all panels rendered.

## Deviations from the build spec (intentional, justified)
- Score read uses `devInspect` getters (`get_score/get_tier/get_confidence/is_bot_flagged`) NOT `getObject`+`getDynamicFieldObject`. Same field values, avoids Table-path fragility, uses the contract's canonical public read API. The field paths the spec described are confirmed correct anyway (above); the return contract matches (`score,tier,confidence,botFlagged,scored`).
- `providers.tsx` keeps `getJsonRpcFullnodeUrl` from `@mysten/sui/jsonRpc`. The spec's `getFullnodeUrl` from `@mysten/sui/client` does not exist in installed 2.17.0 (would break). The JSON-RPC client class is `SuiJsonRpcClient`, not `SuiClient`, in this version.

## Next
- Verify against a real connected testnet wallet (browser): connect, read scored/unscored address, place an order with the held cap.
- Wire Sentry, `public/llms.txt`, `vercel.json` before any deploy (per global standards).

## Blockers / Decisions Pending
- `.npmrc min-release-age=7` is not honored by npm 10.9.3 (feature lands in npm 11.5+). Decide whether to upgrade npm or switch to pnpm for enforced supply-chain delay.
- 2 moderate `npm audit` advisories are a transitive `postcss` inside Next's own toolchain; the only "fix" downgrades Next to 9.x. Left as-is, not exploitable in a Next build.
