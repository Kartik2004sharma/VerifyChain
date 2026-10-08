# Visual review

The editorial passport direction was inspected in actual production screenshots on 4 October 2026. Desktop landing, mobile lookup, registration, light/dark passports, revoked/mismatching/unavailable states and the mobile drawer were reviewed for hierarchy, text fit and evidence clarity. Test fixtures are labeled in their data; they are not runtime demo records.

Initial candidates exposed an off-viewport fixed skip-link capture artifact when expanding evidence. The skip link now uses clipping until keyboard focus, preserving the keyboard journey. Passport regression images target the entire passport region, including expanded evidence; full-page landing/workspace and drawer checks remain. This is a documented capture/visibility repair, not a masked verdict or an increased tolerance. Initial unapproved page-level passport candidates are archived separately from active baselines.

Pinned Chromium 1.58.2 on Darwin produces the accepted desktop/mobile images. Screenshot comparisons keep the 0.5% pixel-difference cap for minor rasterization noise. No result area is masked. Theme state, fonts and readiness are settled before capture. Manual screen-reader, real 200% browser zoom, camera hardware and print-label reviews are still release checks; screenshots and axe do not establish them.

The CI runner uses macOS to match this baseline platform. Its independent execution remains pending publication of the reviewed revision; local visual checks do not imply CI has run.

Final review: the corrected dark mobile expanded passport and its diff were inspected directly. The diff was confined to the removed ghost skip-link overlay; verdict, metadata, identity and expanded evidence remained visible with wrapping intact. Only that single initial candidate was replaced after review. Both its former image and the actual/diff are retained in `audit-evidence/visual-candidates`. The keyboard skip-link acceptance check remains active. Final comparison runs without snapshot-update flags.

4 October browser result: four active visual tests passed, covering 38 approved images, alongside 125 behavioral checks (129 passed total). Six redundant screenshot cases intentionally skip on laptop/tablet/WebKit projects; their route behaviors remain tested. See `audit-evidence/browser-final.txt`. No automatic update flag was used in the final run.

## New website recreation — 5 October 2026

The owner requested a fresh identity rather than further polish of the prior site. The accepted set now has 42 images: new homepage, horizontal workspace, verification studio, registration details and exact review, five verdicts with expanded registered evidence, and the mobile dialog; both themes at desktop/mobile. Prior baselines are retained in `audit-evidence/redesign-2026-10-05/before/baselines`.

Actual candidates were inspected before adoption. Review corrected mobile headline wrapping, compacted the lookup when results begin, and made unknown/unavailable states neutral and mismatches amber while keeping revoked red and registered green. Icons and text communicate each state independently of color. Original parcel SVG is labeled as concept artwork. The accepted baseline manifest records image hashes and rationale. Final regression checks keep the original 0.5% cap with no result masks or automatic update flags.

[Design rationale](UI_REDESIGN.md) records architecture and workflow changes. Independent CI, signed hosted transaction stages and manual screen-reader/zoom/camera/print remain open release checks.

Latest complete browser repeat after moving wallet initialization out of the homepage: **134 passed, 6 deliberate duplicate visual skips, 0 failures**, including four visual tests comparing 42 inspected baselines. See `audit-evidence/redesign-2026-10-05/browser-provider-final.txt`. No snapshot-update flags or masks were used.
