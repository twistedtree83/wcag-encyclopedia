## Parent

#1

## What to build

The demo library: a grid indexing all nine demos, each entry showing its criterion number, a
one-line description, and its duration, linking to the demo in place on its criterion card.

Every demo is reachable two ways — from its criterion card while reading the standard in order,
and from this index when the reader wants to browse the demos themselves.

## Acceptance criteria

- [ ] All nine demos are listed with criterion number, description, and duration
- [ ] Each entry links to that demo on its criterion card
- [ ] Entries not yet authored render as clearly-marked placeholders rather than broken links
- [ ] The grid reflows to one column at 320px
- [ ] The section has a heading and sits in the rail's structure
- [ ] The axe scan passes in both themes

## Blocked by

- #9 — Demo timeline runtime, player, and the reflow demo (1.4.10)
