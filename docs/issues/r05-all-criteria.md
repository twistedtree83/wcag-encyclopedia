## Parent

#27

## What to build

The All criteria page at `/criteria/`, as in design guide §9.3:
- the page head with the h1 "All 55 criteria" and the "How they split by principle" chart
- the filter panel: search, principle chips, and level chips with "New in 2.2"
- the full grid of **index cards**, each linking to its criterion page

Chips are toggle buttons. Each principle chip and index card shows the principle's shape as well as its colour. Filter state lives in the URL, so a filtered view can be shared.

## Acceptance criteria

- [ ] `?p=1` to `?p=4`, `?q=` and `?new` load the page already filtered, and changing a filter updates the URL
- [ ] Chips expose their state with `aria-pressed` and are at least 44px tall
- [ ] The results line ("Showing 6 of 55 criteria.") is a polite live region and doesn't move focus
- [ ] A query with no matches shows the dashed suggestion box
- [ ] Every index card links to its criterion page and names its principle for screen readers
- [ ] Matches the design guide's All criteria screenshots, plus the filtered and no-results states, in both themes at 1440px and 390px
- [ ] The axe scan covers the page in both themes and at 320px with zero violations

## Blocked by

- #30 — All 55 criterion pages with the full anatomy
- #31 — Filter engine: principle, level, new in 2.2, and wider search
