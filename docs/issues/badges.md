## Parent

#1

## What to build

The measured-ratio badges on contrast examples ("✕ 2.3:1 measured", "✓ 7.4:1 measured") derived
from the colours the example actually renders, by calling the contrast engine — never typed by
hand into the content.

This is a small change with an outsized payoff. A page that displays a ratio it does not actually
measure is precisely the credibility failure the PRD's problem statement describes, and a
hand-typed number goes stale the first time someone adjusts a colour.

The badge states pass or fail with a glyph and the numeric ratio, so it does not rely on hue.

## Acceptance criteria

- [ ] Displayed ratios are computed at build or render time from the example's own colours
- [ ] No contrast ratio appears as a literal in content data
- [ ] The badge shows a glyph and the numeric ratio, not colour alone
- [ ] Changing an example's colour changes the displayed ratio with no content edit
- [ ] A test asserts a known colour pair produces its known ratio
- [ ] The axe scan passes in both themes

## Blocked by

- #2 — Walking skeleton: build, token palettes, one criterion card, contrast audit, CI
