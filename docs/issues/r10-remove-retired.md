## Parent

#27

## What to build

Once every new page exists, remove what the redesign retired (ADR 0001):
- the single long page
- the rail, the "You are in" strip and the mobile drawer
- principle openers and "how to read a card"
- the viewport preview and the container-query layout that served it
- the demo library index
- the old palette and fonts

Demos, the timeline runtime, the contrast engine and the corpus all stay.

## Acceptance criteria

- [ ] None of the retired parts are reachable or present in the built site
- [ ] No code is left that only the retired parts used
- [ ] Every demo still works on its criterion page
- [ ] Verify passes: types, unit tests, build, and the axe scan over all 59 pages

## Blocked by

- #35 — Home page
