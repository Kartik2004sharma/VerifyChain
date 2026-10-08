# VerifyChain visual recreation — 5 October 2026

The owner requested a new website identity because the earlier interface still felt too close to the old design. The previous website served only as inspiration. This recreation replaces the composition, typography treatment, artwork, navigation and principal workflow layouts, while preserving the evidence and transaction rules.

## Direction

An inspectable object, rather than a generic dashboard, leads the experience. Ink/navy, cobalt and a restrained citrus accent form the public identity. Quiet neutral surfaces keep the workspace readable. Bold sans-serif typography replaces the earlier editorial serif treatment. A custom original SVG parcel and product-label illustration makes the subject concrete; it is explicitly a concept, never a live product or a working QR.

The homepage opens directly onto a public ID lookup. Layered evidence gets a horizontal signal strip, a numbered process, a full-width evidence section, manufacturer action and concise native FAQs. No invented usage statistics, endorsements or physical-authenticity promises were added.

## Workflow changes

- A horizontal desktop navigation replaces the persistent sidebar. Mobile retains the accessible native navigation dialog with focus return. Branding, appearance, readiness and wallet state have a clear hierarchy.
- Public verification uses a two-part studio. The illustration yields to the result during lookup, keeping the product ID editable. Record, trust, integrity and evidence retain separate states and real provenance.
- The dashboard offers an immediate ID lookup and a separate registration entry. Wallet registration, checkpoints, observations and preferences remain real scoped controls, with truthful empty states.
- Registration uses a main form plus an explanatory companion, with visible progress and matching current-step cues. Exact metadata review is now included in the visual suite.
- Every workspace route shares the new form, table, checkpoint, notice, export, state-color and theme treatment. Header appearance controls persist into the workspace and across reloads.

## Review and verification

Old source and 38 old baselines are archived under `audit-evidence/redesign-2026-10-05/before`; source copies use text extensions to keep them out of compilation. New screenshots are collected as candidates without altering regression baselines. Approval follows inspection, then normal comparison with the same 0.5% cap and no masked verdict/evidence areas. The redesigned suite covers 42 images, including metadata review, in desktop/mobile and both themes.

Initial browser evidence: 125 passed and five failures from an ambiguous settings selector matching the new appearance button. The selector now addresses the actual named combobox; five focused browser checks pass. A capture-port collision was caught and discarded before review. The collector now checks VerifyChain identity and uses its own port. These are recorded environment/test repairs, not weakened product standards.

Manual screenshot inspection prompted two refinements: a smaller mobile headline to retain deliberate two-line wrapping and a compact lookup once results begin. Final production build, full browser comparison and three-run Lighthouse evidence follow under the dated evidence directory. The independent CI and live/hardware release blockers from the acceptance ledger remain explicit.

Final browser suite exits 0: **134 passed**, 6 deliberate duplicate visual skips, 0 failures. This includes 130 behavior checks across five projects and four visual tests comparing the 42 reviewed images. Production route checks report no serious/critical axe violations, no overflow and no unexplained application console/page errors. The appearance toggle, settings persistence, input/review flow, camera-denial fallback, keyboard skip link and evidence inspection remain covered. Missing live/device checks stay missing.

Performance iteration 1 failed the mobile budget (83 median; individual 90/83/74), with accessibility/best-practices/SEO each 100. The failure is retained in `lighthouse-mobile`. Background browser CPU load was also observed, so synthetic timings may vary. The public homepage unnecessarily initialized the full wallet/query provider. Theme/branding are now independent; each workspace route has exactly one wallet/query boundary using the shared wallet configuration. A browser journey explicitly checks that the connected injected identity survives navigation into public verification. No performance budget was lowered. Follow-up full gates and three-run profiles are retained separately.

The homepage initial JavaScript fell from 120 KB to 109 KB after the provider change. The repeated full strict quality pipeline passes (42 unit/API, 20 Solidity, 5 real local-chain integration, lint, strict types, build). The repeated full browser suite passes 134 checks; six duplicate visual cases skip by the original project design. All 42 accepted baselines match, and ten focused theme/wallet checks pass, including connection continuity across route navigation. Final source hashes are in `source-revision.json`.

Final three-run Lighthouse: desktop medians **100/100/100/100** pass all existing budgets. Mobile **88/100/100/100** retains a performance gap against the 90-point target. The initial failed 83 median and final 78/91/88 runs are both preserved; no throttling or category budget changed. No further score-only redesign was introduced. See `audit-evidence/redesign-2026-10-05/performance-summary.json`; release performance acceptance remains partial.
