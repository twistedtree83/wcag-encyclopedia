## Parent

#27

## What to build

Every criterion gets its own pre-rendered **criterion page** at `/criteria/<number>/`, with the full anatomy from the PRD, in order:

1. Breadcrumb: Home / Criteria / current, with `aria-current="page"`
2. Head: meta line with principle marker, number, principle, level and an optional New tag; h1; restatement; facts card (principle, guideline, level, In WCAG since, number)
3. **Broken, then fixed**: the fail example and the pass example in the two stages, with their captions
4. **What changed in the code**: the diff at full width, only when the criterion has one
5. **Watch it happen**: the existing demo **player**, unchanged, only on the eight criteria that have a **demo** (nine demos: one criterion has two)
6. **Try it yourself**: the lab, only when the record has one (none yet)
7. **Also in guideline X.Y**: up to six **index cards** from the same guideline, or from the same principle if the guideline has no others
8. Pager: previous and next criterion in number order

Old `#<number>` links to the previous site's home page are sent to the matching criterion page.

## Acceptance criteria

- [ ] The build writes 55 criterion pages, one per record, and each one's main content is present without JavaScript
- [ ] Sections 4–6 appear only when the record has a diff, demo or lab, and are absent otherwise
- [ ] Each demo plays, pauses, scrubs and respects reduced motion on its criterion page exactly as before
- [ ] "Also in" shows up to six index cards, falling back to the same principle when the guideline has no others
- [ ] The pager runs in number order (1.4.10 follows 1.4.9) and the first and last criteria have only one neighbour
- [ ] Opening the home page at `#1.4.3` replaces the location with the 1.4.3 criterion page, without adding a history entry
- [ ] Pages match the design guide's 1.4.3 and 2.4.11 screenshots in both themes at 1440px and 390px
- [ ] The axe scan covers every criterion page in both themes and at 320px with zero violations

## Blocked by

- #29 — Criterion records gain `since` and `lab?`
