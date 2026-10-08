# VerifyChain acceptance matrix

These are implementation requirements, not passed tests. Prepared 4 October 2026. Every implemented ID needs a linked test/report and actual result in `IMPLEMENTATION_PROGRESS.md`. “Blocked” is a separate state from “passed.”

| ID | Layer | Scenario | Required observable behavior |
| --- | --- | --- | --- |
| A01 | CI | Fresh checkout/install | Supported pinned Node and clean npm install succeed using committed lockfile; no local node_modules/cache dependency. |
| A02 | CI | Quality gates | ESLint and strict typecheck pass; production build succeeds without ignore flags. |
| A03 | Security/config | Missing, zero, malformed or conflicting address/RPC | Validated configuration fails clearly; no fabricated healthy/live state or random fallback. |
| A04 | Integration | ABI generation/provenance | Exported ABI matches current compiled source; release manifest matches chosen deployed code/interface. |
| A05 | Browser/integration | Connect/disconnect/account change | One wallet state across header/forms; disconnect and account changes invalidate scoped state. |
| A06 | Browser/integration | Wrong chain and switch rejection | All writes blocked with usable switch/retry action; entered data retained. |
| A07 | Dependency review | Advisory scan | No unresolved release-blocking reachable high/critical issue; decisions justified, no force-fix without compatibility checks. |
| V01 | Browser/integration | Registered product, disconnected wallet | Public lookup works without signature; registration/trust/metadata evidence accurately separated. |
| V02 | Domain/contract/browser | Revoked product | Revoked state after current read; never a green authentic verdict from existence alone. |
| V03 | Domain/browser | Unknown product ID | Not-found state; no simulated record or confirmed-counterfeit claim. |
| V04 | API/browser | RPC timeout/404/429 | Unavailable/retry state; no false verdict, fake receipt or API success masking a dependency outage. |
| V05 | Domain/storage/browser | Changed metadata bytes | Canonical hash mismatch visible; altered commitment cannot yield verified-integrity state. |
| V06 | Domain/browser | Metadata missing | Registered record remains distinguishable from unavailable metadata; no invented product details. |
| V07 | Domain/integration | Manufacturer deactivated/self-registered | Active and identity trust levels stated accurately; self-registration not labeled verified brand. |
| V08 | Domain/API | Cache/revocation/contract changes | Correct chain/contract/product scope; no caller-identity leakage; stale verified state invalidated within documented freshness policy. |
| V09 | API | Blank/oversized/Unicode IDs, malformed JSON/address | Predictable 4xx responses and contract-compatible byte limits; no crash/internal error disclosure. |
| V10 | API/hosting | Abuse controls and readiness | Trusted client identity handling, bounded storage/timeouts; independent instances cannot bypass stated production quota; liveness distinct from readiness. |
| R01 | Domain/storage/integration | Metadata review and upload | Preview bytes/hash, stored bytes/URI and contract commitment agree exactly. |
| R02 | Browser/integration | Successful manufacturer/product registration | Await wallet → submitted → confirming → receipt success; expected event/readback before confirmed UI. |
| R03 | Browser/integration | Wallet rejection or contract revert | Specific non-success state, values retained, no false submitted/confirmed toast. |
| R04 | Browser/integration | Double click, delayed/replaced/dropped receipt | One intended attempt; no blind resubmission; hash-specific state and documented recovery. |
| R05 | Browser | Reset/register again/account change | Previous successful receipt cannot auto-confirm a new form/attempt. |
| R06 | Security/API | Upload authorization/replay/oversized file | Scoped challenge, nonce/expiry, replay rejection, safe content/size/quota checks; no secret in client bundle. |
| R07 | Contract/integration | Batch and single registration | Global/manufacturer counts reconcile; limits/duplicates/invalid values tested; batch atomicity; all IDs retained. |
| Q01 | Browser | QR link/query/manual ID | Registered label opens intended public record on hosted origin; old links preserve ID via redirect/prefill. |
| Q02 | Browser/device | Camera permission accepted/denied/absent | Scanner works where supported, cleanup releases camera, accessible manual fallback always available. |
| Q03 | Domain/browser | Repeated scans/malformed or foreign URL | Duplicate submission prevented, agreed payloads parsed, arbitrary executable/untrusted URLs rejected. |
| Q04 | Export/device | Downloaded QR label | QR decodes correctly; readable ID/network disclosure; scanner/print-device check recorded. |
| C01 | Contract | Metadata update/revocation | Specified version/immutability rules, authorized update events, correct hash/URI and revoked readback. |
| C02 | Contract/property | Verification observations/statistics | Single/batch counts and confidence calculations reconcile; submitted observations never treated as physical truth. |
| C03 | Contract/property | Handler permissions/checkpoints | Unauthorized/revoked handlers rejected; sequence/completion and cross-product model tested and documented. |
| C04 | Contract/property | Repeat reward/refund claim | Second claim/refund rejected; liabilities and actual balances reconcile. Financial feature remains unavailable until fixed and independently reviewed. |
| C05 | Contract/property | Bonus funding, stalled reports, cancellation, failed recipients | No phantom spendable pool or unbounded liability; documented liveness/refund policy and safe transfer state. |
| C06 | Integration/read-model | Indexed string events/history/reorg | Product topics reconciled to original IDs; receipts/logs deduplicated; bounded scans/cursor and reorg behavior tested. |
| D01 | Browser/integration | Supply chain record | Real typed checkpoints shown; absence/error distinct; metadata hash never linked as transaction receipt. |
| D02 | Domain/browser | History filters, dates and analytics | Controls change actual scoped results; counts reconcile to source; no fixed examples mixed into live totals. |
| D03 | Export | CSV/PDF/JSON | Correct status/chain/evidence; quoted fields/formula defenses; missing proof stays unavailable, no invented expiry or signature. |
| D04 | Browser | Settings save/reload | Real preferences persist and affect intended behavior; unavailable integrations not presented as working. |
| U01 | Visual/browser | All routes at 375/768/1280/1440 and 320 fallback | No document overflow, cropped actions or unreadable long IDs; every route reachable via sidebar/drawer. |
| U02 | Accessibility/browser | Navigation/form/modal/results keyboard journey | Named controls, labels/errors, skip link, focus trap/return, result announcements and visible focus. |
| U03 | Accessibility/visual | Themes, contrast, 200% zoom | Text/states meet WCAG AA; no color-only verdicts, lost content or covered focused controls. |
| U04 | Browser/visual | Reduced motion | No required information hidden by motion, no infinite decorative animation; state feedback remains usable. |
| U05 | Visual/browser | Approved screenshot suite | Deterministic reviewed baselines for critical routes/states; no blanket masking/automatic baseline regeneration. |
| U06 | Browser/content | Landing/footer/actions | Working CTAs/links, accurate VerifyChain identity/testnet labels; no invented endorsements, metrics or unimplemented billing/AI promises. |
| U07 | Browser | Notifications/loading/errors | Non-blocking consistent notifications; actual state, useful retry, no `alert()` or forced reload after writes. |
| U08 | Browser | Console/network | No unexplained application errors/hydration warnings or failing required first-party routes. Expected external errors narrowly documented. |
| P01 | Lighthouse | Production build mobile/desktop | Documented median of 3 runs: performance ≥90, accessibility/best-practices/SEO ≥95; regressions explained, workflows still pass. |
| S01 | Security/browser | Headers/CSP/third-party boundaries | HTTPS, intended headers/CSP and validated URLs; wallet/RPC/camera/storage work without global unsafe bypasses. |
| E01 | CI | Full release judge | Independent CI uses same revision/configuration; actual reports, traces, screenshots and versions retained. |
| E02 | Hosting/browser | Vercel preview/direct links/refresh | Verified preview, configured origins/env scopes, public no-wallet lookup and responsive smoke checks. |
| E03 | Live read-only | Sepolia manifest/configuration | Reachable chain ID, expected contract code/interface and retrievable metadata; unavailable evidence blocks readiness. |
| E04 | Live user-approved write | Actual registration/checkpoint receipt | User signs; expected contract/event/product/receipt status reconciled; correct explorer link, explicit testnet. |
| E05 | Release/docs | Production handoff | Verified URL and feature list, configuration guide, real evidence, exact remaining blockers and web/contract rollback limits. |

## Test ownership and evidence

Use domain/API tests for deterministic classification and input boundaries, Hardhat for real contract behavior/accounting, Playwright for browser interactions, axe plus manual checks for accessibility, and CI for independent release validation. Local-chain tests and mocked browser responses do not establish public Sepolia deployment. Actual camera performance needs a real device check.

Each evidence entry records ID, code revision, command/tool, exit/result, environment, expected/actual behavior, report path and unresolved risk. Fixing agents may not weaken checks or erase evidence to declare completion.
