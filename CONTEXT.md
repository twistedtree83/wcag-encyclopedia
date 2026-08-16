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

**Corpus** — the complete set of criterion records the site documents. Closed at **55**: every
Level A and AA criterion in WCAG 2.2. Twenty Perceivable, twenty Operable, thirteen
Understandable, two Robust. WCAG 2.2 removed `4.1.1 Parsing`; its absence is correct and the
data-integrity test asserts the exact set.

---

## Content

**Criterion record** — the typed data for one criterion. The unit of authoring. Shape:

```
{ num, name, level, guideline, plain, fail, pass, diff?, demo? }
```

**Restatement** (`plain`) — the criterion in plain English. Original prose, never W3C normative
text copied across.

**Example** — a rendered piece of interface, not a description of one. Every criterion has a
**fail example** and a **pass example**.

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

---

## The page

**Card** — the rendered unit for one criterion: number, name, level badge, restatement,
fail/pass pair, and optionally a diff or a demo.

**Rail** — the left navigation listing all thirteen guidelines grouped by principle, tracking
scroll position.

**Strip** — the "You are in" line showing the current principle and guideline. Decorative
text, deliberately **not** a live region — it must not announce on scroll.

**Principle opener** — the full-bleed chapter heading introducing a principle.

**Drawer** — the mobile replacement for the rail.

**Viewport preview** — the in-page control rendering the site at desktop / tablet / 320px
widths. A production teaching device, not a design-tool leftover. It is why layout uses
**container queries** rather than media queries: content sizes against its container, not the
browser window.

**Token** — a CSS custom property in one of the two theme palettes. Token names come from the
design file verbatim so the design and the build stay diffable.

---

## Testing

**Token contrast audit** — the test enumerating every foreground/background token pair that
actually occurs, in both themes, asserting 4.5:1 for body text and 3:1 for UI and large text.
The site's central claim; the only one that rots silently.

**Data-integrity test** — asserts every criterion record is complete and that the corpus is
exactly the 55 A/AA criteria.

**Axe scan** — Playwright plus axe-core against the built page, in both themes and at 320px.

**Verify gate** — `npm run verify`: types, unit tests, build, axe. The single gate. Never
commit red.

---

## Standing constraints

- **The page obeys every criterion it documents.** Where a design choice would fail a criterion
  on the page, the design changes. This outranks visual fidelity.
- **Nothing is carried by hue alone**, anywhere, including in the site's own chrome.
- **No backend.** Static build. The only persisted state is the theme preference.
- **English only.** No i18n layer.
