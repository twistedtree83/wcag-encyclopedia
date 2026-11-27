# CONTEXT — WCAG Encyclopedia domain model

The vocabulary of this project. Use these words exactly; they map one-to-one onto types and
modules. A task that needs a noun that isn't here adds it, with a one-line definition, in the
same commit (see `scripts2/RALPH_PROMPT.md`).

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
{ num, name, level, guideline, since, plain, gist?, fail, pass, procedure, questions, diff?, demo?, labs? }
```

**Since** — the WCAG version that introduced a criterion: `2.0`, `2.1` or `2.2`. Six criteria in
the corpus are new in 2.2.

**Restatement** (`plain`) — the criterion in plain English. Original prose, never W3C normative
text copied across.

**Gist** (`gist`) — the restatement cut to one short sentence, used only for the page's
description in search results, and only on records whose restatement opens with a sentence too
long to share that description with the fail caption. Original prose, like the restatement.

**Test procedure** (`procedure`) — the ordered steps a reader follows to check their own
interface against a criterion. On the page it is headed "How to test". Not the site's own tests.

**Common question** (`questions`) — a question people ask about a criterion, with a short
answer. On the page they are headed "Common questions". Every criterion record has at least one.

**Example** — a rendered piece of interface, not a description of one. Every criterion has a
**fail example** and a **pass example**. On screen these are labelled "Broken" / "Fixed" on
criterion pages and "Badly" / "Well" on colour pairs; those words are copy, not terms.

**Live example** — an example the reader can operate: tab through it, hover it, submit it. It
lets the reader *experience* the failure or the fix as a user would, but not change how it is
built — changing it is a lab's job. A live example reads fully as a static example before any
script runs, and its caption is true in both states. The fail and pass examples stay side by side;
neither turns into the other in place. In a live fail example the reader operates the failure
through simulated input; in a live pass example they operate it for real.

**Simulated input** — how a reader operates a depicted failure: buttons such as "Press Tab",
"Hover" or "Read it aloud" that move a drawn focus ring or cursor and write to the instruments,
while the broken interface itself stays inert and hidden from assistive technology. The failure is
experienced without ever being committed against a real keyboard or screen-reader user.

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
colour check is a lab. Every criterion has at least one lab: readers see each criterion pass and
fail by changing it themselves. The motion a lab shows is the reader's change taking effect —
never something that plays on its own.

**Lab folder** — `src/labs/<name>/`: one lab (or the few that share a component file) with its
component, models, query module, `lab.ts` registration and `lab.css`. The registry finds it
by its `lab.ts`; `src/labs/shared/` holds the parts every lab uses and is not a lab folder.

**Verdict** — the line in a lab stating whether the lab's current state passes or fails, naming
the criterion by number and carrying a glyph as well as colour: "1.4.3 fails". Every lab has
exactly one, and it is announced politely after the reader stops changing things.

**Flagship lab** — a lab with more depth than crossing the pass/fail line once: several
thresholds, presets, or markup the reader edits. A handful of criteria have one; every other lab
only has to let the reader cross the line at least once.

**Instrument** — a reusable part that labs are built from and that readers learn to recognise
across criteria: the announcement log, the focus tracker, the zoom frame, the vision filter, the
clock, the gesture pad, the mock player and the mock site. One instrument, many labs.

Under a live example the instruments are registered by id (`src/live/instruments.tsx`), grouped
here with the eight they belong to:

- Announcement log: `announcement-log`, what a screen reader says; `voice-log`, the same lines
  naming the voice (language) each is read in.
- Focus tracker: `focus-tracker`, the Tab stops, where focus is and its trail; `key-log`, the
  last key sent, where focus was and what it set off; `pointer-log`, where the pointer went and
  what the tooltip did; `context`, every page the example has shown and what moved it there.
- Zoom frame (drawn by the stage, not registered): `zoom-meter`, the zoom, window and what
  scrolls; `text-fit`, text size, spacing and whether a box clips; `orientation-meter`, the way
  up and whether content shows; `text-look`, how sharp the heading is and whether it takes the
  reader's colours.
- Vision filter: `vision-filter`, the filter on and whether each colour cue still stands out.
- Clock: `clock`, the mock time and each change the example made on it.
- Gesture pad: `gesture-pad`, the last gesture drawn over the targets; `voice-control`, the
  last voice command and what it clicked; `autofill`, what autofill put in each field.
- Mock player: `mock-player`, what is heard and captioned, and where the player is now.
- Mock site: `mock-site`, the page, the ways round and the trail; `menu-order`, `search-name`
  and `help-place`, the menu, search control and help link on each page, judged against the
  first.

**Announcement log** — the instrument showing what a screen reader would say. Like a measured
ratio, it is computed from the markup actually rendered, never typed in, so it cannot drift from
what it describes.

**Mock site** — a miniature site of a few pages, inside a lab, that the reader moves between. For
the criteria that are only visible across pages: consistent navigation, identification and help,
and multiple ways.

**Mock player** — the stand-in for a video in the media criteria (1.2.x): a scene drawn by a
timeline, with captions, a transcript or description cues the reader switches on and off.
Silent, so audio description appears as on-screen cues. Not a video file.

---

## The page

**Criterion page** — the page for one criterion: its restatement, facts, fail and pass
examples, and any diff, demo or lab. The unit people link to.

**Index card** — the short linked summary of a criterion (number, name, level, the "fails when"
line) used in the index and in "Also in this guideline" lists. It leads to the criterion page.

**Post** — a dated article in the blog on a subject no single criterion page covers: a topic
that spans criteria, a change between WCAG versions, the law, or a way of testing. It links to
every criterion page it discusses and never restates one; the criterion page stays the authority
on its criterion. A post may show a criterion's existing examples and labs, but brings none of
its own.

**Site origin** — `SITE_ORIGIN`, the production address `https://wcagencyclopedia.com`. Joined
to a route's path, it gives the page's **canonical URL**, the one absolute address crawlers are
told to credit (ADR 0006).

**Share card** — the 1200×630 image a page's link shows when shared, named by its `og:image`
tag: one per criterion page (number, name, level and principle marker) and one site card for
the fixed pages. Drawn at build time into `dist/share/`.

**Crawl files** — `robots.txt` and `sitemap.xml`, written into `dist/` by the prerender step.

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
- **Failures are depicted, never committed.** A lab or example may show a failure inside its own
  mock — a drawn keyboard trap with an always-available, labelled escape; a flash-rate graph
  instead of flashing; a countdown that never really expires the reader's session — but the real
  page never fails a criterion. 2.3.1 never flashes, not even when broken.
- **Motion never carries meaning on its own.** Every animated change ends in a readable state and
  a text verdict. Under reduced motion, or with motion switched off, changes are instant and
  nothing is lost.
- **No backend.** Static build. The only persisted state is the theme preference.
- **English only.** No i18n layer.
