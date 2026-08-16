## Parent

#1

## What to build

The conformance-level filter and the text search in the header, over a pure filter engine.

The engine is a function of `(criteria, { level, query })` returning the matching criteria. No
DOM, no component state, no side effects — so it can be tested directly. Level filter is
single-select (All / A / AA) and composes with the query. Search matches against criterion number
and name, so either half of what the reader remembers finds the card.

The header shows how many criteria are showing out of the total, so an active filter is never
invisible.

A criterion hidden by a filter must be removed from the accessibility tree, not merely hidden
visually — otherwise a screen reader user and a sighted user see different sets.

## Acceptance criteria

- [ ] Filter engine is a pure function with no DOM dependency
- [ ] Level filter returns only criteria of that level; "All" returns everything
- [ ] Search matches on criterion number and on criterion name
- [ ] Level filter and search compose
- [ ] An empty query returns everything
- [ ] The reported count matches the number of criteria actually rendered
- [ ] Unit tests cover each of the above against the engine directly
- [ ] Level buttons expose their pressed state
- [ ] Criteria hidden by a filter are absent from the accessibility tree
- [ ] The axe scan passes with a filter active

## Blocked by

- #3 — App shell: header, rail, scroll-spy, principle opener, guideline section, deep links
