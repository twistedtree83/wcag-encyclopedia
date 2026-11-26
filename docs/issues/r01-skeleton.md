## Parent

#27

## What to build

The thinnest end-to-end path through the redesign, proving the new infrastructure before anything is built on it.

Pages are now pre-rendered to static HTML at build time and hydrated, instead of one client-rendered page (ADR 0001). This slice builds that step and proves it on a single **criterion page**, 1.4.3, at `/criteria/1.4.3/`. It also ships the Swatch shell every later page uses:
- the Swatch tokens for both themes, taken from the design's `:root` block, with the old palette deleted
- Figtree and Onest as the only fonts
- the header with logo, nav (Home, Criteria, Colour check, About) and a skip link
- the footer
- the theme toggle

The 1.4.3 page only needs its head and its fail and pass examples here. The full anatomy comes in R-03. Only the default style ships: no `data-*` switches except `data-theme`, and nothing from the tweak bar.

The old single page can keep running beside it until R-10 removes it.

## Acceptance criteria

- [ ] Building the site writes a static HTML page for 1.4.3 whose restatement and fail and pass examples are in the markup before any script runs
- [ ] The page hydrates, and its interactive parts work after load
- [ ] The **token contrast audit** checks every pair in the design guide's measured-contrast table in both themes, including control borders on cards in the dark theme at 3.7:1, and fails naming the pair and ratio if one drops below its **threshold**
- [ ] Header, nav, skip link and footer match the design guide's screenshots in both themes at 1440px and 390px
- [ ] The theme toggle is one button labelled "Dark theme" with `aria-pressed`, at least 44px; the theme follows the OS on first visit and then remembers the reader's choice
- [ ] Only Figtree and Onest are loaded
- [ ] The **axe scan** runs against the new page in both themes and at 320px with zero violations, and verify stays the deploy gate

## Blocked by

None (can start immediately)
