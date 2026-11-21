## Parent

#27

## What to build

The **colour check**, the site's signature **lab**, as in design guide §8.4. It's built once and mounted in three places:
- the Colour check page at `/colour-check/`, at full width, with quick-start pairs above it
- the 1.4.1, 1.4.3 and 1.4.11 criterion pages, through their `lab` field
- the Home hero (Home is built in R-08)

The Colour check page also has the "Done well, done badly" pairs, "What the numbers mean" and "What a ratio can't tell you" sections, as in §9.2.

Every ratio shown is computed by the contrast engine from the colours actually rendered. None is typed in. The site's contrast requirements are called **thresholds** in on-screen copy. The AAA result appears only as a clearly labelled result and doesn't link to 1.4.6.

## Acceptance criteria

- [ ] Entering a text colour and a background, by picker or by a 3- or 6-digit hex with or without `#`, updates the preview, ratio and results; a partly typed code is ignored until it's valid and is restored on blur
- [ ] The ratio is truncated to two decimals, never rounded, so 4.499 shows 4.49 and fails
- [ ] The results show pass or fail with an icon and a word for body text AA 4.5:1, large text AA 3:1, body text AAA 7:1 and borders and icons AA 3:1
- [ ] When body text fails, a fix suggestion offers the nearest colour of the same hue that reaches 4.5:1 (the smaller of mixing towards black and towards white) and a button applies it
- [ ] Swap, quick-start pairs and the greyscale preview work, and "Try it in the checker" on a pair card loads the bad pair and moves focus to the text-colour field
- [ ] A polite live region announces the verdict 500ms after the last change
- [ ] Failing sample text in pair cards is hidden from assistive technology, and its badge describes it in words
- [ ] `?fg=` and `?bg=` preload a pair on the Colour check page
- [ ] 1.4.1, 1.4.3 and 1.4.11 show the colour check in their "Try it yourself" section
- [ ] Unit tests prove that the nearest passing colour reaches 4.5:1 and that truncation never turns a fail into a pass
- [ ] Matches the design guide's Colour check screenshots and the failing-with-fix and greyscale states in both themes at 1440px and 390px; the axe scan passes in both themes and at 320px

## Blocked by

- #30 — All 55 criterion pages with the full anatomy
