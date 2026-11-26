# L-review — Code review fixes on `labs` (#40)

**Branch:** `labs-review`  **Commits:** `git log --grep "^Review:" labs..labs-review`  **Status:** ready to merge

## What changed

1. **Vision filter transition.** `.vis-target` no longer transitions `filter` (design guide §7:
   only opacity, transform and colour animate); the filter switches at once. The comments in
   swatch.css and `VisionDefs.tsx` that cited §7 as permission are corrected. Deliberate test
   change: `e2e/vision-live.spec.ts` expected `transition-duration: 0.2s`; it now expects `0s`
   on the stage and the lab mock in every motion mode (stricter, not weaker).
2. **Lab states in four modes.** `e2e/axe.spec.ts` STATE_PAGES gains URL states for 1.4.10,
   1.4.12, 2.2.1 and 2.5.8 (a failing and a passing state each) and the Colour check page
   (`?fg=999999` failing, `?fg=595959` passing). The 1.4.3 page's check reads no query; the
   Colour check page is the one that does. These rows are `test.slow()`. Each state page also
   checks that any `data-depicts-failure` sits in the Broken stage or a lab mock.
3. **No blanket mock exclusion.** The lab sweep in `e2e/labs.spec.ts` no longer excludes
   `[data-lab-mock]`. Without it only the contrast labs failed (colour check on 1.4.3, 1.4.11,
   1.4.1, Home and the Colour check page; fade-the-text on 1.4.3 and Home): their mock draws the
   reader's failing colours. Those two mocks now carry `data-depicts-failure` only while they
   depict text under 4.5 : 1, and the sweep asserts marks sit only on the mock and that a
   passing start has none. Every other mock passes axe as it is.
4. **Reduced motion everywhere.** The reduced-motion and `data-motion="off"` lab checks now
   assert that no element (or ::before/::after) in the lab or in either live stage has a
   transition duration above 0 or an animation.
5. **Simulated Tab race.** `LiveStage` kept the fail stage's stop in state only, so two presses
   before a re-render both stepped from the same stop. It now mirrors the stop in a ref that
   `press` reads. Test first: `e2e/focus-order-live.spec.ts` "two Tab presses before a re-render
   move focus two stops" clicks the bar twice in one task; it failed (stop 1) before the fix.
6. **Lab announcements.** No race in `LabShell`: the timer only restarts on a new `said`, and
   Reset cancelling a pending, superseded announcement is the intended behaviour. The waits were
   implicit, so `labs.spec.ts` now waits for an announcement on its own 15 s budget and checks
   Reset's silence after two announce delays (was a bare 800 ms).
7. **Unit timeouts.** The homePage test that renders every route and the criterionPage
   per-record tests (the first pays the first full render) get a 30 s timeout, with a comment.
8. **CSS headers.** The 26 lab section headers in swatch.css are named by component, not ticket.
9. **Instrument skeleton.** `instruments.tsx` has one `LogPanel` (titled `.alog`, a list named
   by the title, or the empty note) behind every list-style instrument; `MenuOrderInstrument` uses
   `JudgedLines`. Markup is unchanged.
10. **Action listeners.** `onActions(root, hear)` in `live/actions.ts` replaces the three
    inline `ACTION_EVENT` listeners, `hearPointer` and the real-key listener in `LiveStage`.
11. **Dependency direction (partly).** `ReaderColours`, `clippedIn` and the 1.4.5 readout lines
    (`sharpLine`, `colourLine`) moved into `src/live/` (`ReaderColours.tsx`, `clip.ts`,
    `readouts.ts`); the labs import them from there, and `labs/imagesOfText.ts` re-exports the
    two lines. Live no longer imports from any lab component file.
12. **Instrument ids.** `LiveExample.instruments` is `readonly InstrumentId[]`, the key union of
    `INSTRUMENTS` (now `as const satisfies`); the runtime `unresolvedInstruments` check stays.

Owner decisions, added to this pass:

- **Instrument vocabulary.** CONTEXT.md's "Instrument" entry lists all 20 registered ids, grouped
  under the eight shared instruments. docs/PRD.md records where #40's instrument table was not
  followed (1.4.13, 3.1.1/3.1.2, 3.2.3/3.2.4/3.2.6, 3.2.2 and 3.3.x). No renames.
- **2.4.4 Broken.** Static and live now put the titles in a separate list beside the links, so
  each link's list item says only "read more" and the example fails 2.4.4 in context (F63
  style). New caption, note and diff; new `.linkrows` layout in examples.css. Fixed is
  unchanged. No e2e or unit expectation needed changing: the links and what they announce are
  the same.
- **Static agrees with live.** 1.4.4's note and diff describe the live card's lock (each box
  held in px at its designed width and height, `overflow: hidden`) instead of `height: 48px`;
  the pass note says the boxes have no size of their own. 2.2.1's static notes use the live
  mock's two-minute limit and 20-second warning.

## Left as is

- **11, the rest.** Live still imports pure models from `labs/` (`announce`, `zoom`, `textFit`,
  `inputPurpose`, `labelInName`, `language`) and the `ZoomFrame` component. Those are the shared
  models the announcement log and zoom frame are built on; moving them is a module reshuffle
  across both trees, not a low-risk fix.
- **13.** The per-kind if-cascades in `LiveStage` `push`/`press` and `events.ts` stay, as the
  review asked.
- The 1.4.3 fade lab has no URL state, so its failing state is scanned in the lab sweep (light,
  default width) only.

## Gate

`E2E_PORT=4880 npm run verify` green on 3068cd0: typecheck, vitest 1278/1278, build, Playwright 1492/1492 (no reruns).
