# Pre-rendered pages, one per criterion, replacing the single long page

The site began as one long scrolling page with a rail, a "You are in" strip, a mobile drawer and an in-page viewport preview. The Swatch redesign replaces it with separate pages: Home, Colour check, All criteria, and one page per criterion at `/criteria/<number>/`. All of them are rendered to static HTML at build time with React, so each criterion page is a real document that shows its content without JavaScript and works on GitHub Pages without rewrites. Old `#<number>` links on the home page are redirected to the matching criterion page.

## Considered options

- **Restyle the single page in Swatch tokens.** Rejected: the design's breadcrumb, facts card, pager and "Also in this guideline" all assume separate pages.
- **One client-rendered template (`criterion.html?c=1.4.3`), as in the mockup.** Rejected: a blank page until the script runs, for the page people paste into tickets and PRs.

## Consequences

- The viewport preview is retired, so layout uses media queries at the design's 1100px and 900px breakpoints rather than container queries.
- The build gains a pre-render step that writes 59 HTML files: Home, All criteria, Colour check, About and the 55 criterion pages.
