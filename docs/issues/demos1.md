## Parent

#1

## What to build

Three demo timelines authored against the proven runtime. No player changes — if these need the
player modified, that is a signal the timeline abstraction is wrong and should be raised rather
than worked around.

1. **2.4.7 Focus Visible** — keyboard focus traversing a checkout form with a visible focus ring,
   so the reader sees what correct focus behaviour looks like.
2. **2.4.7 Focus Visible (failing)** — the same traversal with focus styles removed. The cursor
   vanishes; the reader should feel the disorientation rather than read about it.
3. **2.4.11 Focus Not Obscured** — a sticky header covering the focused element, then
   `scroll-padding` fixing it.

Demos 1 and 2 should share a layout so the only visible difference is the focus ring.

## Acceptance criteria

- [ ] Each demo is authored as a timeline; the player is unmodified
- [ ] Each keyframe carries a caption describing what is happening at that moment
- [ ] The two 2.4.7 demos share a layout and differ only in focus styling
- [ ] The 2.4.11 demo shows both the obscured state and the fixed state
- [ ] Each demo plays, pauses, scrubs, and loops
- [ ] Each demo renders correctly in both themes and at 320px
- [ ] Each demo respects `prefers-reduced-motion`
- [ ] Each demo is linked from its criterion card and from the demo library
- [ ] The axe scan passes in both themes

## Blocked by

- #9 — Demo timeline runtime, player, and the reflow demo (1.4.10)
