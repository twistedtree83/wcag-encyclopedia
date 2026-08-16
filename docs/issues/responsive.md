## Parent

#1

## What to build

Full functionality at 320px, the mobile navigation drawer, and the in-page viewport preview —
together, on one container-query foundation.

These ship as one slice deliberately. The viewport preview renders the page inside a
fixed-width frame, so content must size against its container rather than the browser window. If
the responsive layout were built with media queries first, all of it would be rebuilt for the
preview. The frame sets `container-type: inline-size` and content uses container units, which is
what the design file already does.

The viewport preview is a production feature, not a design-tool leftover: on a page teaching
reflow, letting the reader shrink the page in place is the teaching device. Selecting 320px opens
the drawer.

## Acceptance criteria

- [ ] The page is fully functional at 320px with no horizontal scrolling
- [ ] Layout responds to its container, not the browser window
- [ ] The left rail is replaced by a drawer below the rail breakpoint
- [ ] The drawer contains the guideline list plus the search and filter controls
- [ ] The drawer traps focus while open, closes on Escape, and returns focus to its trigger
- [ ] Every control is at least 44px in both dimensions on touch
- [ ] The viewport preview offers desktop, tablet, and 320px, and the whole page responds — not just the examples
- [ ] Selecting 320px opens the drawer
- [ ] Viewport buttons expose their pressed state
- [ ] Full behaviour is retained at 200% zoom with no loss of content or function
- [ ] The axe scan passes at 320px in both themes

## Blocked by

- #3 — App shell: header, rail, scroll-spy, principle opener, guideline section, deep links
