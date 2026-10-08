# Dependency review

Reviewed 4 October 2026. Official Next.js September security guidance and the npm registry support the pinned Next 15.5.27 maintenance release; React is pinned to 19.3.0. The unnecessary direct RSC package was removed. Current source does not import Circle, LI.FI, NFT storage, delegation toolkit, MetaMask SDK, RainbowKit or payment functionality.

Production graph scan is retained in `audit-evidence/dependency-production.json`. Patched compatible versions of jsPDF, lodash, PostCSS, sharp, picomatch and ws are pinned/overridden. Browser/contract/domain gates validate the relevant paths. Vitest was upgraded to 4.1.11 to fix UI-server/mock traversal advisories; Handlebars was patched to 4.7.9. Playwright/test/core versions are all pinned to 1.58.2 so axe and browser types use the same API.

The full development graph still includes old glob/parser/proxy/reporting dependencies through Hardhat, coverage tools, ESLint tooling and Lighthouse CI. See `audit-evidence/dependency-all.json` for exact counts and advisories; this is not a claim that every dependency is vulnerability-free. Those tools run only on owner-reviewed local code or the isolated CI runner. Vitest runs in non-server mode; no Vitest UI is exposed. Lighthouse visits the local reviewed app, not arbitrary submitted URLs. Coverage/template compilers process checked-in fixtures. No production route exposes these tools or accepts untrusted filenames/templates for them.

Wallet connector SDKs remain transitively installed by wagmi but this application imports only the core injected connector. Mobile deep links and unused SDK integrations are not claimed as tested. The deployed application still needs an independent CI/security review for its final revision and production environment. Never use `npm audit fix --force` to silence the graph without compatibility review.

A compatible future migration of Hardhat/Lighthouse/ESLint dependencies is tracked as toolchain debt. Do not present this local scan as an external security audit or proof of live infrastructure safety.

Primary guidance: [Next.js security release](https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026), [React 19.3](https://react.dev/blog/2026/09/09/react-19-3). Version selection was checked against current official documentation and the registry rather than a historical minimum patch.

Final scan counts: production 23 moderate, 0 high/critical; full toolchain 16 low, 37 moderate, 37 high, 0 critical. Full-graph findings are not erased or represented as fixed. Release-script Node module auto-detection and test-runner color/configuration warnings are tooling notices, distinct from application console failures.

## Pre-publication refresh — 8 October 2026

A fresh npm production audit found a new high-severity source-map-js indexed-map denial-of-service advisory, GHSA-68fv-2mgg-jv7q, affecting 1.2.1. The compatible 1.2.2 patch is now locked; npm changed one package. The original audit is retained in `audit-evidence/release-2026-10-08/production-audit.json`. A clean install, repeated full quality/browser gates and post-patch scans follow in that directory. No force-fix or major dependency upgrade was used.

The post-patch production scan reports **23 moderate, 0 high and 0 critical**; the full development graph reports **16 low, 40 moderate, 37 high, 0 critical**. Full development findings remain toolchain debt and are retained in `full-audit-patched.json`. The production patch does not claim an independent security audit.
