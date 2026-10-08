# VerifyChain

An evidence-first product passport application on **Ethereum Sepolia testnet**. Consumers inspect registrations without a wallet. Manufacturers review canonical metadata, authorize a server-side IPFS upload, and explicitly sign a registration. Authorized handlers record checkpoints. Registration does **not** certify a brand or the physical item.

Repository: [Kartik2004sharma/VerifyChain](https://github.com/Kartik2004sharma/VerifyChain).

## Current release state

The application and repaired contract source are implemented locally. There is **no verified hosted release or active Sepolia deployment for this source**. `deployments/manifest.json` intentionally has no active addresses. Old addresses and historical files are preserved for investigation, not silently reused. Lookups show unavailable and writes stay disabled until configuration is validated.

Read [implementation progress](docs/IMPLEMENTATION_PROGRESS.md), [the audit](docs/PROJECT_AUDIT.md) and [all 53 acceptance requirements](docs/QA_ACCEPTANCE_MATRIX.md). A successful test fixture is not public-chain evidence.

## Local verification

Clean install, lint, strict types and production build pass. Tests: 42 unit/API, 20 Solidity, 5 real local-chain integration and **134 browser/visual checks passed**, covering 42 reviewed images; 6 duplicate screenshot cases deliberately skip outside the two baseline viewports. 8 October three-run Lighthouse medians: mobile **99/100/100/100**, desktop **100/100/100/100** (performance/accessibility/best-practices/SEO). Both profiles pass their unchanged budgets; the earlier mobile failure is retained in the dated audit history. The 53-row ledger records **27 local passes, 21 partial requirements and 5 blocked release requirements**. This is local evidence, not hosted/Sepolia acceptance or an independent audit. [Latest verification evidence](docs/audit-evidence/release-2026-10-08/preflight-summary.json).

## Start and validate

Use Node **24.19.0**, npm 11 and the committed npm lock. Local commands below follow this workspace's RTK instructions; CI uses npm directly because its isolated runner does not have RTK installed.

```sh
rtk npm ci
rtk npm run dev
rtk npm run check
rtk npm run abi:export
rtk npx playwright install chromium webkit
rtk npm run test:e2e
```

`check` runs lint, strict types, domain/API-boundary tests, real Hardhat tests, an isolated application/contract integration test and the production build. Browser tests require the production build; the runner starts its own server at port 3100. Hosted smoke uses `E2E_BASE_URL`. Most verdict browser tests replace HTTP responses deliberately; the local integration runner deploys real contracts on an isolated chain and replaces only configuration and metadata retrieval. No runtime demo fallback exists.

The isolated local chain uses Sepolia's numeric chain ID solely to exercise the application's selected chain boundary. It is **not Sepolia**, and no local account or local receipt is public release proof. The test runner shuts it down afterward.

Visual baselines use pinned Chromium. Never automatically update them to hide a regression. Inspect differences and record an intentional design change before approving replacements. Accessibility tests supplement, rather than replace, real keyboard, screen-reader and device review.

## Implemented workflows

- `/verify?id=…`: public registration/revocation, metadata integrity, self-registered manufacturer identity and blockchain context. Old `/dashboard/verify-product?id=…` links still work.
- Registration: product details → exact canonical review → signed IPFS upload → simulated write → wallet approval → two-confirmation receipt/event check → QR label.
- Supply chain: typed checkpoints, empty/error states and explicit authorized handler writes. Handler authorization is global; it is not exclusive product custody.
- Observations/history and analytics: up to the latest 100 actual wallet opinions for an entered ID, working filters, pagination and escaped CSV. Read-only lookups create no observation transactions.
- Wallet overview: up to the latest 100 actual registrations belonging to the connected wallet.
- Settings: device-local theme and spacing preferences, plus network and release information.
- Evidence exports: JSON, CSV and PDF; QR SVG labels point to the public passport. Unknown receipts remain unavailable.

Each active workspace uses **one SSR-safe wagmi provider and one QueryClient**, with a shared wallet configuration across route navigation. The public homepage loads theme/branding independently and does not initialize wallet discovery. It supports detected injected wallets through an original accessible connection control. RainbowKit, WalletConnect and unused bridge/storage/payment SDKs were removed to reduce unrelated code and dependencies. Browser wallets must inject an EIP-1193 provider; mobile deep-link/WalletConnect support is not claimed. Account and network changes remain explicit.

## Trust and data model

Canonical schema `verifychain.product.v1` uses a fixed field order, normalized strings and UTF-8 JSON without whitespace. Keccak-256 commits those canonical bytes. Metadata includes product ID, name, description, category, serial and origin. Retrieved content must validate and agree with the product's ID/name and commitment. URI-only updates are replaced by authorized updates of **both URI and hash** in source v2; previously used commitments stay reserved. Updates do not undo revocation.

Verdicts are `registered`, `revoked`, `not_found`, `integrity_mismatch`, `unavailable` and `invalid_input`. Metadata retrieval and manufacturer activity are independent evidence fields. Manufacturer names are self-registered. Observation booleans/confidence are submitted opinions, never ground truth. A copied QR can point to a real record.

Reads take a fresh block snapshot, disable block-number caching and send `Cache-Control: no-store`; there is no public verdict cache. A known product's registration event is scanned only at its recorded registration block, matched to its indexed ID topic and deduplicated by transaction/log index. If that optional evidence cannot be resolved, no receipt is invented. Each request rereads current chain state; reorgs are not carried forward through a persistent index.

## Configuration and security

Copy `.env.example` to `.env.local` and configure it privately. Never put secrets into chat or commit them.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `APP_ORIGIN` | Server | Exact reviewed origin authorized for upload challenges |
| `SEPOLIA_RPC_URL` | Server | HTTPS RPC for chain/code/read checks |
| `PINATA_JWT` | Server | Real Pinata JSON pinning; never sent to a browser |
| `UPLOAD_AUTH_SECRET` | Server | At least 32 random characters for challenge integrity |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Server | Shared quotas and one-use nonce consumption; required in production |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Public | Browser read/simulation RPC; restrict provider origins |

`/api/health/live` checks whether the application serves requests. `/api/health/ready` fails closed without quotas, a reachable Sepolia RPC and source-matching deployed code. Verification consumes a shared production quota. On Vercel, identity uses the platform-managed `x-vercel-forwarded-for`; other hosting uses a conservative global bucket until a trusted proxy adapter is implemented. Never expose an origin behind a proxy that accepts forged platform headers.

Uploads require an origin/chain/address-bound signed challenge, five-minute expiry, a random nonce consumed atomically in shared Redis, per-wallet quota and bounded JSON. Development-only in-memory quota is bounded and is never used in production. Camera frames remain on-device. Uploaded metadata and on-chain records are public; do not enter personal/confidential content. Only fixed IPFS gateway URLs with CID-like payloads are fetched, not arbitrary contract-supplied HTTP URLs. Requests/timeouts and response bodies are bounded.

Production scripts use per-request CSP nonces, no inline-script bypass and no eval. Inline styles are permitted for the theme/QR/scanner libraries. RPC connections are restricted to the configured HTTPS origin. Camera is limited to this origin; microphone/geolocation are disabled. Etherscan links are external evidence links, not embedded frames.

## Contracts and release

A new deployment is required. Source repairs do not patch old immutable contracts. The initial release deploys only ProductRegistry, VerificationRegistry and SupplyChainTracker.

CounterfeitReporter is **quarantined**. Its replacement source returns principal once, maintains outstanding escrow separately from voluntarily funded reserves, permits expired insufficient-vote reports to release funds, rejects owner escrow withdrawals and handles failed/reentrant recipients. Unfunded bonus promises were deliberately retired rather than shifted to other participants' stakes. It is not an independently audited financial product, and is excluded from the deploy script and UI.

After the owner reviews the concrete release and approves testnet deployment, configure local-only deployment credentials from `.env.contracts.example` in `.env.local` (not on Vercel):

```sh
rtk npm run contracts:compile
rtk npm run abi:export
rtk npx hardhat run scripts/deploy.cjs --network sepolia
rtk node scripts/activate-manifest.mjs deployments/<reviewed-sepolia-v2-file>.json
rtk npm run check
```

The deploy script saves real receipts, blocks, code/source/ABI hashes and compiler settings into a new history file. It preserves the active manifest. Activation verifies the deployed code and receipt against compiled source identity before switching the manifest. Archive the previous manifest before deliberate activation. Do not blindly rerun a partially completed deployment; reconcile submitted hashes first.

Vercel preparation: import this repository, use Node 24, `npm ci` and `npm run build`, and set server/public variables separately for Preview and Production. Set `APP_ORIGIN` to the exact reviewed preview origin for testing, then to the production origin for promotion. Do not configure deployment keys on the host. No paid resource or public publication has been performed by this build.

After a reviewed preview exists:

```sh
rtk npm run test:e2e
# For hosted smoke, set E2E_BASE_URL to the reviewed preview first.
rtk npm run release:check
```

`release:check` requires a verified HTTPS `RELEASE_ORIGIN`, real `RELEASE_PRODUCT_ID` and user-approved `RELEASE_TRANSACTION_HASH`, in addition to the server RPC. It verifies manifest/code/deployment receipts, hosted liveness/readiness and retrievable matching product metadata. It exits nonzero on missing evidence. Public-chain camera, wallet rejection/network changes and checkpoint receipt checks still need real devices/wallet approval.

Rollback the web deployment to the last known-good host revision and its reviewed environment/manifest. Hosting rollback cannot undo chain writes. Contract replacement requires a separately versioned manifest and migration/compatibility review.
