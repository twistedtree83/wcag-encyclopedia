## Parent

#1

## What to build

The second card variant: a code diff beneath the visual, for criteria whose point is code rather
than perception. Extends the criterion record with an optional diff and renders it.

Removed and added lines are marked with `-` and `+` glyphs **as well as** tint, so the diff reads
correctly in greyscale and for a colour-blind reader. This is the page obeying 1.4.1 while
documenting 1.4.11.

Prove it on **1.4.11 Non-text Contrast**, whose fix is a single border-colour declaration.

## Acceptance criteria

- [ ] The criterion record supports an optional diff, and criteria without one are unaffected
- [ ] Removed and added lines carry `-` and `+` glyphs in addition to background tint
- [ ] The diff is legible with colour removed entirely
- [ ] Long lines scroll within the diff container without the page scrolling horizontally
- [ ] The diff has a caption naming the file or context and what changed
- [ ] 1.4.11 renders with its fail/pass pair and its diff
- [ ] The data-integrity test accepts records with and without a diff
- [ ] The axe scan passes in both themes

## Blocked by

- #2 — Walking skeleton: build, token palettes, one criterion card, contrast audit, CI
