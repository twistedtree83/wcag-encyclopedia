## Parent

#27

## What to build

The second **lab**: the reader drags a labelled "Fade the text" slider, and the exhibit text really does fade, crossing the contrast thresholds as it goes (design guide §8.10). It's mounted on the 1.4.3 criterion page through the record's `lab` field, and reused in Home's "Try it: fade the text" section in R-08.

It's a lab, not a demo: nothing plays by itself, and the reader is in control throughout.

## Acceptance criteria

- [ ] Moving the slider fades the exhibit text and updates the live ratio, the log-scale bar (ticks at 3, 4.5, 7 and 21) and the three pass/fail results
- [ ] The slider has a visible label and a description for screen readers, and works with the keyboard
- [ ] Changes are announced through a polite live region without flooding it while the slider is dragged
- [ ] The 1.4.3 criterion page shows the lab in "Try it yourself" alongside the colour check
- [ ] Nothing animates on its own, and transitions stop under reduced motion
- [ ] Matches the design guide's lab screenshots, including the faded-until-it-fails state, in both themes; the axe scan passes

## Blocked by

- #30 — All 55 criterion pages with the full anatomy
