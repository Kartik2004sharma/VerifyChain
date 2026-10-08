# VerifyChain project audit

Reviewed 4 October 2026. Repository: `/Users/kartik/CS50x2025/Projects/VerifyChain`; Git remote identifies `Kartik2004sharma/VerifyChain`.

## Decision

**The project is not ready for public release.** It has useful Solidity and frontend foundations, but the user-facing verdicts can overstate authenticity, metadata is not actually persisted, dependency installation is not reproducible, and several workflows remain simulated or incomplete. Improve correctness and evidence first, then apply the AgentPay-inspired redesign and validate a hosted Sepolia release.

The intended deliverable is a real testnet product-registration and verification application with an excellent public verification journey. It should clearly distinguish registration, identity claims, metadata integrity, revocation, supply-chain observations and physical-item authenticity.

## Scope and evidence limits

The review inventoried 105 text source files, approximately 23,498 lines, across `app`, `components`, `contexts`, `hooks`, `lib`, `contracts` and `scripts`, plus package/configuration files, README, deployment manifests and the public asset inventory. It traced all ten page routes and the single API route, both hook families, both wallet contexts, the provider hierarchy, four current Solidity contracts, the old supply-chain source, deployment scripts, generated ABIs and shared UI components. Review depth focused on active behaviors and trust boundaries; dead code and UI primitives were surveyed through imports/exports, interaction and accessibility patterns.

AgentPay's current local `FRONTEND.md`, `landing.module.css`, `live-workspace.module.css` and shared styles were inspected as the user's chosen visual reference. This is source-based design analysis, not a screenshot comparison or visual approval.

No user-wallet signatures, public-chain funded transactions, public-chain contract deployments or public hosting were performed. Contract reproductions used an isolated ephemeral Hardhat chain and synthetic test ETH. The public RPC fallback returned an HTML 404 rather than JSON-RPC during a read-only probe, so existing addresses have **not** been independently verified against current chain bytecode. This does not establish that the contracts are absent.

The application source and committed lockfiles were left unchanged. Existing untracked `.serena` material was preserved. Only audit/prompt documents and local verification artifacts were added; dependency/build/contract tools also generated ignored local files.

## Executed checks

| Check | Result | Interpretation |
| --- | --- | --- |
| `rtk npm ci --ignore-scripts --no-audit --no-fund` | Failed | Committed lockfile lacks required platform/optional dependency entries; fresh installs are not reproducible. |
| `rtk npm install --ignore-scripts --package-lock=false --no-audit --no-fund` | Completed | Exploratory dependency resolution only; no tracked lockfile edits. It resolves newer packages allowed by manifest ranges, so subsequent results are not proof of the locked dependency graph. |
| `rtk proxy ./node_modules/.bin/tsc --noEmit --incremental false` | Failed, 19 diagnostics | Missing modules/exports, divergent result models, chart typing and leftover bridge interfaces. [Output](audit-evidence/typecheck.txt). |
| `rtk npm run lint` | Failed, 93 errors and 15 warnings | Current `next lint` works with this installed Next 15.3.2 but finds actual violations. Replace with ESLint CLI as part of the framework upgrade, not because this command was missing. [Output](audit-evidence/lint.txt). |
| `rtk npm run build` | Failed | Exploratory dependency graph has unresolved `@x402` imports via Coinbase/base-account/wagmi connectors. Fix compatible dependency resolution before concluding what the intended locked build does. [Output](audit-evidence/build.txt). |
| `rtk proxy ./node_modules/.bin/hardhat compile` | Passed | Eight Solidity files, including dependencies, compiled. Hardhat warns that the host's Node 25.9.0 is unsupported. Compilation is not a security audit. [Output](audit-evidence/contracts.txt). |
| `rtk proxy ./node_modules/.bin/hardhat test` | Zero tests | Command exits successfully with `0 passing`; no test coverage is established. [Output](audit-evidence/contract-tests.txt). |
| Isolated local contract reproduction | Three defects reproduced | Two products register while global count remains zero; a winning voter claims twice; an incorrect voter receives two refunds while pool accounting remains overstated. [Results](audit-evidence/local-contract-reproduction.json). |
| `rtk proxy npm audit --json` against committed lockfile | 140 affected-package findings | 7 critical, 56 high, 62 moderate, 15 low. Counts include transitive and development packages and do not establish 140 exploitable application bugs. [Summary](audit-evidence/baseline.md). |
| Read-only JSON-RPC fallback probe | Unverified | `https://rpc.sepolia.org` returned HTML 404 for chain/code request. A configured working provider is required. |
| Playwright, visual comparison, axe, Lighthouse, hosted acceptance | Not executed | No existing suite; production build failed. The master prompt defines these gates for implementation. |

Exploratory installed versions included Next 15.3.2, React 19.3.0, wagmi 2.19.5, viem 2.57.2, Hardhat 2.29.1 and Recharts 2.15.4. The committed lockfile instead records React/RSC 19.1.1, wagmi 2.15.6 and other older resolutions. Preserve this distinction when reproducing diagnostics.

## Release blockers

P0 means a blocker for exposing the affected feature in a release. Source findings are not claims that an exploit was executed on a deployed contract.

| ID | Priority | Evidence | Gap and required correction |
| --- | --- | --- | --- |
| G01 | P0 | `package-lock.json`; clean-install check | Repair reproducible installs, choose one package manager, pin a supported Node version and reproduce in CI. Both npm and Yarn lockfiles currently exist. |
| G02 | P0 | `package.json`; locked Next 15.3.2 and RSC 19.1.1 | Known framework security advisories apply to these old release lines; review and upgrade to currently patched compatible releases. Remove unused SDKs and assess actual reachable advisories. |
| G03 | P0 | `next.config.ts:4`; diagnostic outputs | `ignoreBuildErrors` and `ignoreDuringBuilds` bypass quality gates; Strict Mode is off. Fix diagnostics and enable real gates. |
| G04 | P0 | `lib/blockchain-verification.ts:151` | Any existing product is declared authentic with 95% confidence; `getProduct`'s revocation flag is ignored. The contract itself self-registers manufacturers and initially marks products verified. Registration does not prove brand authority or physical authenticity. |
| G05 | P0 | `lib/blockchain-verification.ts:100`; `lib/mock-blockchain-data.ts` | Unregistered live lookups fall back to demo data. Simulated output still calls itself blockchain verification. Remove this fallback or isolate a clearly separate sample mode. |
| G06 | P0 | `lib/blockchain-verification.ts:183` | Registered results fabricate gas, confirmations and validity booleans, use a zero receipt hash and do not verify metadata/signatures. Render only observed evidence; unknown fields remain unavailable. |
| G07 | P0 | `hooks/useProductRegistry.ts:229`; `app/dashboard/register-product/page.tsx:342` | Page calculates a metadata hash but the single-product hook replaces it with truncated description bytes using `Buffer`. Preview/URI/contract commitment disagree; equal description prefixes can collide. Use canonical metadata and one cryptographic commitment. |
| G08 | P0 | `app/dashboard/register-product/page.tsx:327` and `:364` | `ipfs://hash/<hash>` is not a real uploaded CID. Images/metadata are not durably retrievable. Implement protected server-only persistence and round-trip integrity verification. |
| G09 | P0 | `hooks/blockchain/useProductRegistry.ts:100`; verification/supply-chain write hooks | Several functions await wagmi's non-Promise `writeContract` mutation and return success before receipt confirmation. Failures are not caught through this apparent await. Use async mutation plus attempt-bound receipt states. |
| G10 | P0 | `app/layout.tsx:49`; `components/ConnectWallet.tsx:5`; `components/CustomConnectButton.tsx:3` | Two independent wallet systems are mounted. Page gating uses wagmi while several connect buttons use ethers context. A connect action may not update the state the page checks. Consolidate providers/state and test account/chain changes. |
| G11 | P0 | `.env.example:7`; `lib/wagmi-config.ts:53`; root hooks | WalletConnect spelling differs. Address sources/precedence also differ: JSON, unprefixed variables, Sepolia-prefixed variables and malformed fallback addresses. Validate one chain-specific configuration source. |
| G12 | P0 | `hooks/useSupplyChainTracker.ts:12`; `hooks/useVerificationRegistry.ts:12` | Handwritten ABIs reference methods/numeric IDs absent from current source. Current shared ABI family largely matches source; consolidate on generated artifacts and verify the actual deployed interface. |
| G13 | P0 for financial feature | `contracts/CounterfeitReporter.sol:178` and `:219` | Voter rewards/refunds read unchanged vote stakes and lack a consumed-claim guard. A qualifying caller can repeat withdrawals while funds remain. Refunds also do not reconcile rewardPool. Fix/test liabilities before enabling; keep outside first release. |
| G14 | P0 | `scripts/deploy-verification.js:63`; `scripts/deploy.js:10`; README | Main deployment script names nonexistent `SupplyChainTrackerForCounterfeit`; README's script deploys absent CardFi mock contracts. Create one working VerifyChain-specific flow. |
| G15 | P0 | `deployments/sepolia-1762501020791.json`; `lib/contracts/addresses.json` | ProductRegistry and SupplyChainTracker addresses disagree between manifest and runtime JSON. Manifest has no deployment hashes/blocks/bytecode identity. Verify provenance instead of assuming README deployment claims. |

Framework claims above are supported by the official [Next.js security advisory](https://nextjs.org/blog/security-update-2025-12-11) and [React RSC advisory](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components). These establish that the pinned releases need remediation; they are not a complete October 2026 advisory inventory or a recommendation to stop at the historical minimum fix.

The local contract reproduction strengthened G13 and G19 beyond static findings: the same winning voter received two successful claim receipts, draining 0.012 synthetic ETH; an incorrect voter received two successful refunds totaling 0.005 synthetic ETH, leaving reported rewardPool at 0.025 against an actual balance of 0.020. The batch test registered two records and reported manufacturer count 2 while global count remained 0. These results concern the checked-in compiled source on a local chain; compatibility with existing public addresses remains unverified.

## Workflow and data gaps

| ID | Priority | Evidence | Gap and required correction |
| --- | --- | --- | --- |
| G16 | P1 | `app/dashboard/verify-product/page.tsx:103` | Consumer lookup requires wallet and automatically records an on-chain observation, then schedules a reload after one second. Separate public reads from optional signed writes and refetch after confirmation. |
| G17 | P1 | `app/dashboard/verify-product/page.tsx:153`; registration page QR URL | Camera scanner is an alert placeholder. Generated `?id=` links are not consumed by the verification page. Implement public deep links, scanner cleanup/permission states and manual fallback. |
| G18 | P1 | `app/dashboard/supply-chain/page.tsx:293` | On-chain checkpoint conversion returns `[]`; mock products are mixed with real data; a metadata hash is used as a transaction hash; revocation flag is mapped to delivery state. Implement actual typed checkpoint/receipt mapping. |
| G19 | P1 | `contracts/ProductRegistry.sol:252` | Batch registration never increments `_productCounter`; validation is weaker than single registration. Add count reconciliation and single/batch parity tests. |
| G20 | P1 | `contracts/ProductRegistry.sol:311` | Updating metadata URI leaves dataHash unchanged. Define immutable/versioned metadata semantics and verify them. |
| G21 | P1 | `contracts/VerificationRegistry.sol:103` and `:178` | Anybody may submit arbitrary authenticity scores/results. Batch omits average-confidence updates and empty-ID parity. Treat records as submitted observations and reconcile statistics. |
| G22 | P1 | `contracts/SupplyChainTracker.sol:104` and `:144` | Global authorized handlers can write checkpoints for products without ProductRegistry existence/ownership checks. Integrity checks prove limited sequence consistency, not physical custody. Document the model or specify a stronger tested authorization model. |
| G23 | P1 | `app/dashboard/page.tsx:79`; indexed string events | Event consumers treat indexed string topics as recoverable product IDs. Decode/reconcile IDs properly; current last-10,000-block reads are not complete historical indexing. |
| G24 | P1 | `app/dashboard/analytics/page.tsx:99`; `verification-analytics/page.tsx:36` | Trends, categories, hotspots and detection statistics are fixed examples; date filters do not establish real indexed data. Implement bounded data derivation or remove/labeled sample views. |
| G25 | P1 | `app/dashboard/settings/page.tsx:70` | Save waits for a timer; settings are neither persisted nor connected to actual services. Keep useful persistent preferences and remove unsupported settings. |
| G26 | P1 | `hooks/verification/useProductVerification.ts:142` | History/stats/exists endpoints are referenced but absent. Implement coherently or remove dead consumers. Batch hook can skip failures then toast “All products” verified. Report partial results correctly. |
| G27 | P1 | `app/api/blockchain/verify/route.ts:5`; verification service imports | Instance-local rate limiter/caches are not shared on serverless hosting. Client page bypasses the API. Health reports only `ok`. Separate server/client read boundary, validate schemas, body limits, trusted IPs, timeouts and readiness. |
| G28 | P1 | `lib/blockchain-verification.ts:51` and `:221` | Cache uses product ID alone and stores verifier identity; retry wrapper cannot retry swallowed exceptions. Use scoped bounded caches and explicit retryable failures. |
| G29 | P1 | `lib/blockchain-verification.ts:350`; result components | Certificates claim AUTHENTIC/COUNTERFEIT and invent expiry/hash semantics. Export accurate evidence summaries; use safe CSV quoting/formula handling in history exports. |
| G30 | P1 | project inventory | No test directory, Playwright configuration, CI workflow or executable release checker exists. Contract compilation alone cannot establish functional/security readiness. |

## UI/UX gaps

| ID | Priority | Evidence | Gap and improvement |
| --- | --- | --- | --- |
| U01 | P1 | `components/navigation.tsx:83` | Seven dashboard links sit in a non-responsive horizontal row. Implement desktop sidebar and accessible mobile drawer with every route reachable. |
| U02 | P1 | dashboard status panel | “Connected,” “Deployed,” “Active” and “Operational” are static green badges, even when reads fail. Show measured readiness and useful recovery actions. |
| U03 | P1 | landing/pricing/testimonial components | Invented endorsements, 50M+ products, 99.9% accuracy, unsupported paid plans, inert trials and AI claims undermine trust. Replace with product walkthrough and inspectable evidence. |
| U04 | P1 | `components/footer.tsx` | Footer still credits CardFi; legal links are `#`. Use original VerifyChain identity and working relevant content/links. |
| U05 | P1 | `components/ui/use-toast.tsx:141`; provider hierarchy | Alerts interrupt workflows; several toast implementations and two QueryClient providers coexist. Consolidate notifications and query state. |
| U06 | P1 | labels/copy buttons/result modal/slider | Several controls lack associated labels or accessible names; custom modal needs focus/keyboard semantics; slider cannot forward naming props to the actual range input. Require axe plus manual keyboard and screen-reader checks. |
| U07 | P2 | `app/page.tsx`; `app/dashboard/layout.tsx`; global styles | Hardcoded black backgrounds conflict with light tokens; nested page/main shells and repetitive large cards dilute hierarchy. Apply a coherent theme and one shell/landmark structure. |
| U08 | P2 | animated text, hero, marquee and transitions | Long decorative entrance sequences and infinite scrolling lack a consistent reduced-motion contract. Use restrained state feedback and deterministic visual tests. |
| U09 | P2 | asset/unused-component inventory | CardFi yields/bridge/IP remnants, empty files and missing imports increase maintenance and dependency load. Remove only after checking reachability; do not silently erase a required feature to satisfy tests. |

## Recommended design and release path

Use AgentPay's warm paper canvas, dark ink, mint actions, editorial headline hierarchy, fine structural rules and evidence chronology. Adapt that into a VerifyChain **Product Passport**, not a payment dashboard. Let visitors verify publicly in the first viewport. Make proof details expandable, keep the verdict precise, and use a sidebar/drawer for daily manufacturer workflows.

The implementation order is:

1. Reproducible dependencies, patched framework, real build/type/lint gates, coherent wallet/config/ABI boundary.
2. Accurate public lookup, real canonical metadata, receipt-based registration, working QR return journey.
3. Contract accounting/provenance and actual supply-chain/history behavior; financial voting stays quarantined.
4. Shared design system and all-route redesign, including error/empty/loading/mobile states.
5. Playwright, local-chain integration, accessibility, visual review, CI and performance validation.
6. Vercel preview, real configuration/readiness checks, user-approved transaction evidence and verified production handoff.

Use [the master build prompt](VERIFYCHAIN_MASTER_BUILD_PROMPT.md) and [the acceptance matrix](QA_ACCEPTANCE_MATRIX.md). Tooling recommendations are Playwright, axe, Hardhat, a small domain test runner, Lighthouse CI and contract static analysis. Additional generator plugins are optional; verified workflows are the release criterion.

## Implementation follow-through — 4 October 2026

This audit describes the original inspected revision. The local rebuild now addresses its source findings with strict gates, typed real-chain reads, canonical metadata, signed uploads, contract repairs, coherent wallet state and reviewed responsive UI. Historical source line pointers above are preserved as baseline evidence and may no longer point to current code. See [the 53-row implementation ledger](IMPLEMENTATION_PROGRESS.md) for current bounded results. Public hosting, new Sepolia deployment/receipts, independent CI/security review and physical-device acceptance remain open; the audit is not a deployment certificate.
