# R-review — Code-review fix pass on the Swatch redesign

**Issue:** none (review findings)  **Commit:** see `git log --grep "^Review:"`  **Status:** shipped

## What shipped
Every finding from the review of the redesign since 327c9df is resolved. S8 was optional and is
deliberately left (reason below). Behaviour changes went test-first. The S3/S5/S6/S7 refactors
were done under the existing tests, with new tests where a new seam appeared.

## Findings

| ID | What was done |
|----|---------------|
| S1 | `.tag` now uses the new tokens `--tag-bg` (#1A1C1C) and `--tag-fg` (#FFFFFF). They are the same in both themes and live in `darkBase` (light inherits them). The pair is in `TOKEN_PAIRS`. New tests in `tests/tokens.test.ts`: swatch.css holds no literal hex colour (this was red on `.tag`), and the tag pair is audited. |
| S2 | Restored "gives every principle a distinct accent *and* a distinct marker shape" in `tests/criteria.test.ts`, written against the current data, the CSS. `.mk.pN` must fill with `a1..a4`, and those accents must be distinct hexes in both themes. The shapes (border-radius / clip-path / transform) of `.mk.pN` and of `.princ .pN .shape` must each be four distinct ones. Checked that it goes red when `.mk.p2` loses its `border-radius`. |
| S3 | New `src/labs/thresholds.ts`: `THRESHOLD_CHECKS` (four rows: threshold, `appliesTo`, `level`, `spoken`, `text`) and `TEXT_CHECKS` (the three text rows). `ColourCheck.tsx` renders `THRESHOLD_CHECKS`. `fade.ts` uses `TEXT_CHECKS`, `formatScore`, `passesThreshold`, and `SCALE_TICKS = [AA_LARGE, AA_BODY, AAA_BODY, 21]`. No hard-coded 4.5/3/7 and no truncation of its own. |
| S4 | `rule` field → `appliesTo`. `.rules` class → `.thresholds` (swatch.css, HomePage, `e2e/home.spec.ts`). Pledge heading "This site follows its own rules." → "This site meets the criteria it explains." Updated in `Pledge.tsx`, `tests/homePage.test.tsx`, `e2e/home.spec.ts`, `e2e/about.spec.ts`, and design guide §8.13 (line ~433), so the design guide no longer prescribes the old copy. |
| S5 | New `src/components/CriteriaResults.tsx` (`records`, `counts`): the polite count line, the grid, and "Nothing matches…". Used by Home's index and the All criteria page. |
| S6 | New `criteriaInPrinciple(n)` in `src/criteria/corpus.ts`, resolved through the guideline. Home's principle cards and the All criteria split both use it. Test: 20 / 20 / 13 / 2. Removed the `p.num as 1\|2\|3\|4` cast, since `Principle['num']` is already that union. |
| S7 | New `src/labs/pairQuery.ts`: `searchFromPair` and `pairFromSearch(search, current)`, which returns null when no colour is given and keeps the current colour for a bad one. The lab link and the Colour check page preload use it. `tests/pairQuery.test.ts` covers it, including the round trip. |
| S8 | Left. A `Route` union would also need test typing changes (`routeFor(...)?.num`, `route.num!`). `recordFor` still has to throw for a number with no record, so the union only removes the `?` branch. Not cheap enough to be worth it. The PageKind switch is untouched, as instructed. |
| P1 | ADR 0001: "59 HTML files: Home, All criteria, Colour check, About and the 55 criterion pages." |
| P2 | `e2e/axe.spec.ts` MODES: light@1280, dark@1280, light@320, dark@320. The 320px names are now "light theme at 320px" and "dark theme at 320px". STATE_PAGES use the same MODES, so they get dark@320 too. |
| P3 | The reduced-motion block now covers `*, *::before, *::after` and adds `animation: none !important`. New e2e in `e2e/criterion.spec.ts`: under `reducedMotion: 'reduce'`, an injected probe with an animation and a transition computes `animationName: none` and `transitionDuration: 0s`. No CSS animation exists today, so this is future cover. |
| P4 | PRD story 11 now lists `?l=A` / `?l=AA`. Criterion page anatomy item 7 now records the "More from {principle}" fallback for a criterion alone in its guideline. |
| P5 | Colour check eyebrow: "Tool · Success criteria 1.4.3 and 1.4.11, plus the AAA result for 1.4.6". Home's 1.4.6 threshold card is labelled "1.4.6 · Level AAA, not in the index" and links nowhere. Tests in `tests/colourCheck.test.tsx` and `tests/homePage.test.tsx` (both went red first). |
| P6 | `useColourPair` is now backed by a pure `PairModel` (`initialPairModel`, `nextPairModel`). Only a reader change (`announce: true`) moves `changes` and `heard`, the pair as of that change. A preload moves `pair` only. The announce effect keys on `heard` alone, so a preload is never spoken, even after an earlier change of the reader's. Unit tests at the model seam (red first), plus an e2e: a `?fg=&bg=` preload stays silent and the reader's next change is announced. `ColourPairState` gains `heard`. |
| P7 | `docs/issues/r03-criterion-pages.md`: "the eight criteria that have a demo (nine demos: one criterion has two)". |

## Decisions made
- `src/labs/thresholds.ts` is the one threshold table for the labs. A lab that judges a pair must read it, and must not keep its own list. contrast.ts stays criterion-agnostic.
- `src/labs/pairQuery.ts` is the `?fg=`/`?bg=` contract, the counterpart of `catalog/urlQuery.ts`.
- `CriteriaResults` is the results block under any filter panel.
- `criteriaInPrinciple` is the one per-principle lookup. `criterionNav.related`'s "More from" fallback still filters with `principleFor` inline. It is equivalent, it is outside the two call sites S6 named, and it was left alone.
- swatch.css must not contain literal hex colours (test-enforced). examples.css is exempt (ex-* tokens).
- The seams were not confirmed with a human (subagent run).

## Deliberately left
- S8 (see table).

## Gate
Port `E2E_PORT=4520`. Steps run one at a time: `tsc --noEmit` clean; `vitest run` 696 passed; `npm run build` wrote 59 pages; `npx playwright test --workers=2` 531 passed, 4 failed (22.2m, a heavily loaded machine). All 4 failures were `Test timeout of 30000ms exceeded`, with no assertion failures: `/criteria/` axe light and dark, the `/criteria/2.4.7/` Broken-stage check, and `/criteria/2.4.11/` axe light. Per the load rule, `npx playwright test --last-failed --workers=1` on the same port: 4 passed (8.2s). Gate green. The new e2e tests (the dark@320 axe passes, the reduced-motion probe and the silent preload) passed in the first run.
