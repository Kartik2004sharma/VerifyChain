# Implementation progress and acceptance ledger

Foundation executed 4 October and UI recreation verified 5 October 2026 on `codex/verifychain-release`, against the working changes based on `59ae343b830b33239becf7814d93fa815a46123d`. The application revision `45d2bb8` is published and independently verified in GitHub CI; the website is public on Vercel. Later publication documentation does not change the tested application. Runtime: Node 24.19.0/npm 11, macOS arm64, Next 15.5.27, pinned Playwright 1.58.2. All local commands use RTK per workspace instructions. [Latest source fingerprint and per-file hashes](audit-evidence/redesign-2026-10-05/source-revision.json) identify the exact tested working source; the base commit alone does not describe these changes.

The master prompt, original audit and 53 acceptance requirements drove the implementation. **A scoped pass establishes only its named check, not complete live integration acceptance.** Partial rows retain device, live-service, independent review or human-signature requirements. Blocked rows have no external proof. Browser service/wallet fixtures are explicitly test-only; local Solidity integration is not public Sepolia. The active manifest deliberately contains no deployed addresses.

## Evidence and repair loop

1. Foundation: replaced mixed lockfiles/providers and broken lint/build gates; pinned a supported runtime and compatible patched dependencies, removed unused integrations, generated source ABIs/identity. Clean installation and strict gates retained; dependency debt documented separately.
2. Domain/contracts: replaced fabricated verdicts/receipts with typed evidence; repaired authorization, metadata commitment, batch counts, observation averages, checkpoint rules and escrow accounting. Unit, actual Hardhat and local application reads check positive and negative cases. Financial UI/deployment remains quarantined.
3. Browser/interaction: built original paper/mint passport UI, public lookup, coherent injected-wallet state, metadata review/upload, bounded transaction recovery, QR, checkpoints, real scoped records/export and preferences. Focused tests exposed fixture/selection and fresh-block issues; fixes retained actual assertions. Final complete suite follows focused checks. Added Safari checks revealed permission prompts can remain pending and native default Tab omits links. The camera-denial fixture now replaces the stable mediaDevices API boundary explicitly (its installation is asserted), and Safari exercises Option–Tab. Intermediate failures are retained, not skipped.
4. Visual review: initial candidates exposed a fixed offscreen skip-link screenshot artifact. Clipping until focus fixes visibility without losing the keyboard link. Reviewed passport-region baselines include the complete verdict/evidence area; obsolete unapproved full-page candidates retained in `audit-evidence/visual-candidates`. No masked verdict, relaxed budget or blanket baseline regeneration.
5. Production security/performance: Lighthouse exposed missing theme-bootstrap nonce under CSP. Passed the per-request nonce through the theme provider and rebuilt before final verification. Previous failed reports remain retained. No unsafe script bypass or lowered Lighthouse threshold was used.

Latest publication evidence: clean installation and the strict quality pipeline pass (42 unit/API, 20 Solidity and 5 actual local-chain integration tests, lint, types and production build). Independent GitHub CI succeeds for `45d2bb8`, including all 134 browser checks, 42 unchanged visual baselines and both three-run performance budgets. The public website also passes all 134 browser checks, with six deliberate duplicate visual skips. Local Lighthouse medians are 99/100/100/100 mobile and 100/100/100/100 desktop. Production dependencies have 23 moderate and no high/critical findings after the source-map-js patch. The current ledger reconciles to **30 scoped passes, 21 partial and 2 blocked**. [Publication summary](audit-evidence/release-2026-10-08/publication-summary.json). Earlier failures and dated progress notes remain historical evidence.

## Current 53 requirements — 8 October 2026

| ID | Result | Actual scope / remaining check | Evidence |
| --- | --- | --- | --- |
| A01 | Pass | Independent clean GitHub checkout and npm installation succeed for the published application revision. | [CI](audit-evidence/release-2026-10-08/ci-final-status.json) |
| A02 | Pass | Strict local gate passes. | [Evidence](audit-evidence/full-quality-verified.txt) |
| A03 | Pass | Strict local gate passes. | [Evidence](audit-evidence/full-quality-verified.txt) |
| A04 | Partial | Current source ABIs/code identity generated; active deployed manifest intentionally empty. | [Evidence](audit-evidence/full-quality-verified.txt) |
| A05 | Partial | Injected connection/switch/disconnect browser and attempt/account unit coverage; physical wallet account-change smoke pending. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| A06 | Pass | Wrong-chain writes blocked; rejected switch retains values. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| A07 | Partial | Production has no high/critical findings; 23 moderate plus isolated toolchain advisories remain documented for independent review. | [Evidence](DEPENDENCY_REVIEW.md) |
| V01 | Pass | Real local Solidity public reads plus disconnected fixture browser coverage. | [Evidence](audit-evidence/full-quality-verified.txt) |
| V02 | Pass | Revoked state covered in Solidity/local read and browser. | [Evidence](audit-evidence/full-quality-verified.txt) |
| V03 | Pass | No product/registrant invented for unknown IDs. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| V04 | Pass | Unavailable state on dependencies failing; retry remains available. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| V05 | Pass | Canonical bytes/hash mismatch remains visible. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| V06 | Pass | Unavailable metadata preserves record evidence. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| V07 | Pass | Self-registered identity and current manufacturer activation separated. | [Evidence](audit-evidence/full-quality-verified.txt) |
| V08 | Pass | Fresh current-block snapshot; reorg and revocation integration passes. | [Evidence](audit-evidence/full-quality-verified.txt) |
| V09 | Pass | Bounded UTF-8/JSON/address validation; no internal error exposure. | [Evidence](../tests/unit/security.test.ts) |
| V10 | Partial | Shared Redis quota/replay design and fail-closed tests pass; distributed hosted behavior awaits configured Redis. | [Evidence](../tests/unit/security.test.ts) |
| R01 | Partial | Canonical upload/hash fixtures pass; real Pinata retrieval and signed hosted upload pending. | [Evidence](audit-evidence/full-quality-verified.txt) |
| R02 | Partial | Receipt/event hook and local Solidity integration pass; user-signed browser registration pending. | [Evidence](../tests/unit/transaction.test.ts) |
| R03 | Partial | Rejected/reverted hook paths and rejected browser switch pass; real wallet write rejection pending. | [Evidence](../tests/unit/transaction.test.ts) |
| R04 | Partial | Duplicate/replacement/uncertain recovery tests pass; physical wallet delayed receipt smoke pending. | [Evidence](../tests/unit/transaction.test.ts) |
| R05 | Partial | Attempt/account reset tests pass; real signed register-again browser journey pending. | [Evidence](../tests/unit/transaction.test.ts) |
| R06 | Partial | Nonce/expiry/replay/size/auth tests pass; production storage secrets and distributed quota smoke pending. | [Evidence](../tests/unit/security.test.ts) |
| R07 | Pass | Single/batch counts, limits, atomicity and duplicate restrictions pass. | [Evidence](audit-evidence/full-quality-verified.txt) |
| Q01 | Partial | QR/legacy/Unicode origin journey passes locally; hosted origin not yet available. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| Q02 | Partial | Denied camera and manual fallback browser pass; supported camera hardware/accepted permission cleanup pending. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| Q03 | Pass | Trusted URL parsing and duplicate scanner guard; malformed/foreign URL tests. | [Evidence](../tests/unit/domain.test.ts) |
| Q04 | Partial | Generated PNG QR decodes in test; physical printed label/device scan pending. | [Evidence](../tests/unit/qr.test.ts) |
| C01 | Pass | Authorized commitment/URI update and revoke invariants pass. | [Evidence](audit-evidence/full-quality-verified.txt) |
| C02 | Pass | Mixed single/batch observation statistics reconcile; opinion labels explicit. | [Evidence](audit-evidence/full-quality-verified.txt) |
| C03 | Pass | Handler revocation/sequence/hash continuity/product isolation pass. | [Evidence](audit-evidence/full-quality-verified.txt) |
| C04 | Partial | Single-claim/accounting tests pass; financial feature quarantined pending independent review and must not be deployed. | [Evidence](../test/contracts.js) |
| C05 | Partial | Funding/refund/cancellation/failed-recipient tests pass; escrow remains quarantined pending independent review. | [Evidence](../test/contracts.js) |
| C06 | Pass | Known-block indexed topic matched to original ID; dedupe and snapshot/revert test. No persistent general-purpose index claimed. | [Evidence](audit-evidence/full-quality-verified.txt) |
| D01 | Partial | Typed checkpoint local integration passes; actual user-signed hosted checkpoint pending. | [Evidence](audit-evidence/full-quality-verified.txt) |
| D02 | Pass | Actual scoped filtering/aggregation with negative fixture assertions. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| D03 | Pass | Formula-safe CSV, evidence-limited JSON/PDF; no invented proof fields. | [Evidence](../tests/unit/domain.test.ts) |
| D04 | Pass | Theme/compact preferences persist across reload. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| U01 | Pass | All ten routes across four widths/WebKit, with 320px fallback. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| U02 | Partial | Keyboard evidence/skip link/navigation checks pass; full manual screen-reader/focus audit pending. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| U03 | Partial | Light/dark axe and responsive checks pass; manual 200% browser zoom and WCAG review pending. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| U04 | Pass | Reduced-motion journey works. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| U05 | Partial | Critical route/verdict/drawer baselines reviewed; connected upload/receipt-stage visuals await configured signed journey. Final unchanged comparison recorded. | [Evidence](VISUAL_REVIEW.md) |
| U06 | Pass | Working lookup/CTAs and accurate testnet/trust labels. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| U07 | Pass | Specific state notices/retry with no alert/reload writes. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| U08 | Pass | Page and console error gates; expected mocked readiness 503 is narrowly allowed. | [Evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt) |
| P01 | Pass | 8 October three-run mobile performance 99 and desktop 100 pass unchanged budgets. Other category medians are 100 on both; earlier failed reports remain retained. | [Evidence](audit-evidence/release-2026-10-08/performance-summary.json) |
| S01 | Partial | Production nonce CSP/browser headers pass locally; HTTPS hosted RPC/storage/camera boundaries need smoke checks. | [Evidence](../tests/unit/security.test.ts) |
| E01 | Pass | Independent CI succeeds for 45d2bb8: strict quality, ABI consistency, 134 browser checks and both three-run performance budgets; actual artifacts retained by GitHub. | [CI](audit-evidence/release-2026-10-08/ci-final-status.json) |
| E02 | Partial | Public HTTPS website, direct routes/refresh, responsive browser and security-header smoke pass. Live no-wallet records still need source-matching contracts, RPC and Redis; upload services remain unconfigured. | [Hosted evidence](audit-evidence/release-2026-10-08/public-hosted-smoke.json) |
| E03 | Blocked | Dedicated HTTPS Sepolia RPC and new source-matching deployments absent. | [Evidence](RELEASE_HANDOFF.md) |
| E04 | Blocked | User-signed Sepolia registrations/checkpoints not performed. | [Evidence](RELEASE_HANDOFF.md) |
| E05 | Pass | Verified public URL, truthful feature status, configuration guide, actual CI/hosted evidence, remaining blockers and rollback limits are documented. | [Handoff](RELEASE_HANDOFF.md) |

## Release blockers and decisions

No `.env.local` or required live-service environment settings exist. Production fails closed until RPC, a source-matching three-contract manifest, Pinata, upload authorization secret, shared Redis and exact hosted origin are configured privately. Historic immutable deployments do not inherit source fixes. Deployment keys must never enter hosting or logs.

No public deployment, push, PR, funded transaction or wallet signature was performed. [Release handoff](RELEASE_HANDOFF.md) contains concrete external steps, configuration scopes and rollback limits. Real camera/print, manual screen-reader/200% zoom, physical wallet journeys and independent CI/security review must remain explicit release gates.

Scope decisions: injected wallets only; signed JSON metadata only; no mainnet, brand certification, financial actions, billing, AI authenticity or general-purpose indexer. Known product IDs use bounded current-state reads and known-block receipts; an unavailable receipt stays unavailable.

## Limits of automated evidence

Slither is not installed, so contract static analysis is unavailable; Solidity tests do not replace it or an independent security review. Lighthouse measures the local landing page under synthetic conditions, not field INP or an entire signed wallet journey. Browser service and wallet fixtures cannot prove Pinata, Redis, hosted RPC or physical wallet behavior. Registration details, canonical metadata review and public verdict images are baselined; connected upload/receipt stages need review with the configured workflow. Browser traces/reports are retained locally and CI uploads its own reports when independently run.

Earlier local preview: `http://127.0.0.1:3100/` served the production build. Landing/public lookup/liveness return 200; readiness intentionally returns 503. [Preview smoke evidence](audit-evidence/local-preview-smoke.json). `git diff --check` exits 0. The refreshed preview uses port 3310; no public URL is claimed.

## UI recreation — 5 October 2026

At the owner’s request, the public identity and workspace composition were rebuilt again. See [design rationale](UI_REDESIGN.md). New source has original parcel artwork, ink/cobalt/citrus identity, horizontal desktop navigation, header appearance controls, a verification studio that yields to results, a dashboard lookup and guided registration with an explanatory companion. Verdicts retain distinct truthful labels with neutral unknown/outage and amber mismatch styling.

`redesign-2026-10-05/quality-performance-repair.txt` exits 0 for the full strict quality pipeline (42 unit/API, 20 contract, 5 local-chain tests and build). The final presentation refinements also pass production build/lint/types in `build-final.txt`; formatting passes. First browser run: 125 passed, five failures from a settings locator matching the new appearance button. Named combobox selection fixes the root cause; five focused checks pass. Prior traces and candidate iterations are preserved.

42 reviewed candidates replace the intentionally superseded visual identity after inspection; the former 38 baselines remain archived. Final full browser exits 0: **134 passed, 6 deliberate duplicate visual skips, 0 failures**; four visual checks compare 42 reviewed images with the unchanged pixel cap. [Latest browser evidence](audit-evidence/redesign-2026-10-05/browser-provider-final.txt). Three-run performance results follow in the dated directory. [Latest source fingerprint](audit-evidence/redesign-2026-10-05/source-revision.json) identifies the tested working source. This refresh does not change the five external release blockers or satisfy unexecuted live/device checks.

Performance repair: the first refreshed mobile profile failed at 83 median (90/83/74), while accessibility, best-practices and SEO scored 100. The failure is retained. Public branding/theme are now separate from workspace wallet/query initialization, reducing measured initial landing JavaScript from 120 KB to 109 KB. Full strict quality pipeline exits 0 after this repair; ten focused appearance/wallet tests pass, including connected identity across route navigation. Final repeated browser/performance evidence is retained separately. No budget or visual comparison standard was lowered.

Latest full browser repeat after the provider change exits 0: **134 passed, 6 deliberate duplicate visual skips, 0 failures**. Formatting also exits 0 in `format-provider-final.txt`. The prior full browser run is retained separately.

Final refreshed three-run performance medians: mobile **88/100/100/100** (exit 1); desktop **100/100/100/100** (exit 0). The mobile budget remains 90. The first failed 83 median and the new 78/91/88 runs are retained. Mobile median LCP is 2.51 s, CLS 0 and TBT 407 ms; these are local synthetic metrics with observed background browser load, not field performance. P01 is partial, so the ledger reconciles to **26 local passes, 22 partial and 5 blocked**. No application source changed after the final source fingerprint and full browser run.

Refreshed local production preview is running at `http://127.0.0.1:3310/`. Landing, verification and liveness return 200; readiness returns the expected 503 until live services and matching deployments are configured. [Current preview smoke](audit-evidence/redesign-2026-10-05/local-preview-smoke.json) verifies all 80 tested source hashes remain unchanged. All 42 accepted image hashes also match their inspection manifest. No deployment or signed transaction was performed.

## Pre-publication verification — 8 October 2026

Owner authorized GitHub publication and website deployment. Clean installation, strict quality pipeline and 134 browser checks pass; 42 inspected screenshot baselines match. The high-severity source-map-js advisory was patched to 1.2.2; production audit has 23 moderate and no high/critical findings. Latest three-run Lighthouse medians are **99/100/100/100 mobile** and **100/100/100/100 desktop**, passing unchanged budgets. P01 is locally passed again, bringing the current ledger to **27 local passes, 21 partial, 5 blocked** before independent CI and hosting verification. Earlier dated failures are historical evidence, not erased. Formatting-only corrections in the local integration test preserve its assertions. Raw generated audit outputs retain their whitespace; source diff checks exclude that evidence directory. See `audit-evidence/release-2026-10-08/preflight-summary.json`.

## Website publication — 8 October 2026

[Public website](https://verifychain-murex.vercel.app) is verified without login. All ten public routes and liveness return 200; readiness and lookup correctly return 503 with unconfigured dependencies. All **134 public-hosted browser checks pass**, including the 42 reviewed visual baselines; six duplicate visual cases intentionally skip. The first CI failure was a Safari keyboard-test mismatch; the stronger Option–Tab/exact-link repair passes locally and in independent CI, with no application UI or baseline changes. The production runtime error scan is empty during these checks. No external alerting is configured.

GitHub main is updated without rewriting history. CI verifies application revision `45d2bb8`; the initially staged application has identical runtime source (the difference is the keyboard test and documentation). Publication-only documentation updates preserve all application/test hashes. No Sepolia contracts or user-approved public-chain transactions were created. The two blocked requirements are E03 and E04; the remaining partial rows still require real services, physical wallets/devices or independent review.
