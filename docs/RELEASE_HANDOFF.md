# Reviewable release handoff

The implementation branch is `codex/verifychain-release`; the reviewed application is also on GitHub `main`. At the original local handoff, no public deployment, funded transaction, push, PR or production promotion had been performed. The active manifest intentionally blocks live reads/writes until new source-matching contracts exist.

## Smallest external steps

1. Review the local UI, contract policy changes and acceptance ledger.
2. Configure a dedicated HTTPS Sepolia RPC privately. Approve deployment of the three non-financial v2 contracts with a testnet wallet. Do not paste a key or seed phrase into chat. Deploy locally with `scripts/deploy.cjs`; its incremental journal preserves submitted hashes for interrupted attempts.
3. Review real deployment receipts and activate their source/ABI/code-matching manifest. Build again after activation. Preserve the former manifest and historical addresses.
4. Configure Pinata storage, a random upload authorization secret and shared Upstash Redis quotas privately in Preview. The website is already published using Vercel CLI 63.1.0 and the owner’s existing login. Set the exact preview `APP_ORIGIN` deliberately.
5. Run hosted browser smoke, then sign one real manufacturer/product registration and one authorized checkpoint. Reconcile actual receipts/events and retrieve the canonical metadata. Test the printed label and camera on a real HTTPS mobile device.
6. Run `release:check` with the real hosted origin, product ID and registration transaction hash. Independently run CI for the exact published revision. Review manual screen-reader/zoom and wallet/device results before deliberate production promotion.

All independent local work is recorded in `IMPLEMENTATION_PROGRESS.md`. Missing credentials or human device/signature checks are never treated as passed.

## Configuration boundaries

Server-only: APP_ORIGIN, SEPOLIA_RPC_URL, PINATA_JWT, UPLOAD_AUTH_SECRET, UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. Browser-only public RPC: NEXT_PUBLIC_SEPOLIA_RPC_URL. Contract deployment keys stay local and must not be added to the web host. Live dependency credentials are still absent. The CLI-created local environment file holds deployment authentication material only; it is ignored by Git and excluded from source upload. Never publish that file.

The uploader is signed JSON metadata storage, with bounded canonical fields. Image/file uploads, WalletConnect, brand certification, billing, mainnet and financial reporting are not exposed. Do not enable those surfaces merely because an installed SDK exists.

## Deliberate scope decisions

- One wagmi provider replaces both ethers context and RainbowKit. Injected wallets support one coherent account/chain identity; WalletConnect/deep links await a separately tested integration.
- No persistent event index is needed for the scoped release. IDs come from actual registry pages; observations come from bounded getters; registration evidence scans a known registration block. Reads snapshot current block state with no verdict cache. A general discovery/indexer needs a separately specified pagination/reorg design.
- The escrow replacement removes unfunded bonuses and returns principal once. Financial actions remain quarantined and require independent review before any future deployment. Existing immutable deployments do not inherit these fixes.
- CI uses macOS to match reviewed Darwin Chromium baselines. Behavioral coverage includes four viewport sizes plus WebKit; baseline pixels cover desktop/mobile, both themes and critical verdict states.

## Operational limits and rollback

Read availability depends on RPC, shared quota storage and source-matching deployed code. Metadata availability depends on IPFS pinning/gateway retrieval. An unavailable dependency yields an unavailable state, not counterfeit.

If a web deployment regresses, restore the last reviewed Vercel revision with its matching manifest/environment. Hosting rollback cannot undo registrations, revocations, checkpoints or uploads. Replacing contracts needs a new manifest and migration review. Keep deployment journals and evidence reports.

Contract static analysis with Slither is currently unavailable (tool absent). Obtain an independent source/security review before deployment; escrow remains excluded regardless of local unit results. Final CI now includes both three-run Lighthouse budgets in addition to the browser/contract/domain gates. CI itself has not been run.

## Publication work — 8 October 2026

The owner authorized GitHub publication and website deployment. The authenticated CLI linked a dedicated `verifychain` Vercel project under the owner’s existing scope; the connector’s scoped API returned 403, so the CLI’s existing credentials were used. Build settings explicitly use Node 24 and `npm ci`. A fresh high-severity source-map-js advisory was repaired with the compatible 1.2.2 lockfile update. Clean install, the complete strict quality pipeline and 134 browser checks pass. Real environment files and unrelated `.serena` metadata are excluded from source upload.

The website can serve its reviewed interface while live services remain unavailable and writes remain disabled. This is not a completed Sepolia integration release: the dedicated RPC, three matching deployments, Redis, Pinata and human-approved signed workflow are still absent. No deployment key or wallet signature is manufactured. See `audit-evidence/release-2026-10-08/preflight-summary.json` for current proof; publication results follow only after actual verification.

The first independent CI run passed the full strict build/contract/domain gates and ABI identity check, with 133 browser checks passing and one WebKit keyboard check failing. That check incorrectly used plain Tab to include links; it now uses Safari’s native Option–Tab and asserts focus on the exact Etherscan link after resetting to the evidence disclosure. Five focused browser checks pass. No application styling or snapshot baseline was changed. The staged production build is READY and all 13 page/API HTTP smoke checks pass expected statuses; its runtime error scan is empty. Public promotion remains gated on the repeated CI run.

## Published website — 8 October 2026

- Website: [verifychain-murex.vercel.app](https://verifychain-murex.vercel.app), public without login.
- GitHub: [Kartik2004sharma/VerifyChain](https://github.com/Kartik2004sharma/VerifyChain), main updated without history rewriting.
- Independent application CI: [successful run for 45d2bb8](https://github.com/Kartik2004sharma/VerifyChain/actions/runs/37814803951). All 134 browser checks, strict code/contract gates, ABI identity and both performance budgets pass.
- Public-hosted browser suite: 134 passed, six duplicate visual skips, zero failures; 42 reviewed images match. Ten pages and liveness return 200. Readiness and lookup return the expected 503.
- Runtime error scan: zero entries during smoke. No external alerting/drain is configured. Local three-run performance medians: mobile 99/100/100/100, desktop 100/100/100/100; not field INP.

This publishes the website interface. Live verification/registration remains unavailable until a dedicated Sepolia RPC, matching new contract manifest, Redis quotas and Pinata storage are configured. Human-approved registration/checkpoint evidence, physical wallet/camera/print checks, screen-reader/zoom review and independent contract security review remain outstanding. Existing immutable contracts do not inherit these source fixes. Financial functionality remains excluded. [Publication evidence](audit-evidence/release-2026-10-08/publication-summary.json).

Production `APP_ORIGIN` is set to the verified HTTPS website origin for subsequent production builds. Other live-service credentials remain absent. Follow the same scoped service configuration for previews; do not enable writes until the active manifest and dependencies validate. The hosted browser fixture suite proves rendering and behavior across the deployed boundary, while the separate unmocked HTTP smoke confirms liveness and deliberate dependency unavailability.
