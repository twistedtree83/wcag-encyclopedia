## Parent

#27

## What to build

Two facts the redesign needs, typed once into the corpus so that pages never disagree.

- **Since**: the WCAG version that introduced each criterion (`2.0`, `2.1` or `2.2`). Required on every record. It drives the facts card's "In WCAG since" and the "new in 2.2" filter.
- `lab?`: an optional reference to a **Lab**. When it's present, the criterion page shows a "Try it yourself" section. This is the slot that lets the site grow towards full interactivity by adding labs as content.

No labs are attached yet. R-06 and R-07 attach the first two.

## Acceptance criteria

- [ ] Every one of the 55 criterion records has a valid `since`
- [ ] The **data-integrity test** fails unless exactly six records are new in 2.2: 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7 and 3.3.8
- [ ] The data-integrity test fails if a record's `lab` reference doesn't resolve to a real lab
- [ ] Every record still has both a fail example and a pass example (labs never replace them)

## Blocked by

- #28 — Redesign walking skeleton: Swatch tokens, page shell and one pre-rendered criterion page
