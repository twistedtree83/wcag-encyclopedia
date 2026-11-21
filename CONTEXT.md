# CONTEXT — WCAG Encyclopedia domain model

The vocabulary of this project. Use these words exactly; they map one-to-one onto types and
modules. If you need a noun that isn't here, stop and ask rather than inventing one.

---

## The standard

**Principle** — one of the four top-level divisions of WCAG: Perceivable, Operable,
Understandable, Robust. Numbered 1–4. Each has an accent hue *and* a marker shape, so the
grouping survives greyscale.

**Guideline** — a subdivision of a principle, e.g. `1.4 Distinguishable`. There are thirteen.
Identified by a dotted pair.

**Criterion** (plural **criteria**) — a success criterion, e.g. `1.4.3 Contrast (Minimum)`.
Identified by a dotted triple, which is also its URL fragment and its React key. Never call
these "rules", "guidelines", or "requirements" — those words mean other things here.

**Level** — `A`, `AA`, or `AAA`. The conformance level of a criterion.

**Threshold** — a minimum contrast ratio a criterion sets: 4.5:1 for body text and 3:1 for large
text (1.4.3), 7:1 for enhanced text (1.4.6), 3:1 for borders, icons and controls (1.4.11). One
criterion can carry more than one threshold. Never call a threshold a "rule".

**Corpus** — the complete set of criterion records the site documents. Closed at **55**: every
Level A and AA criterion in WCAG 2.2. Twenty Perceivable, twenty Operable, thirteen
Understandable, two Robust. WCAG 2.2 removed `4.1.1 Parsing`; its absence is correct and the
data-integrity test asserts the exact set.

---

## Content

**Criterion record** — the typed data for one criterion. The unit of authoring. Shape:

```
{ num, name, level, guideline, since, plain, fail, pass, diff?, demo?, lab? }
```

**Since** — the WCAG version that introduced a criterion: `2.0`, `2.1` or `2.2`. Six criteria in
the corpus are new in 2.2.

**Restatement** (`plain`) — the criterion in plain English. Original prose, never W3C normative
text copied across.

**Example** — a rendered piece of interface, not a description of one. Every criterion has a
**fail example** and a **pass example**. On screen these are labelled "Broken" / "Fixed" on
criterion pages and "Badly" / "Well" on colour pairs; those words are copy, not terms.

**Colour check** — the tool that measures one text colour against one background against every
contrast threshold, shown in a realistic preview drawn in the two colours. It checks a pair, not
a site.

**Caption** — the one line under an example naming the single thing that is wrong, or the single
thing that changed. Not a summary of the criterion.

**Diff** — the optional markup or CSS diff beneath the visual, for criteria whose point is
code-level. Changed lines carry `-` / `+` glyphs *as well as* tint, so the diff reads in
greyscale.

**Measured ratio** — a contrast ratio displayed on an example. Always computed from the colours
the example actually renders, by the contrast engine. Never a literal in content data.

---

## Demos

**Demo** — an animated illustration of a criterion whose point is temporal: focus moving, a
screen reader announcing, a layout reflowing. There are nine. They are code-driven, silent,
looping, captioned. They are **not video files** — never introduce `<video>` or a media asset.

**Timeline** — how a demo is authored: an ordered list of keyframes.

**Keyframe** — one entry in a timeline, carrying a timestamp `t`, a visual state, and a caption.
Captions live on keyframes so they cannot desynchronise from the visuals.

**`frameAt(timeline, t)`** — the runtime. A **pure** function returning the state and caption in
effect at time `t`. This is the only path to the screen: pause is "stop advancing `t`", scrub is
"set `t`", loop is "`t` modulo duration", reduced motion is "do not auto-advance". If you are
writing a second rendering path, the abstraction has been broken.

**Player** — the shell that binds a timeline to the DOM: 16:9 chrome-less browser mock, caption
line, and transport row. One player, nine timelines.

**Lab** — an interactive exhibit the reader controls directly, such as dragging a slider that
fades text until it fails 1.4.3. Distinct from a demo: a demo plays a timeline, a lab responds
to the reader. A lab adds to a criterion's fail and pass examples and never replaces them. The
colour check is a lab. Labs are the site's long-term direction: the aim is for readers to see each
criterion pass and fail by changing it themselves.

---

## The page

**Criterion page** — the page for one criterion: its restatement, facts, fail and pass
examples, and any diff, demo or lab. The unit people link to.

**Index card** — the short linked summary of a criterion (number, name, level, the "fails when"
line) used in the index and in "Also in this guideline" lists. It leads to the criterion page.

**Token** — a CSS custom property in one of the two theme palettes. Token names and values come
from the `:root` block of `design/mockups/swatch/swatch.css` verbatim, so the design and the
build stay diffable.

---

## Testing

**Token contrast audit** — the test enumerating every foreground/background token pair that
actually occurs, in both themes, asserting 4.5:1 for body text and 3:1 for UI and large text.
The site's central claim; the only one that rots silently.

**Data-integrity test** — asserts every criterion record is complete and that the corpus is
exactly the 55 A/AA criteria.

**Axe scan** — Playwright plus axe-core against every built page, in both themes and at 320px.

**Verify gate** — `npm run verify`: types, unit tests, build, axe. The single gate. Never
commit red.

---

## Standing constraints

- **The page obeys every criterion it documents.** Where a design choice would fail a criterion
  on the page, the design changes. This outranks visual fidelity.
- **Nothing is carried by hue alone**, anywhere, including in the site's own chrome.
- **No backend.** Static build. The only persisted state is the theme preference.
- **English only.** No i18n layer.
