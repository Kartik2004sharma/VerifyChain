# Baseline provenance

Date: 4 October 2026. These checks audit the original application source; no remediation was applied.

- Host: Node 25.9.0, npm 11.12.1; Hardhat reported unsupported Node. This is another reason to pin a supported LTS environment before release.
- Clean install failed with EUSAGE because the committed lockfile misses native/optional package entries, including Tailwind oxide, lightningcss, sharp and resolver platform packages.
- Exploratory install: `rtk npm install --ignore-scripts --package-lock=false --no-audit --no-fund`. This completed and added 1,703 packages locally without editing the tracked lockfiles. Semver-compatible dependency versions differed from the committed lockfile. Consequently the observed build diagnostics describe this exploratory installation, not a reproduced locked build.
- Installed versions observed: Next 15.3.2, React 19.3.0, wagmi 2.19.5, @wagmi/connectors 5.11.2, viem 2.57.2, Hardhat 2.29.1, Recharts 2.15.4.
- Committed lockfile examples: Next 15.3.2, React/react-dom/react-server-dom-webpack 19.1.1, TypeScript 5.9.2, ESLint 9.36.0, Hardhat 2.26.3 and OpenZeppelin 5.4.0.
- `npm audit --json` against the committed lockfile returned exit 1: 140 affected-package findings (7 critical, 56 high, 62 moderate, 15 low). Counts cover direct/transitive and development dependencies; assess reachability before inferring application exploitability. Direct old framework dependencies and unused SDK trees require review. This is an audit snapshot, not a permanent advisory count.
- TypeScript: 19 diagnostics; lint: 93 errors, 15 warnings. Detailed outputs are saved beside this file.
- Build failed on unresolved @x402 dependencies via the wallet connector graph; no browser or Lighthouse pass is claimed.
- Solidity compilation succeeded for eight files including imported dependencies; this does not establish contract correctness/security.
- Existing Hardhat test run exited successfully with `0 passing`; no tests were discovered.
- Isolated ephemeral Hardhat reproductions confirmed three flaws in current source: batch global count 0 despite two registered records; repeated winning-voter claims both succeeded; repeated incorrect-voter refunds both succeeded and rewardPool remained above actual contract balance. See `local-contract-reproduction.json`. Synthetic local funds only; no public transactions.
- Read-only probe to the source-configured `https://rpc.sepolia.org` returned HTML 404, not JSON-RPC, for a batch containing `eth_chainId` and `eth_getCode` for the configured ProductRegistry. Source addresses remain unverified. An earlier Python probe failed local CA validation; curl provided the substantive endpoint result without disabling TLS validation.

No credentials were supplied, printed or committed. No public-chain transaction or hosting action occurred.
