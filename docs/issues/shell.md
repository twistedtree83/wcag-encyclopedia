## Parent

#1

## What to build

The chrome the criterion cards live inside, so that the page reads as a reference rather than a
single card on a white background.

Sticky header carrying the wordmark and leaving space for the controls that later slices add. A
left rail listing all thirteen guidelines grouped under their four principles, each principle
with its own accent hue and marker shape. A "You are in" strip showing the current principle and
guideline. A scroll-spy driving both the rail's active marker and that strip.

Also the page's own prose furniture: the hero, the "how to read a card" explainer that
establishes the fail/pass convention before the reader needs it, and the "this page obeys its own
rules" section. Plus the principle opener treatment and the guideline section header, built once
here and reused by all thirteen content slices.

Scroll-spy is decorative-with-text, not a live region — it must not announce on every scroll.

## Acceptance criteria

- [ ] The left rail lists all 13 guidelines grouped under their 4 principles
- [ ] Each principle uses a distinct accent hue *and* a distinct marker shape, so the grouping survives greyscale
- [ ] Clicking a rail entry navigates to that guideline
- [ ] The rail highlights the guideline currently in view as the reader scrolls
- [ ] The "You are in" strip updates to the current principle and guideline
- [ ] The strip does not announce to screen readers on scroll
- [ ] The principle opener renders the ordinal, name, and one-sentence definition
- [ ] The guideline section header renders the number, name, and intro paragraph
- [ ] Hero, "how to read a card", and "obeys its own rules" sections are present
- [ ] Every criterion card is deep-linkable at its bare criterion number
- [ ] A targeted card is not obscured by the sticky header — the page passes 2.4.11 by the mechanism it documents
- [ ] Heading hierarchy has no skipped levels and landmarks are correct
- [ ] The axe scan passes in both themes

## Blocked by

- #2 — Walking skeleton: build, token palettes, one criterion card, contrast audit, CI
