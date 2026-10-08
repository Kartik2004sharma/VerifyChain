# VerifyChain: implementation and deployment master prompt

Prepared 4 October 2026. This is an implementation contract, not evidence that the work below has passed. Read `PROJECT_AUDIT.md` and `QA_ACCEPTANCE_MATRIX.md` beside this file first.

## Copy everything below into the implementation chat

You are improving the existing VerifyChain repository into a deployable, accurate Ethereum Sepolia product-registration and verification application. Work in the existing project; implement the real workflows and an excellent UI. Carry the work through implementation, validation, and a concrete deployment handoff. Do not finish after producing another plan.

Read the workspace instructions, including `/Users/kartik/.codex/RTK.md`, and inspect Git status before editing. Preserve unrelated changes, including `.serena/README.md`. Use small, coherent changes. Do not overwrite existing deployment addresses or publish transactions as a routine cleanup step.

### 1. Product outcome and scope

A consumer opens a QR link or enters a product ID without connecting a wallet. The app reads the configured chain and presents a Product Passport: registration status, revocation status, registrant identity and its trust level, metadata integrity, available supply-chain records, and inspectable blockchain evidence. A manufacturer explicitly connects a wallet, registers metadata and a product, waits for a successful receipt, and downloads a QR label that opens the same passport. An authorized handler records checkpoints with accurate transaction states.

The first release is a hosted **Sepolia testnet application**. Hosting the web app in production does not make the blockchain network mainnet. Keep that disclosure next to the main actions and inside results and exports.

Treat on-chain registration as evidence of a record submitted by a wallet. Self-registration does not establish that a company is an authorized brand, and a copied QR code does not prove a physical item is genuine. Present these limits in concise user language. Do not claim AI detection, signature verification, GPS verification, certified manufacturer identity, or physical authenticity without implemented and independently testable evidence.

Keep scope focused: product registration, public verification, honest history/analytics, and authorized supply-chain checkpoints. Remove unused yield, bridging, IP-asset, and CardFi code after proving it is unused. Paid subscriptions, mainnet, voting rewards, and identity certification are outside the initial release. Quarantine the existing CounterfeitReporter financial interaction until its accounting is fixed and tested; a disabled UI alone does not repair a deployed contract. Document any existing deployment separately.

### 2. Prompting and engineering method

Use specification-first, evidence-first engineering:

1. Reconcile the audit against current source and create a short traceability map: requirement ID → code → test → evidence.
2. Establish a failing baseline. Separate source defects, environment failures, and missing credentials. Never treat an unavailable check as passed.
3. Write behavioral acceptance checks before changing the relevant domain behavior. Use negative cases as well as success paths.
4. Implement one complete vertical slice at a time: public lookup, registration, QR return journey, handler checkpoint, history/export.
5. Use deterministic tests and an independent CI run as the judge. Visual review complements tests and must inspect the actual rendered result.
6. Explain decisions with brief rationale and evidence; keep a compact progress ledger instead of repeating the full repository context.

Use a bounded repair loop per milestone, with at most five build–verify iterations:

```text
PLAN: choose the highest-impact failing acceptance IDs; define the bounded change.
BUILD: fix the root cause without changing the acceptance standard.
JUDGE: run focused checks, inspect the rendered state, save actual results.
PASS: run the full milestone gate and advance only if all required checks pass.
FAIL: record expected/actual behavior and evidence; return to PLAN.
STOP: after three failed fixes for the same root cause, or five milestone iterations,
      preserve the work and report the exact blocker and remaining independent work.
```

Do not delete, skip, relax, or snapshot-update a failing check merely to pass. Deliberate behavior changes require an explained specification change. Do not retry wallet writes, funded deployments, or uploads blindly. A visual baseline is approved after inspection, not automatically regenerated on every run. Keep human control over real wallet signatures, credentials, deployment spending, and final release decisions. No recurring automation is needed for this build loop.

Record each iteration in `docs/IMPLEMENTATION_PROGRESS.md`: requirement IDs, root cause, changed files, commands and exit codes, evidence paths, unresolved blockers, and next step. Keep secrets and private keys out of every log and artifact.

### 3. Milestone A — reproducible and secure foundation

- Repair the package manifest/lockfile relationship and use one documented package manager, preferably npm for this repository. Prove `npm ci` works in a fresh checkout on the supported Node LTS version; pin that version in the repository and CI.
- Select a currently supported, patched Next.js/React combination from official advisories and compatibility guidance. Update matching tooling and remove the direct RSC package if it is unnecessary. Do not use an old advisory's minimum patch as a current security guarantee. Review the dependency graph, especially unused wallet/bridge/storage SDKs.
- Replace the lint script with the installed ESLint CLI. Add `typecheck`, relevant test scripts, contract compile/test scripts, browser scripts, and a release check. Enable real lint/type build gates and React Strict Mode. Fix root causes; do not reduce strictness or exclude broken application files to hide errors.
- Consolidate the application into one wagmi/RainbowKit wallet state and one stable React Query client. Remove the independent ethers wallet state after migrating consumers. One connection must update every screen; account and chain changes must invalidate correctly scoped queries.
- Replace the Proxy-based SSR/client configuration split with a documented, SSR-safe wagmi configuration. Use a server-only viem public client for server reads; never import client wallet configuration into an API service.
- Create one chain-indexed deployment manifest and validated environment schema. Reconcile the conflicting address sources before choosing addresses. Include chain ID, contract addresses, deployment block, transaction hashes, source/compiler identity, and ABI provenance when available. Reject zero/malformed addresses and placeholder RPC URLs. Do not let hardcoded JSON silently defeat configuration overrides.
- Normalize the WalletConnect variable name; the checked-in example and wagmi config currently disagree. Keep deployment keys out of frontend hosting configuration. Public browser RPC identifiers must be treated as public and restricted by the provider where supported.
- Generate ABIs from compiled artifacts with a real checked-in export script. Remove the stale handwritten contract interfaces. Validate functions, argument types, output ordering, event signatures, and deployed bytecode against the chosen source.
- Configure image hosts explicitly, security headers, and a wallet-compatible CSP. Test RPC, wallet modals, storage gateways, camera use, and framework scripts under those policies. Do not disable protections globally to make one dependency work.

Gate A: clean install, dependency review, lint, typecheck, production build, and contract compilation pass. Configuration errors yield a useful unavailable state. Tests demonstrate a single wallet identity and correctly selected chain. Capture independent CI evidence.

### 4. Milestone B — trustworthy domain behavior

Use explicit, typed domain states. Avoid a single `isAuthentic` boolean as the whole product decision. Model at least `registered`, `not_found`, `revoked`, `integrity_mismatch`, `unavailable`, and `invalid_input`; carry independent metadata and manufacturer-trust states. Demo provenance, if retained, must be explicit and separate from all live routes.

Verification requirements:

- Read without wallet authorization on the supported chain. A lookup must never request a signature or automatically record a paid transaction.
- Check the product's revocation/verification flag and manufacturer's current active status. A missing product is “not found”; an RPC outage is “verification unavailable”; neither is a confirmed counterfeit verdict.
- Remove runtime mock fallback, hardcoded confidence percentages, random verifier addresses, synthetic gas values, fabricated confirmation counts, and zero transaction hashes presented as evidence. Unknown evidence stays null/unavailable and has no fake explorer link.
- Fetch canonical metadata from a real immutable URI. Compare its defined hash against the on-chain commitment. Treat unavailable metadata separately from mismatching metadata.
- Separate registration receipts from optional verification-recording receipts. Read-only checks do not have a transaction receipt. Resolve real registration event/receipt evidence when available; otherwise show the queried contract, chain, block context, and limited evidence honestly.
- Scope caches by chain, contract, product ID, and data version/block as appropriate. Do not cache caller identity inside a public result. Use bounded cache size, expiry, and invalidation after revocation/updates; do not silently serve stale verified results.
- Return predictable API statuses and schemas. Validate trimmed IDs, UTF-8 byte limits consistent with Solidity, address fields, body size, malformed JSON, and URL query values. Set RPC timeouts and bounded retries; preserve retryable failures instead of swallowing them into a false verdict.
- Implement or remove consumers of the missing history/stats/exists API routes. The current verification page bypasses the API limiter; route production lookups consistently through the chosen service boundary.
- If the public API needs abuse control, use a deployment-compatible limiter/provider control with tested trusted-IP handling; an in-memory map is insufficient across serverless instances. Health liveness and dependency readiness must be separate.

Registration and metadata requirements:

- Generate one stable product ID and freeze the exact metadata payload at review. Preview, upload, transaction, passport, and export must refer to that same data.
- Define versioned canonical serialization and one cryptographic hash algorithm. Remove truncated `Buffer` encoding of descriptions and pseudo `ipfs://hash/...` URIs.
- Implement server-only metadata/image upload using the chosen storage provider. Authenticate uploads with a scoped wallet challenge/signature, nonce, expiry, chain/origin binding, and replay protection. Validate MIME/content, size limits, authorization, quotas, and permitted fields. Never ship provider secrets to the browser.
- Store a real retrievable CID/URI and hash the agreed exact canonical bytes. Use fixtures proving the preview hash, persisted bytes, contract argument, and fetched metadata commitment agree. Preserve batch manifests so every registered ID remains discoverable.
- Build the write lifecycle as `idle → validating → awaiting_wallet → submitted → confirming → confirmed`, plus rejection, revert, timeout, replacement, and error states. Use the async mutation API and bind receipt state to the specific attempt/hash. A returned hash means submitted, not confirmed. Clear stale attempt state on reset/account/chain changes.
- Show success only after a successful receipt and expected event/readback. Refetch targeted queries; remove delayed full-page reloads. Prevent duplicate clicks and ambiguous resubmission after timeouts.
- Apply chain guards to every write. Wrong-network users get a visible switch action. Keep their form data when they reject a prompt or switch accounts.

QR and certificate requirements:

- Generate QR codes locally for a stable public URL, such as `/verify?id=<encoded-ID>`. Keep old dashboard links functional or redirect them with query parameters preserved. Read the query parameter and prefill the lookup.
- Implement the camera scanner with explicit permission, cleanup on close/unmount, duplicate-scan prevention, camera-not-found/denied states, and manual entry fallback. Permit only the agreed payload format and trusted origins; reject arbitrary URLs or executable schemes. Run camera checks under HTTPS on a real mobile device.
- Download a readable QR label with product ID and network disclosure. Verify it decodes to the intended URL after registration and after deployment.
- Export an evidence summary, not an unsupported authenticity guarantee. Use actual IDs, URI/hash, chain, timestamps, statuses, and available evidence. No invented expiry, gas, signature validity, or transaction hash. Escape CSV fields and neutralize spreadsheet formula injection.

Gate B: a consumer can perform a real read-only lookup; a locally tested wallet workflow registers retrievable metadata and a product; revoked/not-found/outage/mismatch states remain distinct; QR opens the same record; all evidence reconciles to actual data.

### 5. Milestone C — contract and provenance correctness

Keep Hardhat as the existing contract tool unless there is a demonstrated reason to migrate. Establish unit and invariant/property tests on an isolated local chain. Reconcile deployed contracts against source before assuming old addresses support changed code.

- ProductRegistry: fix batch global-count accounting, align single/batch input validation and authorization semantics, test duplicate IDs/hashes, empty values, length boundaries, deactivated manufacturers, and atomic batch reverts. Confirm global and manufacturer counts equal successful unique registrations.
- Define metadata update semantics: immutable commitment or an authorized versioned update of both URI and hash with coherent events. Updating only the URI must not silently invalidate the stated integrity model.
- VerificationRegistry: identify records as wallet-submitted observations unless contract authorization and attestation truly establish more. Test forged inputs and spam assumptions. Reconcile single and batch statistics, including the confidence calculation/rounding and batch empty-ID handling. Do not present arbitrary user-reported booleans as independently confirmed counterfeits.
- Events with an indexed string expose its topic hash, not recoverable original text. Do not display that hash as a product ID. Reconcile topics to known IDs/registrations or use a bounded, paginated read model. Index from the actual deployment block, persist cursors when needed, deduplicate by chain/transaction/log index, and handle reorgs and RPC range limits.
- SupplyChainTracker: use the actual string-ID checkpoint interface. Test handler authorization/revocation, completion rules, sequence/hash continuity, and cross-product isolation. Do not infer delivery from the product revocation flag. State that the current authorized-handler list is global; it does not establish exclusive per-product custody. Any stronger custody model needs an explicit specification and tests.
- CounterfeitReporter: before enabling any financial action, make each voter claim/refund one-use using state changes before transfer; reconcile per-report liabilities, rewardPool, outstanding stakes, refund paths, rewards and actual balance. Test repeat claims, repeat refunds, reporter/voter overlap, unanimous votes, insufficient bonus funding, cancellation, failed recipients/reentrancy, stalled insufficient-vote reports, and owner withdrawal effects. Scope control is preferred: keep this financial feature outside the initial release and document the unresolved deployed-contract risk.
- Repair deployment scripts: the README currently points at CardFi factories, and `deploy-verification.js` references a nonexistent factory. Create one VerifyChain-specific deploy/check/export flow; support only configured networks. Preserve deployment history and record real receipts and bytecode hashes.

Gate C: meaningful unit and invariant tests pass; ABI/source compatibility is verified; the chosen deployed contracts and exposed features match the audited release. Contract changes require a new deployment or a documented limited release; source fixes do not patch existing immutable contracts.

### 6. Milestone D — AgentPay-inspired UI/UX

Use AgentPay as a locally inspected visual reference, especially its current `src/app/landing.module.css`, `src/components/live-workspace.module.css`, and `FRONTEND.md` in `/Users/kartik/Downloads/AgentX`. Read its approved visual principles, but do not change that repository. Build an original VerifyChain identity and workflows. If the folder is unavailable, use the explicit design system below.

**Direction: an editorial product-verification workspace.** Calm, precise, and easy to inspect. The memorable object is a Product Passport showing what was checked and where the evidence came from.

Starting tokens, to be contrast-tested:

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#F4F5EF` | `#101714` |
| Surface | `#FCFDF8` | `#18241F` |
| Text | `#101714` | `#EEF4EF` |
| Muted text | `#58655D` | `#A8B9AE` |
| Border | `#CED5CE` | `#354B3F` |
| Primary action | `#B9F27C` with ink text | same |
| Registration/evidence emphasis | `#235B46` | `#B9F27C` |
| Pending/attention | `#8A4B10` | `#F7B955` |
| Revoked/error | `#B83B32` | `#FFB2A9` |

Use existing Geist for interface text and Geist Mono for IDs/evidence. Optionally use Instrument Serif for landing headlines only if the reference benefits are visible; do not add three new font families. Use a 4/8px spacing scale, 10–16px surface radii, restrained shadows, 44px primary touch targets, and readable 16px body text. Color always accompanies a textual state and icon. Validate contrast in all themes and states.

Landing:

- First viewport: clear thesis (“Check the record behind the product”), public ID lookup, primary “Verify a product,” secondary “Register a product,” and testnet disclosure.
- Asymmetric composition with an actual passport representation as the hero visual. If it shows a sample, label it “Example passport”; no fake live activity.
- Sections: verification walkthrough, what the evidence establishes, manufacturer workflow, inspectable testnet/configuration evidence, concise FAQ, accurate footer.
- Remove invented customer names, 50M+/99.9% claims, fake testimonials, unsupported AI/multisig/security promises, inert pricing/trial buttons, unrelated YouTube demo, and CardFi credits. No billing surface until billing exists.

Application shell:

- One navigation system: desktop sidebar around 240px, compact header, breadcrumbs/title, real network/service status and wallet action. Mobile uses an accessible drawer; all routes remain reachable.
- Public users can verify and read passports without wallet friction. Wallet connection is contextual to registering, recording, or authorized administration.
- Keep current routes working. Introduce public `/verify` and reusable result/passport views; add product detail routes only if needed for the implemented journey.
- Overview emphasizes actionable information and actual product records. Consolidate the duplicate analytics pages or label a sample view explicitly; real empty data gets a useful empty state.
- Verification: prominent input, camera/manual tabs, loading state, readable result summary, product/registrant details, integrity checklist, actual journey timeline, and expandable evidence drawer. Use precise language: “Registered on Sepolia,” “Revoked,” “Metadata mismatch,” “Not found,” “Verification unavailable.”
- Registration: three steps—details, review, confirmation—with inline associated errors, persistent form state, exact hash/URI preview, transaction progress, then passport/QR actions.
- Supply chain: actual checkpoint timeline, source/time/handler for each entry, authorization-aware action, and explicit unavailable/empty states. Remove fake locations, fake environmental readings, unsupported map controls, and fabricated receipt links.
- History: searchable records, working filters, stable pagination, scoped statistics, safe export. Controls must visibly change the relevant result.
- Settings: retain only real settings, persist local preferences where appropriate, show accurately sourced contracts/network, and remove fake API keys/email/push/threshold controls unless implemented.

Motion and accessibility:

- Use CSS and existing Framer Motion for 160–240ms feedback and up to 400ms entrances. Avoid blocking loaders, repeated stagger delays, infinite decorative movement, or transform-heavy tables.
- Respect `prefers-reduced-motion` and ensure content is readable without animation. No motion-induced layout shifts.
- Semantic landmarks and headings, skip link, associated field labels/errors, named icon buttons, visible focus, keyboard drawer/dialog navigation, focus return, polite result announcements, and actionable errors.
- 320px fallback, 375px phone, 768px tablet, 1280px laptop, 1440px desktop. No document-level horizontal overflow. Tables may scroll inside labeled containers. Long IDs/hashes wrap or truncate with an accessible full-value/copy option.
- Consolidate toast systems into one accessible non-blocking notification component. Remove `alert()` notifications and nested `main` landmarks.

Gate D: visually inspect the actual landing, verification, passport, registration and mobile drawer in both themes and every critical state. Save before/after screenshots. Confirm hierarchy, readability, text fit, loading, error and empty states; do not equate a prettier homepage with a complete UI redesign.

### 7. Milestone E — executable QA, including Playwright

Add `@playwright/test`, `@axe-core/playwright`, and a small domain test runner such as Vitest when needed. Use existing Hardhat for Solidity. Add Lighthouse CI for reproducible performance budgets; use Slither for contract static review if the environment supports it. Missing tools need an explicit blocked entry, not a pass. Plugins are optional; no website-generator plugin replaces these checks.

Create an actual `playwright.config.ts` and tests under `tests/e2e/`. Use the production build and server for the release gate, not the development server. A starting configuration:

```ts
import { defineConfig, devices } from '@playwright/test';

const hosted = process.env.E2E_BASE_URL;
export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: hosted ?? 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: hosted ? undefined : {
    command: 'rtk npm run build && rtk npm run start -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-laptop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } },
    { name: 'chromium-tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'chromium-mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: 'webkit-smoke', use: { ...devices['Desktop Safari'] } },
  ],
});
```

Adapt supported device names/flags to the installed Playwright version. CI must have RTK installed for these commands or use an explicitly documented command wrapper supported by the workspace instructions. Provide a reproducible browser-install step and isolated test-chain/storage fixtures.

Use `getByRole`, `getByLabel`, and stable test IDs for evidence fields. Avoid positional selectors and arbitrary sleeps. Wait for UI state, receipt, or response. Collect console/page errors and unexpected failed first-party requests; allowlist only documented expected external failures. Do not suppress product exceptions.

Three complementary test layers:

1. **Deterministic UI tests:** fixed metadata, IDs, clock and network responses. Cover success, revoked, missing, mismatch, wrong-chain, RPC failure, rate limit, upload failure, wallet rejection, pending and reverted states. Mocking is disclosed and confined to test boundaries.
2. **Local integration:** deploy actual Solidity to an isolated Hardhat chain, use an isolated funded test account, exercise the real ABI and product writes/readback, and reconcile receipts/events/metadata. Prove application behavior against contracts, not only response fixtures.
3. **Hosted Sepolia acceptance:** verify the real configured chain/contracts and run read-only browser smoke checks. Real manufacturer/checkpoint transactions need the user's wallet approval; after approval, reconcile transaction status, expected event, metadata and explorer URLs. Record which checks were not executed.

Implement all acceptance IDs in `QA_ACCEPTANCE_MATRIX.md` or explicitly document their blocked/retired status and rationale. Critical behaviors and release gates cannot be retired to avoid a failure.

Visual tests: stable seeded data, self-hosted/consistent fonts where possible, fixed browser versions/OS, controlled motion and timestamps, and masks only for genuinely volatile evidence. Use approved screenshots for landing, empty dashboard, all verdicts, registration stages, mobile drawer and evidence panel. Test reduced motion separately. Do not mask the actual verdict or whole layout.

Axe: no serious/critical violations, plus manual keyboard, contrast and screen-reader checks for controls/results. Automated accessibility alone is incomplete. Test 200% zoom and long content. Check document overflow and sticky/fixed-control occlusion at target sizes.

Performance: test a production build with documented Lighthouse conditions and median of three runs. Target landing/mobile performance ≥90, accessibility ≥95, best practices ≥95 and SEO ≥95. Treat workflow failures as blockers regardless of scores. Target LCP ≤2.5s, CLS ≤0.1 and INP ≤200ms where sufficient field evidence exists; a synthetic run does not prove field INP. Lazy-load wallet, scanner and charts where compatible with usability; keep the public landing/lookup lightweight.

Gate E: independent CI passes install, lint, types, domain/API tests, contract tests, production build, browser tests, accessibility and required security/configuration checks. Save actual reports, traces, screenshots, source revision and tool versions.

### 8. Milestone F — hosted deployment and release evidence

Use Vercel as the default web hosting target unless the user chooses another platform. Prefer preview deployment followed by validation and deliberate production promotion. Prepare the configuration and exact runnable deployment steps even if account access is unavailable.

- Document frontend public configuration, server-only storage/RPC settings, and separate local contract-deployment credentials. Set environment scopes deliberately. Never request seed phrases or paste private keys into chat.
- Add a fail-closed readiness check for configured chain, reachable RPC, expected contract code and ABI reads. Liveness reports whether the app serves requests; readiness reports whether live verification is available. Use timeouts and safe redacted errors.
- Make a `release:check` command verify the manifest, addresses/code identity, contract calls, storage availability, hosted public routes and a supplied real transaction receipt/event when one is part of the release evidence. It must exit nonzero on mismatch or missing required evidence.
- Verify deployed environment values and WalletConnect allowed origins; test direct navigation, refresh, HTTPS QR links, camera permissions, CSP, wallet rejection/network switching and mobile layout on the hosted build.
- Run the browser smoke suite against the preview URL. Confirm that public read paths work with no wallet extension and failures remain honest.
- Record real registration and checkpoint evidence if approved and available: transaction hash, chain ID, contract, block, receipt status, decoded expected event, product ID and retrievable metadata hash. Do not fabricate these fields or substitute local traces for Sepolia evidence.
- Update the README to the actual VerifyChain clone URL, correct commands, required variables, network limitations, supported feature list, verified hosted URL, test evidence, trust model, camera/storage/privacy behavior and rollback procedure. Remove obsolete README security claims.
- Preserve an operational rollback plan for the web deployment. Rollback of hosting does not roll back chain writes. Contract replacement needs versioned manifests and migration/compatibility planning.

This prompt authorizes implementing and validating the project and preparing a reviewable release. Use the user's existing authorization if they have separately approved deployment. Otherwise finish all preparation and show the concrete preview/release evidence before requesting the final publication or funded-transaction approval. If credentials are missing, complete all independent work and identify the smallest exact external step required.

Gate F: a verified URL, honest public product journey, correct configured contracts, reachable metadata, smoke-test evidence and rollback documentation. A successful hosting upload alone does not satisfy this gate.

### 9. Final delivery

Return the changed behavior, important design decisions, actual checks and results, preview/production URLs when verified, evidence paths, remaining risks and any external blocker. Distinguish “implemented,” “locally verified,” “hosted verified,” and “awaiting user wallet signature.” Include no invented success metrics. Keep the live UI usable and truthfully labeled even when optional features are unavailable.

## Reference documentation

- [Next.js security advisory](https://nextjs.org/blog/security-update-2025-12-11) and [React RSC advisory](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components): establish why the old pinned framework needs review; recheck current advisories before choosing versions.
- [Playwright webServer](https://playwright.dev/docs/test-webserver), [accessibility testing](https://playwright.dev/docs/accessibility-testing): implementation guidance for browser and axe checks.
- [Vercel deployment environments](https://vercel.com/docs/deployments/environments) and [environment variables](https://vercel.com/docs/environment-variables): preview/production and configuration scope.
