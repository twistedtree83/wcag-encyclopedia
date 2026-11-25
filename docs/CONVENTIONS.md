# Conventions

How the pre-rendered Swatch site is put together, and the gotchas the redesign hit. Read
this before changing the build, adding a page, or touching tokens. The vocabulary is in
`CONTEXT.md`, the why is in `docs/PRD.md` and `docs/adr/`, and the look is in
`design/new-design/DESIGN-GUIDE.md`.

## Build and hydration

- `npm run build` runs three steps: the client build, then
  `vite build --ssr src/entry-server.tsx --outDir dist-ssr`, then `node scripts/prerender.mjs`.
  It writes one `index.html` per route into `dist/` (59 pages).
- `site.html` is the only HTML template. Its placeholders are `<!--@title-->`, `<!--@description-->`,
  `<!--@tokens-->`, `<!--@legacy-redirect-->` and `<!--@app-->`. `render(route)` in
  `src/entry-server.tsx` returns `{ html, title, description, head }`. Only Home has a `head`:
  it holds the `#1.4.3` → `criteria/1.4.3/` redirect from `src/site/legacyRedirect.ts`.
- The prerender step rewrites `./assets/` to `../` repeated once per directory level, so the
  relative base works at any depth and under the GitHub Pages sub-path.
- `src/entry-client.tsx` reads the route from `#root[data-route]`, never from
  `location.pathname`, then calls `hydrateRoot`.
- **Hydration rule:** never read `localStorage`, `matchMedia`, `location.search` or the theme
  during render. Read them in a mount effect, otherwise the server and client markup differ.
  React 19 doesn't repair mismatched attributes such as `aria-pressed`. Pages with state in the
  URL pre-render their default state and apply `?…` after mount, writing back with
  `history.replaceState`.
- `vite.config.ts` uses `appType: 'mpa'`, so a missing page returns 404 in `vite preview`. A URL
  without its trailing slash also 404s, so every link ends in `/`.

## Routes and adding a page

`src/site/routes.ts` is pure (no JSX), so e2e can import it. Paths have no leading slash and do
have a trailing slash, and Home is `''`. Links are always relative: use `useRoute().href(PATHS.x)`.

To add a page:
1. Add a `PageKind` and an entry in `FIXED_ROUTES`.
2. Add a case to both switches in `src/site/Site.tsx` (`Page` and `pageMeta`). Exhaustiveness
   checking flags any you miss.
3. Add the page to `SECTION` in `src/site/Header.tsx`, which decides which nav item is current.
4. Put the component in `src/pages/` and import it from the entry. `tests/retired.test.ts`
   fails on any module under `src/` that the entry points don't reach.
5. Nothing else is needed for axe. `e2e/axe.spec.ts` scans every route in light and dark at
   1280px and 320px. A page with URL-driven states adds its query URLs to `STATE_PAGES`.

## Tokens and CSS

- Every colour is a token in `src/theme/tokens.ts`. `src/styles/*.css` contains no literal hex
  colours, and a test enforces it. Every new pairing gets a row in `TOKEN_PAIRS` so the token
  contrast audit (`tests/tokens.test.ts`, which mirrors the design guide's §3.4 table) covers it.
- Express a light/dark difference as a token, never as a `:root[data-theme=light]` selector.
  Readers without JS on a light OS have no attribute.
- Theme-specific content renders once per theme with `data-theme-only="light|dark"`. In e2e, read
  it with `:visible`.
- `swatch.css` holds the site and `examples.css` holds criterion examples and demos. Add a site
  section as `/* --- <Component> --- */` before "Breakpoints", and put its media rules in the
  shared blocks. Check `examples.css` before naming a site class: examples own names such as
  `.crumbs` and `.res`.
- Fonts are Figtree and Onest only. `e2e/retired.spec.ts` fails if the old fonts or the old
  single-page markup come back into `dist/`.

## Records, labs and thresholds

- Every record has `since` (`'2.0' | '2.1' | '2.2'`). Exactly six criteria are new in 2.2.
- `labs?: readonly string[]` names entries in `src/labs/registry.ts`. Omit the field rather than
  leaving it empty. 1.4.3 carries `['colour-check', 'fade-text']`. A lab renders its own h3 under
  the page's single "Try it yourself" h2, never an h2 of its own.
- Contrast maths lives in `src/color/contrast.ts`. Ratios are truncated, never rounded:
  `formatScore`, `passesThreshold`. Threshold lists live in `src/labs/thresholds.ts`. Don't
  re-implement either in a lab.
- Never call a threshold or a criterion a "rule" in code, class names or copy.
- Slider and colour-input announcements: the visible `<output aria-live="off">` plus one polite
  `.sr` region, set 500 ms after the reader's last change. Changes the reader didn't make, such
  as a URL preload, must not announce.

## Labs

Every lab renders inside `LabShell` (`src/labs/LabShell.tsx`), which adds the verdict line, the
Reset button and the one polite region. To add a lab:

1. Write the lab in `src/labs/`. Keep its pure model (state → ratio, results, verdict,
   announcement) in a separate `.ts` file, as `fade.ts` does, and unit-test that.
2. Render `<LabShell className verdict said onReset>` with the mock first, then the controls row.
   Mark the mock `data-lab-mock`. Ids come from `useId`, since a page may show a lab twice.
3. `verdict` is `{ criterion, passes }` for what's on screen. `said` is a new `{ text }` object
   for each change the reader makes, and `null` (or unchanged) otherwise. Reset sets it to
   `null`, so it is never announced. Don't add a live region of your own.
4. Register it in `LABS` (`src/labs/registry.ts`), with `flagshipFor: '<num>'` if it is that
   criterion's flagship, then add its id to the record's `labs`.
5. Delete the criterion's line from `tests/labsToCome.ts`. The data-integrity test fails until
   you do.
6. Add a case to `LABS` in `e2e/labs.spec.ts`. It covers both verdicts by keyboard, axe in the
   failing state, Reset and the motion rules.

A lab that shows what a screen reader would say uses the announcement log
(`src/labs/AnnouncementLog.tsx`, computation in `src/labs/announce.ts`): render the mock
`aria-hidden="true" inert` into a ref, read it with `useAnnouncementLog(ref, state)` and draw it
with `<AnnouncementLog>`. The log reads the root even though it is hidden. Unit tests feed it
React markup through `tests/markup.ts` (no DOM in vitest). A lab that starts failing sets
`startsFailing` and `toPass` in its `e2e/labs.spec.ts` case.

A **live example** (ADR 0002) is set on the record: `live: { Example, keys, instruments }` on
both `fail` and `pass` (`src/criteria/types.ts`). The page pre-renders `render` and swaps the
live one in after hydration. `src/live/LiveStage.tsx` wraps the fail `Example` in
`aria-hidden inert` and drives it with the input bar; the pass `Example` is real. Instruments
are pure views of the stage's `StageEvent`s (`src/live/events.ts`), registered one per line in
`src/live/instruments.tsx`. Write the broken markup with its real `tabindex`: the focus model
reads attributes. e2e pattern: `e2e/live-examples.spec.ts`.

Motion follows design guide §7: `--speed-state` and `--ease-out` for state changes; only
opacity, transform and colour animate. Reduced motion and `data-motion="off"` are handled
globally at the end of `swatch.css`.

## URL contracts

- All criteria and Home: `?p=1..4`, `?l=A|AA`, `?new`, `?q=`, handled only in
  `src/catalog/urlQuery.ts`.
- Colour check: `?fg=` and `?bg=`, handled only in `src/labs/pairQuery.ts`.
- 4.1.2 flagship lab: `?el=`, `?name=`, `?state=`, `?on=`, handled only in `src/labs/nrvQuery.ts`.
- 2.4.7 flagship lab: `?w=`, `?off=`, `?c=`, handled only in `src/labs/ringQuery.ts`.
- 1.1.1 flagship lab: `?img=`, `?alt=` (absent: no alt attribute), handled only in `src/labs/altQuery.ts`.
- 1.3.1 flagship lab: `?mock=`, `?real=` (comma list), handled only in `src/labs/structureQuery.ts`.
- 2.5.8 flagship lab: `?size=8..44`, `?gap=0..24`, handled only in `src/labs/targetQuery.ts`.
- 2.4.3 flagship lab: `?src=`, `?ti=`, handled only in `src/labs/orderQuery.ts`.
- 1.4.10 flagship lab: `?zoom=100|200|400`, `?layout=fixed|reflow`, handled only in `src/labs/reflowQuery.ts`.
- 2.2.1 flagship lab: `?limit=60|120|300`, `?help=none|late|extend|adjust|off`, handled only in `src/labs/timeoutQuery.ts`. The lab's clock is never in the URL.
  A flagship lab pre-renders its start, applies the query in a mount effect without announcing
  it, and writes changes back with `history.replaceState` (the start writes no query).

## Running e2e

- Several checkouts (git worktrees) can't share the default port 4173: `reuseExistingServer`
  makes one checkout's scan silently test another checkout's build. Give each its own port with
  `E2E_PORT=4505 npm run verify`.
- e2e waits for hydration before interacting:
  `page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true')`.
- The suite covers about 535 tests across 59 pages. On a heavily loaded machine, tests fail on
  the 30s timeout rather than on assertions. Re-run those with
  `npx playwright test --last-failed --workers=1` before treating them as real. Assertion
  failures are always real.
