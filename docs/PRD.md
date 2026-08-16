# PRD — Visual Encyclopedia of WCAG 2.2

**Status:** ready-for-agent
**Design source:** Claude Design project `9c75b172-e8d4-4707-9850-61a2d5b18621` — `WCAG Encyclopedia.dc.html`
**Target:** WCAG 2.2, Levels A and AA complete (55 success criteria)

---

## Problem Statement

The Web Content Accessibility Guidelines are the standard that designers, front-end engineers, and PMs are held to — by procurement, by legal, and increasingly by their own users. But the spec is written for conformance testing, not for learning. Someone who needs to satisfy Level AA faces a wall of nested normative prose, cross-referenced techniques documents, and criterion names like "Non-text Contrast" that give no clue what they look like when violated.

The result is a predictable failure mode. Teams read the criterion, believe they understand it, and ship the violation anyway — because they have never *seen* one. A developer can recite that links must not rely on colour alone and still ship blue-text-only links, because the rule lived as a sentence, never as an image of the sentence being broken.

The existing free resources split badly. The spec itself is authoritative but unreadable. Checklist sites are readable but reduce each criterion to a single line with no example. Tooling like axe reports violations in code but explains nothing about why the rule exists or what "fixed" looks like. Nothing shows the failing interface and the passing interface next to each other, at a glance, for every criterion.

There is a second, quieter problem: accessibility reference material is very often itself inaccessible. Guides about contrast published in grey-on-grey; guides about keyboard access with focus outlines suppressed. This undermines the material's authority in exactly the way that matters most.

## Solution

A single, long-scrolling reference site that renders every Level A and AA success criterion in WCAG 2.2 as a **card** — criterion number, short name, conformance badge, a plain-English restatement, and a paired FAIL / PASS example rendered as live interface rather than described in prose.

Three structural levels, visually distinct:

1. **Four principles** (Perceivable, Operable, Understandable, Robust) — each a full-bleed chapter opener with its own accent hue, ordinal, and one-sentence definition.
2. **Thirteen guidelines** nested under them — 1.1 Text Alternatives through 4.1 Compatible.
3. **Success criteria** inside each guideline, as cards.

Three kinds of evidence sit on a card, chosen per criterion:

- **Pure visual** — where the point is perceptual (contrast, use of colour, spacing), the rendered fail/pass pair carries it alone.
- **Markup diff** — where the point is code, a `-`/`+` diff sits beneath the visual, marked with glyphs as well as tint so it reads without colour.
- **Demo** — where the point is *temporal* (focus moving, a screen reader announcing, a layout reflowing), a scrubbable animated demo.

Nine demos are code-driven animations, not video files. Every demo is a deterministic function of a timeline position, so play, pause, scrub, loop, and `prefers-reduced-motion` all fall out of the same mechanism, the animation stays crisp at 400% zoom, and it re-themes with the page.

Navigation is a sticky header (search, conformance-level filter, viewport preview, theme toggle) over a left rail listing all thirteen guidelines grouped by principle, tracking scroll position. Every criterion is deep-linkable by its number.

The binding constraint: **the page obeys every criterion it documents.** Where a design choice would fail a criterion on the page, the design changes.

## User Stories

### Finding and orienting

1. As a developer with an audit finding that cites "1.4.3", I want to jump straight to that criterion by its number, so that I can resolve a ticket without reading the spec.
2. As a developer, I want every criterion card to have a stable deep link at its criterion number, so that I can paste a link into a PR review and my colleague lands on the exact card.
3. As a designer who does not know criterion numbers, I want to search by name, so that I can find "contrast" without knowing it lives at 1.4.3.
4. As a searcher, I want the search to match on both number and name, so that either half of what I remember gets me there.
5. As a PM scoping compliance work, I want to filter the page to Level A only, so that I can see the minimum bar separately from the AA target.
6. As a PM, I want to filter to Level AA, so that I can review exactly the criteria our procurement commitment names.
7. As a reader who has filtered, I want a visible count of how many criteria are showing versus the total, so that I know the filter is active and how much it hid.
8. As a reader deep in the page, I want a persistent indicator of which principle and guideline I am currently inside, so that I never lose the hierarchy while scrolling.
9. As a reader, I want the left rail to highlight my current guideline as I scroll, so that I can see my position in the whole standard at a glance.
10. As a reader, I want to click any guideline in the rail and land on it, so that I can move around the standard without scrolling.
11. As a reader arriving at a principle, I want an opener that names the principle, gives its ordinal, and states its point in one sentence, so that I understand the category before reading its criteria.
12. As a reader on a principle opener, I want the list of that principle's guidelines with links, so that I can choose where to go next.
13. As a first-time visitor, I want a short "how to read a card" section before the content starts, so that the fail/pass convention is explained before I need it.
14. As a returning visitor, I want the page structure to be stable between visits, so that a link I bookmarked still resolves.

### Understanding a criterion

15. As a developer, I want each criterion restated in plain English, so that I can understand the requirement without parsing normative language.
16. As a developer, I want to see a failing example rendered as real interface, so that I can recognise the violation in my own product.
17. As a developer, I want the passing example beside the failing one, so that I can see the fix rather than infer it.
18. As a reader, I want a one-line caption under each example naming the single thing that changed, so that I know what to take away.
19. As a developer fixing a code-level criterion, I want a markup or CSS diff, so that I can see the precise change rather than guess at it.
20. As a colour-blind reader, I want the diff to mark changed lines with `-` and `+` glyphs as well as tint, so that I can read the diff without distinguishing red from green.
21. As a reader, I want the conformance level badge to differ in shape and glyph as well as colour, so that I can tell A from AA without relying on hue.
22. As a developer, I want measured contrast ratios shown on contrast examples, so that I can see the actual number rather than trust an assertion.
23. As a maintainer, I want those displayed ratios computed from the colours actually rendered, so that a colour change can never leave a stale number on the page.
24. As a reader scanning the page, I want criterion numbers set in tabular monospace, so that they align down the page and I can scan them as a column.
25. As a reader, I want fail frames and pass frames to be visually distinct at a glance through border, glyph, and label, so that I never mistake one for the other.

### Demos

26. As a sighted developer who has never used a screen reader, I want to watch one announce an unlabelled icon button versus a labelled one, so that I understand what a missing accessible name actually costs.
27. As a developer, I want to watch keyboard focus traverse a checkout form with a visible focus ring, so that I can see what correct focus behaviour looks like.
28. As a developer, I want to watch the same traversal with focus styles removed, so that I can feel the disorientation of losing the cursor.
29. As a designer, I want to watch a page reflow from 1280px to 320px without horizontal scroll, so that I understand what 1.4.10 is asking for.
30. As a developer, I want to watch a form submit with a generic "invalid input" error versus inline, named, linked errors, so that I understand the difference 3.3.1 makes.
31. As a developer, I want to watch a live region announce an asynchronous cart update, so that I understand when `aria-live` is required.
32. As a designer, I want to see tap targets at 18px versus 24px with a fingertip overlay, so that 2.5.8 becomes a physical fact rather than a number.
33. As a developer, I want to watch a sticky header obscure a focused element and then see `scroll-padding` fix it, so that I understand 2.4.11.
34. As a developer, I want to watch an autoplaying carousel beside one with a pause control, so that I understand 2.2.2.
35. As a reader, I want to pause a demo, so that I can study a single moment.
36. As a reader, I want to scrub a demo to any point on its timeline, so that I can re-watch the instant that mattered.
37. As a reader, I want the scrub position and total duration shown numerically, so that I can return to the same moment.
38. As a reader, I want demos to loop silently, so that nothing plays audio at me unexpectedly.
39. As a deaf or hard-of-hearing reader, I want captions on by default under every demo, so that I get the same information without audio.
40. As a keyboard user, I want every demo control reachable and operable by keyboard, so that I can use the demos without a mouse.
41. As a user with vestibular sensitivity, I want demos to respect `prefers-reduced-motion` and not auto-play, so that the page does not trigger symptoms.
42. As a reader at 400% zoom, I want demo content to stay sharp, so that I can actually see what is being demonstrated.
43. As a dark-theme reader, I want demos to render in the dark palette, so that a demo does not flash a bright rectangle at me.

### Accessibility of the page itself

44. As a keyboard user, I want a skip link as the first focusable element, so that I can bypass the header and rail.
45. As a keyboard user, I want a visible focus indicator on every interactive element, so that I always know where I am.
46. As a screen reader user, I want correct landmarks and an unskipped heading hierarchy, so that I can navigate by structure.
47. As a screen reader user, I want the filter and viewport controls to expose their pressed state, so that I know which option is active.
48. As a low-vision reader, I want all body text at 4.5:1 or better and all UI at 3:1 or better, in both themes, so that I can read the page.
49. As a reader, I want no information carried by hue alone anywhere on the page, so that the page is usable in greyscale.
50. As a mobile reader, I want full functionality at 320px with no horizontal scrolling, so that the page works on a small phone.
51. As a mobile reader, I want the navigation available in a drawer, so that I can move between guidelines without a rail.
52. As a touch user, I want every control to be at least 44px, so that I can hit it reliably.
53. As a reader in a bright room, I want a light theme; as a reader at night, I want a dark theme, so that I can read comfortably either way.
54. As a reader, I want my theme choice to persist across page loads, so that I do not re-select it every visit.
55. As a reader whose OS is set to dark mode, I want the page to open in dark mode by default, so that it matches my system.
56. As a reader at 200% zoom, I want full behaviour with no loss of content or function, so that zoom is a real accommodation.
57. As a screen reader user, I want the current-position indicator to not spam announcements as I scroll, so that the page stays usable.

### Teaching devices

58. As a designer, I want to preview the page itself at tablet and 320px widths from a control in the header, so that I can watch reflow happen without resizing my browser.
59. As a reader using the viewport preview, I want the whole page — not just the examples — to respond to it, so that the preview is honest.
60. As a sceptical reader, I want an explicit statement of which rules the page holds itself to, so that I can verify the claim rather than take it on faith.

### Maintenance

61. As a maintainer, I want every criterion stored as structured data rather than hand-written markup, so that adding or editing a criterion does not mean editing layout.
62. As a maintainer, I want the rail, the filters, the counts, and the sections all derived from one source, so that they can never disagree.
63. As a maintainer, I want a test that fails when any token pair drops below its required contrast ratio, so that the page's central claim cannot silently rot.
64. As a maintainer, I want a test that fails when a criterion is missing a plain-English restatement or a fail/pass pair, so that incomplete content cannot ship.
65. As a maintainer, I want an automated accessibility scan in CI, so that a regression is caught before merge.
66. As a maintainer, I want demos authored as declarative timelines rather than imperative animation code, so that adding a demo does not mean writing a new player.

## Implementation Decisions

### Stack

- **Vite + TypeScript**, building to a static site. No server, no runtime data fetching. Deployable to any static host.
- **Data-driven rendering.** All 55 criteria live as typed data; card markup is rendered from that data by one component. Hand-authoring 55 cards of markup was rejected — it guarantees drift between the rail, the filter counts, and the sections, and makes the content unreviewable.
- The imported design file is the **visual source of truth**. It specifies the token palettes, type scale, card anatomy, and one fully-composed instance of every card variant (pure-visual, markup-diff, demo). Guideline 1.4 is the exemplar; the remaining twelve guidelines are built to match it.
- The design's inline-style-plus-CSS-variable approach converts to real stylesheets. Token names carry over verbatim so the design and the build stay diffable.

### Modules

**Criteria corpus** — the full A/AA content set as typed records, one per criterion, grouped by guideline and principle. Deep module: a large body of content behind a small read interface (list all, get by number, get by guideline, get by principle). The one place content is edited. Record shape, carried over from the design:

```
{ num: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', guideline: '1.4',
  plain: '…',                    // plain-English restatement
  fail: { render, caption },     // what's wrong
  pass: { render, caption },     // what changed
  diff?: { lines, note },        // optional markup diff
  demo?: DemoId }                // optional linked demo
```

**Contrast engine** — WCAG relative luminance and contrast ratio, as pure functions over colour values. Small, total, no dependencies. Serves two consumers: the token audit test, and the on-card "7.4:1 measured" badges. Those badges are **computed from the colours actually rendered in the example**, never typed by hand — this is what makes user story 23 hold.

**Theme tokens** — the two palettes as data, emitted as CSS custom properties at build time. One source of truth, consumed by the stylesheet and by the contrast audit. Both palettes are defined in full; the dark palette redefines tokens only, never introduces a colour that has no light counterpart.

**Filter engine** — a pure function `(criteria, { level, query }) → criteria[]`. No DOM, no state. Level filter and text search compose. Search matches against number and name. Returns enough for the "showing N of M" count. Testable without a browser.

**Demo timeline runtime** — the key extraction. A demo is authored as a declarative timeline: an ordered list of keyframes, each carrying a timestamp, a visual state, and a caption. The runtime is a pure function `frameAt(timeline, t) → { state, caption }`. Playback is a thin shell that advances `t` and re-renders.

```
timeline: [ { t: 0,   focus: '#name',  caption: 'Tab moves to the name field' },
            { t: 1.4, focus: '#card',  caption: 'Focus ring follows to card number' },
            … ]
scrub input → setT(4.2) → frameAt(timeline, 4.2) → render
```

Everything else reduces to this: **pause** is "stop advancing `t`", **scrub** is "set `t` directly", **loop** is "`t` modulo duration", **reduced motion** is "do not auto-advance; the scrub bar still works", and captions come from the same structure that drives the visuals, so they cannot desynchronise. Adding a demo means writing a timeline, not writing animation code.

**Demo player** — the shell binding a timeline to the DOM: 16:9 chrome-less browser mock, caption line, transport row (play/pause at 44px minimum, scrub range input with a visually-hidden label, elapsed/total readout, CC indicator). One player, nine timelines.

**Scroll-spy** — IntersectionObserver over guideline sections yielding the current guideline, driving the rail markers and the "You are in" strip. Announcements are suppressed for screen readers (user story 57); the strip is decorative-with-text, not a live region.

**App shell** — header, rail, mobile drawer, viewport preview frame.

### Specific decisions

- **Container queries, not media queries**, for anything inside the viewport preview frame. The frame sets `container-type: inline-size` and a fixed width; content sizes against the container so the preview is honest (user story 59). The design already uses `cqw` units in its `clamp()` calls and this carries over.
- **Viewport preview is a production feature, not a design-tool affordance.** For a page teaching reflow, letting the reader shrink the page in place is a teaching device. Selecting 320px opens the drawer, matching the design.
- **Theme:** defaults to the OS setting via `prefers-color-scheme`, overridable by the toggle, persisted to `localStorage`. An explicit choice always wins over the system setting, in both directions.
- **Level filter** is single-select (All / A / AA) with `aria-pressed`, matching the design. AAA is not a filter option; AAA criteria appear inline only where they change a common pattern, and are labelled as such.
- **Deep links** use the bare criterion number as the fragment (`#1.4.3`). Cards carry `scroll-margin-top` so the sticky header never obscures the target — the page passes 2.4.11 by the same mechanism it documents.
- **A criterion hidden by a filter is removed from the accessibility tree**, not just visually hidden, so screen reader and visual users see the same set.
- **Nine demos**, matching the design's count: the composed reflow demo (1.4.10) plus the eight in the demo library. Each is reachable both from its criterion card and from the demo library index.
- Content is written from the W3C's normative text but **restated, not reproduced** — plain-English paraphrase plus original examples.

## Testing Decisions

**What makes a good test here:** tests assert external behaviour — what a reader or maintainer would notice — never internal structure. A test that breaks when a component is renamed but the page still renders correctly is a bad test. The four deep modules above were extracted precisely because they can be tested as pure functions with no DOM, no snapshots, and no mocking.

This is a greenfield repository; there is no prior art. These tests establish it. Vitest for unit tests; Playwright plus axe-core for the browser-level scan.

**1. Contrast assertions on every token pair.** Enumerate every foreground/background token combination that actually occurs in the design, in both themes, and assert the required ratio — 4.5:1 for body text, 3:1 for UI components and large text. This is the page's central claim and the only one that rots silently when a colour changes. Failure output names the pair and the measured ratio. Covers stories 48, 63.

**2. Criteria data integrity.** For every record: a non-empty plain-English restatement; both a fail and a pass example with captions; a valid level; a guideline number that resolves to a real guideline; a unique criterion number. Plus a completeness check — the corpus contains exactly the Level A and AA criteria of WCAG 2.2, no more and no fewer, so a missing criterion is a test failure rather than a gap nobody notices. Covers stories 62, 64.

**3. Filter and search behaviour.** Pure-function tests over the filter engine: level filter returns only that level; search matches on number and on name; the two compose; the returned count matches the returned list; an empty query returns everything. Covers stories 3–7.

**4. Automated axe-core scan.** Playwright loads the built page and runs axe in both themes and at 320px, failing on any violation. This catches the regressions the unit tests structurally cannot — landmark and heading-order problems, missing accessible names, ARIA misuse. Covers stories 44–52, 65.

**Also tested, following from the timeline extraction:** `frameAt` is a pure function and gets unit tests — the caption at a given `t` is the caption whose keyframe is in effect, timeline positions clamp at both ends, and looping wraps correctly. This is cheap and it protects the caption/visual synchronisation that user story 39 depends on.

**Not unit-tested:** component rendering. The axe scan plus visual review of the built page covers it, and snapshot tests of markup would break on every legitimate design change.

## Out of Scope

- **Level AAA criteria as a complete set.** AAA appears only where it changes a common pattern, and is labelled. Full AAA coverage would roughly double the corpus for an audience that mostly does not target it.
- **WCAG 2.0 and 2.1 version switching.** The page documents 2.2. Prior versions are a subset and are not separately navigable.
- **Conformance tooling.** This is a reference, not a scanner. It does not audit the reader's site, generate VPATs, or produce conformance reports.
- **Real video files.** Demos are code-driven animations. No MP4/WebM assets, no capture pipeline, no ffmpeg dependency.
- **Audio.** Demos are silent by design. Screen reader announcements are rendered as visible text bubbles, not synthesised speech.
- **Internationalisation.** English only. The page declares its language correctly, but there is no translation layer.
- **Search across techniques and understanding documents.** Search covers criterion numbers and names, not full body text.
- **A backend.** No accounts, no persistence beyond the local theme preference, no analytics.
- **Print stylesheet.**

## Further Notes

- **The demo timeline is the highest-risk module and the highest-leverage one.** If it lands well, eight of the nine demos are content authoring. If it is designed poorly — for instance by making playback imperative rather than a function of `t` — then scrubbing, reduced-motion, and caption sync each become separate problems solved nine times. It should be built and proven against one demo before the other eight are authored.
- **The dark palette needs auditing at the same time as the light one, not after.** Retrofitting a dark theme onto a page that claims contrast compliance is how that claim gets broken. The design supplies both palettes in full; test both from the first commit.
- **The contrast engine feeding the on-card badges is a small decision with an outsized payoff.** A page that displays "7.4:1 measured" next to a colour it does not actually measure is exactly the credibility failure described in the problem statement.
- **Content volume is the real cost.** 55 criteria × (restatement + fail example + pass example + captions) is the bulk of the work, and it is not parallelisable in the way the infrastructure is. The corpus should be built guideline by guideline, each guideline shippable, rather than all-at-once.
- The design's rail note — "Level A and AA are documented in full. AAA criteria appear where they change a common pattern" — is a promise to the reader and should be treated as a spec line, not decoration.
