# PRD — WCAG Encyclopedia redesign: Swatch

**Status:** ready-for-agent
**Design source:** `design/new-design/DESIGN-GUIDE.md`, with values from the `:root` block of `design/mockups/swatch/swatch.css` (the file wins if they disagree) and screenshots in `design/new-design/screenshots/`
**Vocabulary:** `CONTEXT.md`. Use its terms exactly.
**Decisions:** `docs/adr/0001-pre-rendered-pages-per-criterion.md`
**Supersedes:** `docs/archive/PRD-single-page.md`
**Target:** WCAG 2.2, Levels A and AA, the closed corpus of 55 criteria

---

## Problem Statement

The first build put all 55 criteria on one long scrolling page with a rail, a "You are in" strip, a mobile drawer and an in-page viewport preview. It works, but it has three problems.

1. **There's nothing to link to.** A developer resolving an audit finding wants to paste a link to one criterion into a ticket. Today that link is a fragment of a very long page, which loads everything to show one thing.
2. **It reads as a document, not a tool.** The most common accessibility question people actually have, "will this colour pair pass?", has no answer on the site except by reading.
3. **It shows, but the reader can't touch.** Fail and pass examples and timeline demos let readers watch a criterion. They can't yet change something and see it pass or fail, which is the most direct way to learn it.

## Solution

Rebuild the site in the Swatch design as separate, pre-rendered pages:

- **Home** — the colour check in the hero, then done well and done badly, the four principles, the index, a lab, the three contrast thresholds, new in 2.2, and the pledge.
- **Colour check** — the colour check at full width, with quick-start pairs and explanations of what the numbers mean and what a ratio can't tell you.
- **All criteria** — the full index with filters by principle, level and "new in 2.2", and search.
- **Criterion page**, one for each of the 55 criteria at `/criteria/<number>/` — restatement, facts, the fail and pass examples, and the diff, demo and lab where the criterion has them.
- **About** — what the site is, the accessibility statement, and a link to the source.

That's 59 pages, all rendered to static HTML at build time.

This redesign is a step towards the site's long-term direction: a fully interactive site where readers see every criterion pass and fail by changing it themselves. The redesign introduces the **Lab** and gives every criterion page a slot for one, so new labs can be added as content.

The binding constraint is unchanged: **the site obeys every criterion it documents.** Where a design choice would fail a criterion, the design changes.

## User Stories

### Finding a criterion

1. As a developer with an audit finding that cites "1.4.3", I want a page for that criterion at a stable address, so that I can resolve the ticket without reading the spec.
2. As a developer, I want to paste a criterion page's link into a PR review, so that my colleague lands on exactly that criterion.
3. As someone with an old `#1.4.3` link to the previous site, I want it to take me to the new criterion page, so that my bookmark still works.
4. As a designer who doesn't know criterion numbers, I want to search by name or by what goes wrong ("focus", "captions"), so that I can find a criterion from what I remember about it.
5. As a searcher, I want the search to match number, name, restatement and the "fails when" line, so that whatever I remember gets me there.
6. As a PM, I want to filter by level (All, A, AA), so that I can see the minimum bar separately from the AA target.
7. As a reader, I want to filter by principle, so that I can review one area at a time.
8. As a reader, I want to show only criteria new in 2.2, together with the level and principle filters, so that I can answer "what AA work did 2.2 add?".
9. As a reader who has filtered, I want a count of how many criteria are showing out of 55, announced politely, so that I know the filter is active.
10. As a reader whose filter matches nothing, I want a suggestion of what to try, so that I'm not left with a blank page.
11. As a reader, I want filter state in the URL (`?p=`, `?q=`, `?new`, and `?l=A` or `?l=AA` for a level), so that I can share a filtered view.
12. As a reader arriving from a principle card on Home, I want the index already filtered to that principle, so that the card took me where it promised.

### Understanding a criterion

13. As a developer, I want each criterion restated in plain English, so that I can understand it without the normative language.
14. As a developer, I want a breadcrumb and a facts card (principle, guideline, level, the version it arrived in, number), so that I can place the criterion in the standard.
15. As a developer, I want the fail example and the pass example side by side, labelled Broken and Fixed with glyphs as well as colour, so that I see the fix rather than infer it.
16. As a developer fixing a code-level criterion, I want the diff under the examples, so that I see the exact change.
17. As a reader of a criterion whose point is temporal, I want its demo on the criterion page, so that I can watch it happen.
18. As a reader, I want links to the other criteria in the same guideline, and previous and next in number order, so that I can move through the standard.
19. As a reader without JavaScript, I want a criterion page's restatement, facts, examples and diff to be there anyway, so that the page works as a document.

### Interacting

20. As a designer, I want to enter a text colour and a background and see them used in a realistic layout, so that I judge the pair in use, not as two swatches.
21. As a designer, I want a pass or fail verdict for every contrast threshold (body text AA, large text AA, body text AAA, borders and icons AA), so that I know exactly which use the pair is safe for.
22. As a designer whose pair fails, I want the nearest passing colour of the same hue and a button to apply it, so that I can fix it in one step.
23. As a designer, I want to swap the two colours, load common pairs, and view the preview in greyscale, so that I can explore quickly.
24. As a screen reader user, I want the colour check's verdict announced shortly after I stop changing a colour, so that I get the result without a flood of announcements.
25. As a reader, I want a ratio that's displayed truncated, never rounded up, so that 4.499 never shows as a pass.
26. As a reader of 1.4.3, I want to fade a sample text myself and watch it cross the thresholds, so that I feel where the line is.
27. As a reader of 1.4.1, 1.4.3 or 1.4.11, I want the colour check on the criterion page, so that I can try my own colours where I'm learning the threshold.
28. As someone sharing a pair, I want `?fg=` and `?bg=` on the Colour check page to load it, so that I can send a colleague the exact case.

### The site itself

29. As a keyboard user, I want a skip link, a visible 3px focus ring on everything, and no keyboard traps, so that I can use the whole site without a mouse.
30. As a screen reader user, I want correct landmarks, one h1 per page and headings in order, so that I can navigate by structure.
31. As a screen reader user, I want toggle chips to expose their pressed state, so that I know which filters are on.
32. As a screen reader user, I want broken examples hidden from me and described in words instead, so that I hear what's wrong rather than unreadable text.
33. As a low-vision reader, I want text at 4.5:1 and controls at 3:1 in both themes, so that I can read and operate everything.
34. As a colour-blind reader, I want every principle marked by a shape as well as a colour, and every pass and fail by an icon and a word, so that nothing depends on hue.
35. As a reader, I want a visible, labelled theme toggle, so that I can choose light or dark.
36. As a reader, I want the site to follow my OS theme on first visit and then remember my choice, so that it matches my system until I say otherwise.
37. As a mobile reader, I want every page to work at 320px with no sideways scrolling, so that the site works on a small phone.
38. As a reader at 200% and 400% zoom, I want nothing lost, so that zoom is a real accommodation.
39. As a touch user, I want every target at least 44 by 44px, so that I can hit it reliably.
40. As a reader with vestibular sensitivity, I want every transition stopped under reduced motion, and nothing that plays by itself, so that the site doesn't make me unwell.
41. As a sceptical reader, I want an accessibility statement saying what the site holds itself to and how it's checked, so that I can verify the claim.

### Maintenance

42. As a maintainer, I want every page built from the corpus, so that names, numbers, captions and counts never disagree between pages.
43. As a maintainer, I want a test that fails if any token pair in the Swatch palette drops below its threshold, in both themes, so that the site's central claim can't quietly rot.
44. As a maintainer, I want the data-integrity test to check every record's `since`, and that exactly six criteria are new in 2.2, so that the facts card and the filter can be trusted.
45. As a maintainer, I want to add a lab to a criterion by adding data, not layout, so that the site can keep growing towards full interactivity.
46. As a maintainer, I want an axe scan of every built page in both themes and at 320px, gating deploys, so that a regression never ships.

## Implementation Decisions

### Stack and pages

- **React + Vite + TypeScript**, kept. The mockup's `site.js` is a behaviour reference, not code to copy: its logic is ported into React components and the existing modules.
- **Pre-rendered pages.** A build step renders each page to static HTML with React and hydrates it. URLs: `/`, `/colour-check/`, `/criteria/`, `/criteria/<number>/` and `/about/`. Hosting stays GitHub Pages with a relative base, so links between pages are relative. See ADR 0001.
- **Old links.** A small script on Home sends `#<criterion number>` to `/criteria/<number>/` with `location.replace`.
- **Retired:** the single page, the rail, the strip, the drawer, principle openers, "how to read a card", the viewport preview and its container queries, the demo library index, and the old palette and fonts. Layout uses media queries at the guide's breakpoints, 1100px and 900px.

### Design

- **Only the defaults ship.** None of the guide's `data-*` style switches ship except `data-theme`. Karma is the only palette. The tweak bar and everything in guide §13 is left out.
- **Tokens.** `src/theme/tokens.ts` is rewritten from the `:root` block of `swatch.css` for both themes, with token names verbatim. The old palette is deleted.
- **Fonts.** Only Figtree (400–800) and Onest (400–700), from Google Fonts as now.
- **Theme toggle.** A single button at the end of the header, labelled "Dark theme", with `aria-pressed`, styled as a secondary button and at least 44px. It reuses `useTheme`.

### Modules

**Criteria corpus**: the record shape gains two fields.

```
{ num, name, level, guideline, since, plain, fail, pass, diff?, demo?, labs? }
```

- `since: '2.0' | '2.1' | '2.2'`: required. It drives the facts card and the "new in 2.2" filter. Six records are `2.2`: 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7 and 3.3.8.
- `labs?`: optional. A list of lab ids, in reading order, each resolved against the lab registry (`src/labs/registry.ts`). A list because 1.4.3 carries two labs. Omit it rather than leave it empty. When it's present, the criterion page shows a "Try it yourself" section.

**Contrast engine** (`src/color/contrast.ts`): kept. It already uses the 0.03928 threshold and truncates. It gains the guide's nearest-passing-colour search: mix towards black and towards white, and keep the smaller change. Ratios display truncated to two decimals in the colour check and stay truncated everywhere.

**Filter engine** (`src/catalog/filter.ts`): still a pure function, with a wider query.

```
{ principle: 'All' | 1 | 2 | 3 | 4, level: 'All' | 'A' | 'AA', newIn22: boolean, text: string }
```

The four inputs combine. Text matches number, name, restatement and the fail caption. It still returns enough for the "showing N of 55" count. On screen, the "New in 2.2" chip may sit in the level row, but it's a separate toggle.

**Labs**: interactive exhibits the reader controls directly. Two ship:
- **Colour check**: mounted in the Home hero, at full width on the Colour check page, and on the 1.4.1, 1.4.3 and 1.4.11 criterion pages.
- **Fade the text**: on the 1.4.3 criterion page and in the Home lab section, titled "Try it: fade the text".

Each lab announces changes through a polite live region. The colour check delays its verdict by 500ms on purpose.

**Demo timeline runtime and player**: unchanged. Each of the nine demos appears on its criterion page in its own section below the examples, never inside a stage.

### Criterion page anatomy, in order

1. Breadcrumb (Home / Criteria / current)
2. Head: meta line, h1, restatement, and the facts card with "In WCAG since"
3. **Broken, then fixed**: the fail example and the pass example in the two stages, with their captions
4. **What changed in the code**: the diff at full width, when present
5. **Watch it happen**: the demo, when present
6. **Try it yourself**: the lab, when present
7. **Also in guideline X.Y**: up to six index cards. A criterion that is alone in its guideline gets "More from {principle}" instead: up to six cards from the same principle
8. Pager: previous and next by number

Labs never replace the fail and pass examples. Every criterion keeps both.

### Content

- **Home** follows the guide's §9.1 sections in order. Only the lab section's title changes.
- **About**: what the site is, an accessibility statement (the pledge in full, plus how it's tested: the axe gate and the contrast audit), and a link to the GitHub repository. The footer's About, Accessibility statement and Source code links point there.
- **AAA** appears only as a clearly labelled result, as in the colour check's "Body text AAA, 7:1 (1.4.6)". There are no AAA criterion pages, and nothing links to 1.4.6 as if it were in the corpus.
- **Contrast requirements are thresholds.** On-screen copy says "Three contrast thresholds", not "rules".
- **Measured ratios** on colour pairs and labs are computed by the contrast engine from the colours rendered, never typed in.
- All criterion text comes from the corpus. Nothing is retyped into components.

## Testing Decisions

Tests check behaviour a reader or maintainer would notice, never internal structure. Component rendering isn't unit-tested; the axe scan and visual checks cover it.

1. **Token contrast audit**, rebuilt for Swatch. Every pair in guide §3.4, in both themes, including control borders on cards in the dark theme (3.7:1, the tightest pair). Failures name the pair and the measured ratio.
2. **Data integrity.** As before, plus `since` is valid on every record, exactly six records are `2.2`, and every `labs` reference resolves.
3. **Filter engine.** Each input on its own, combinations (for example AA and new in 2.2), search across all four fields, counts matching results, and an empty query returning all 55.
4. **Contrast engine.** The nearest passing colour reaches 4.5:1 and is the smaller of the two changes, and truncation never turns a fail into a pass (4.499 shows 4.49).
5. **`frameAt`**, unchanged.
6. **Axe scan** of all 59 built pages in both themes and at 320px, against WCAG 2.0, 2.1 and 2.2 A and AA plus best-practice rules, with zero violations. It gates deploys, as now.
7. **Visual check.** Agents compare each page with the guide's screenshots in both themes at 1440px and 390px. This is a review step, not an automated pixel test.

## Delivery

- Work on the `redesign` branch, cut from `main` after `fix/dependency-audit` is merged. The old site stays deployed from `main` until cutover.
- The task graph is `scripts2/prd-redesign.json`. Its bibles are `CONTEXT.md`, `design/new-design/DESIGN-GUIDE.md` and this PRD, and its verify command is `npm run verify`.
- The slices:

| # | Slice | Blocked by |
|---|---|---|
| R-01 | Walking skeleton: Swatch tokens and contrast audit, fonts, header, footer, theme toggle, pre-render step, one 1.4.3 criterion page, axe on it | — |
| R-02 | `since` and `labs?` on all 55 records, data-integrity test | R-01 |
| R-03 | All 55 criterion pages, full anatomy, `#number` redirect | R-02 |
| R-04 | Filter engine: principle, level, new in 2.2, wider search | R-02 |
| R-05 | All criteria page | R-03, R-04 |
| R-06 | Colour check lab, Colour check page, mounted on 1.4.1, 1.4.3 and 1.4.11 | R-03 |
| R-07 | Fade-the-text lab on 1.4.3 | R-03 |
| R-08 | Home page | R-05, R-06, R-07 |
| R-09 | About page | R-01 |
| R-10 | Delete retired modules | R-08 |
| R-11 | Cutover: merge into `main` and deploy | R-10, plus the owner's visual sign-off |

- Every slice is AFK except R-11, the one human gate: a visual review of the whole site before cutover.

## Every criterion interactive

Issue #40 extends this PRD: every criterion gets at least one lab, and ten get a flagship lab
(1.1.1, 1.3.1, 1.4.3, 1.4.10, 1.4.12, 2.2.1, 2.4.3, 2.4.7, 2.5.8 and 4.1.2). Its task graph is
`scripts2/prd-labs.json`.

- **One lab shell.** Every lab renders in the shell: the mock, a controls row, exactly one
  verdict line ("1.4.3 fails", with a glyph and the criterion number), a Reset button, and one
  polite live region set 500 ms after the reader's last change. Changes the reader didn't make,
  including Reset and URL preloads, are never announced. The colour check and fade-the-text are
  in it.
- **Motion.** `--speed` (0.15s) stays for hover and press. `--speed-state` (0.3s, ease-out) is
  for lab and stage state changes. Only opacity, transform and colour animate. A verdict flip
  settles with a small scale and colour change, never a shake or bounce. Under
  `prefers-reduced-motion: reduce` or `data-motion="off"` every change is instant. The design
  guide's §7 holds the full rules.
- **Coverage.** The data-integrity test fails when any criterion has no lab or lacks live fail
  and pass examples, and asserts the flagship set exactly. (During the build a to-come list
  that only shrinks held the exceptions; it was removed once it emptied, #67.)

## Out of Scope

- **Auditing someone's site.** The colour check checks one pair; the site doesn't scan pages, generate VPATs or produce conformance reports.
- **AAA as a complete set.** AAA appears only as labelled results.
- **WCAG 2.0 and 2.1 version switching.** `since` is shown as a fact, not as a way to browse versions.
- **The tweak bar, extra palettes and style switches.**
- **The viewport preview and the demo library index.**
- **A search results page.** Search filters the index in place.
- **Video files, audio, a backend, analytics, i18n and a print stylesheet**, as before.
- **Photography.** If it's added later, any text over it needs a solid backing.

## Further Notes

- **R-01 carries the risk.** The pre-render step and hydration are the new infrastructure; everything else is components and content on top. Prove it end to end on one criterion page before building the rest.
- **The tightest contrast pair is the one to watch.** Control borders on cards in the dark theme are 3.7:1. Don't darken `--line-2` or lighten `--card-bg` without re-running the audit.
- **The lab slot is the most important decision for the long term.** Keep the `labs?` contract small and data-driven, so that building towards a fully interactive site means writing labs, not redesigning criterion pages.
