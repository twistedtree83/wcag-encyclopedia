# Conventions

How the pre-rendered Swatch site is put together, and the gotchas the redesign hit. Read
this before changing the build, adding a page, or touching tokens. The vocabulary is in
`CONTEXT.md`, the why is in `docs/PRD.md` and `docs/adr/`, and the look is in
`design/new-design/DESIGN-GUIDE.md`.

## Build and hydration

- `npm run build` runs three steps: the client build, then
  `vite build --ssr src/entry-server.tsx --outDir dist-ssr`, then `node scripts/prerender.mjs`.
  It writes one `index.html` per route into `dist/` (60 pages, plus one per post).
- `site.html` is the only HTML template. Its placeholders are `<!--@title-->`, `<!--@description-->`,
  `<!--@canonical-->`, `<!--@structured-data-->`, `<!--@share-->`, `<!--@tokens-->`, `<!--@legacy-redirect-->`, `<!--@fonts-->`, `<!--@app-->` and `<!--@analytics-->`.
  `render(route)` in `src/entry-server.tsx` returns `{ html, title, description, head, beacon, share }`.
  Home's `head` holds the `#1.4.3` → `criteria/1.4.3/` redirect from
  `src/site/legacyRedirect.ts`, the 404 page's holds `noindex`, and the blog index's and each post's hold the feed link
  (see "Blog posts"); other pages have none. `beacon` is the Cloudflare Web Analytics script
  (`src/site/analytics.ts`), written at the end of `<body>` outside `#root`. It is empty while
  `CF_ANALYTICS_TOKEN` in `src/site/config.ts` is unset, and the committed config leaves it unset.
  The beacon sets no cookie, so the site has no consent banner.
- Titles and descriptions come from `pageMeta` in `src/site/Site.tsx`. Fixed pages write theirs
  by hand; criterion pages build theirs in `src/site/meta.ts` from the record: number, name and
  level for the title, and the restatement's first sentence (or its `gist`) then "Fails when:"
  and the fail caption for the description. `tests/headMeta.test.ts` holds every route to a
  unique title of 30–65 characters and a unique description of 70–160, with the brand at most
  once per title and first on Home.
- The prerender step rewrites `./assets/` to `../` repeated once per directory level, so the
  relative base works at any depth and under the GitHub Pages sub-path.
- **Canonical tag and crawl files** (ADR 0006). The only absolute addresses the site writes are
  built from `SITE_ORIGIN` in `src/site/config.ts` by `src/site/crawl.ts`, which the prerender
  step imports through the SSR entry. It fills `<!--@canonical-->` on every page and fails the
  build if `canonicalProblems` finds the tag missing, doubled, relative or naming another route.
  It then writes `dist/robots.txt` (allow all, `Sitemap:` line) and `dist/sitemap.xml` (every
  route in `ROUTES`, in order). Nothing is kept in `public/` and no crawl file is hand-written.
  A page's `lastmod` is the UTC date of the last commit to the files `pageSources(route)` names:
  the criterion's guideline record file (`src/criteria/g1-4.tsx`) or the fixed page's component.
  An uncommitted new file counts as today. The CI build job checks out with `fetch-depth: 0`,
  because a shallow clone would date every page to the one commit it has. A new page kind adds
  its file to `PAGE_FILES` there. `tests/crawl.test.ts` and `e2e/crawl.spec.ts` check them.
- **Structured data** (S-04). `structuredData(route, { published, modified })` in the SSR entry
  returns the page's JSON-LD script elements, built by `src/site/jsonLd.ts`, and the prerender
  step fills `<!--@structured-data-->` with them. `modified` is the sitemap `lastmod`;
  `published` is the first commit to the same files, so a criterion page is dated from its
  guideline file. The build fails if `jsonLdProblems` finds a block that doesn't parse, a
  missing or extra block type for the page kind, a missing required property, or an address
  not on `SITE_ORIGIN` or not the page's own route. The `BreadcrumbList` and the visible trail
  both come from `trailFor` (`src/site/breadcrumbs.ts`), with the page's own name from
  `pageName` in `src/site/Site.tsx`. A new page kind adds its blocks to `BLOCKS` and its block
  types to `TYPES` (typed by `PageKind`), and a new block type (S-07's `BlogPosting`) adds its
  required properties to `REQUIRED` and any deeper check to `CHECKS`. The WebSite's
  `SearchAction` points into All criteria's `?q=`; if that parameter goes, the action goes too.
  A criterion page's `TechArticle` carries its share card (S-03) as `image`.
  `tests/structuredData.test.ts` and `e2e/crawl.spec.ts` check them.
- **Share tags and share cards** (S-03). `share` is the page's Open Graph and Twitter tags from
  `shareTags(route)` in `src/site/share.ts`, with the title and description from `pageMeta`.
  `og:image` points at the page's share card, a 1200×630 PNG in `dist/share/`: `<num>.png` for
  a criterion page, `site.png` for every fixed page. `share.ts` describes each card as a tree
  of boxes in the dark theme's tokens; `scripts/prerender.mjs` draws it with satori and resvg
  (dev dependencies, imported only there) using the `.woff` files of `@fontsource` (satori
  reads no woff2), and fails the build if `cardContrastProblems` finds text under 4.5:1 or a
  marker under 3:1, or `openGraphProblems` (`crawl.ts`) finds a tag missing, doubled, empty or
  pointing off `SITE_ORIGIN`. satori sizes boxes content-box, and every `div` is a flex box.
  The client entry never imports `share.ts`; `e2e/share.spec.ts` fails if satori, resvg or the
  tags reach `dist/assets/`. A new page kind gets the site card unless `shareCard` says otherwise.
- **The 404 page** (`NOT_FOUND` in `src/site/routes.ts`, `src/pages/NotFoundPage.tsx`) is not
  in `ROUTES`. The prerender step writes it once to `dist/404.html`, with `noindex` (in `head`),
  no canonical tag, JSON-LD or share tags (it has no address of its own: `render` returns an
  empty `share`, and its `BLOCKS`/`TYPES` entries are empty), and asset links from the root (`/assets/`). Cloudflare serves it with
  status 404 for any path that matches no asset (`not_found_handling: "404-page"` in
  `wrangler.jsonc`), at that path's depth, so `href` links from it are root-absolute
  (`linkFrom`). `vite preview` does the same through the `notFoundPage` plugin in
  `vite.config.ts`, so a missing page in e2e is the 404 page with status 404, not an empty body.
  Its checks, axe included, are in `e2e/not-found.spec.ts`, not the per-route loops.
- `src/entry-client.tsx` reads the route from `#root[data-route]`, never from
  `location.pathname`, then calls `hydrateRoot`.
- **Hydration rule:** never read `localStorage`, `matchMedia`, `location.search` or the theme
  during render. Read them in a mount effect, otherwise the server and client markup differ.
  React 19 doesn't repair mismatched attributes such as `aria-pressed`. Pages with state in the
  URL pre-render their default state and apply `?…` after mount, writing back with
  `history.replaceState`.
- `vite.config.ts` uses `appType: 'mpa'`, so a missing page returns 404 (the 404 page) in
  `vite preview`. A URL without its trailing slash also 404s there (Cloudflare redirects it
  instead), so every link ends in `/`.

## Routes and adding a page

`src/site/routes.ts` is pure (no JSX), so e2e can import it. Paths have no leading slash and do
have a trailing slash, and Home is `''`. Links are always relative: use `useRoute().href(PATHS.x)`.

To add a page:
1. Add a `PageKind` and an entry in `FIXED_ROUTES`.
2. Add a case to both switches in `src/site/Site.tsx` (`Page` and `pageMeta`). Exhaustiveness
   checking flags any you miss.
3. Add the page to `SECTION` in `src/site/Header.tsx`, which decides which nav item is current,
   and its component file to `PAGE_FILES` in `src/site/crawl.ts`, which dates it in the sitemap.
   Types flag both if you miss them.
4. Put the component in `src/pages/` and import it from the entry. `tests/retired.test.ts`
   fails on any module under `src/` that the entry points don't reach.
5. Nothing else is needed for axe. `e2e/axe.spec.ts` scans every route in light and dark at
   1280px and 320px. A page with URL-driven states passes its query URLs to `axeStates` there;
   a lab passes its own from its lab spec (see "Labs").

## Blog posts

A post (ADR 0007) is one Markdown file, `src/blog/posts/<slug>.md`. Adding a post is adding
that file: no list is edited. Its frontmatter:

```yaml
---
title: Two contrast thresholds, for text and for everything else   # the page title too: 30–65 characters
description: …                                                 # 70–160 characters
published: 2026-11-02
updated: 2026-11-20                                            # optional, not before published
criteria: [1.4.3, 1.4.11]                                      # every criterion the post discusses
---
```

- **Build-time only.** The `posts` plugin (`src/blog/plugin.ts`, in `vite.config.ts`) parses each
  file with `src/blog/parse.ts` (mdast-util-from-markdown and yaml, both devDependencies) and
  emits plain data: `<slug>.md` is the whole post, `<slug>.md?meta` the frontmatter alone. The
  blog index reads every `?meta` (`src/blog/posts.ts`); the prerender step reads every full post
  (`src/blog/bodies.ts`); the browser loads only the post it is on (`entry-client.tsx`) and draws
  the tree with `PostBody.tsx`. `e2e/blog.spec.ts` fails if parser code reaches `dist/assets`.
- **Problems fail the build** (and the unit tests), each naming the post and line: a missing,
  unknown or malformed frontmatter field, a criterion number not in the manifest, a criterion
  link not in `criteria`, a `criteria` entry the body never links, an h1 in the body or a
  skipped heading level (the body starts at `##`, under the page's h1), raw HTML, an image, or a
  reference-style link. What a body may hold is the `NODES` table in `parse.ts`: a new node type
  (S-08's directives) is one entry there and, if it draws something new, a branch in `PostBody`.
- **Links.** Link a page of the site by its path from the root, ending in `/`:
  `[Contrast (Minimum)](/criteria/1.4.3/)`. The page turns it into a relative link. Any other
  link is written in full (`https://…`).
- **Dates.** The page and the `BlogPosting` show the frontmatter dates; the sitemap `lastmod` is
  the file's last commit, as for every page. The blog index is dated from its component and the
  posts folder.
- **Share card.** Each post has its own, `share/blog-<slug>.png` (`postCard` in
  `src/site/share.ts`), which is also its `BlogPosting` image; the blog index has the site card.
- **Feed.** The prerender step writes `dist/blog/feed.xml` (`FEED_PATH`) with `feedXml` in
  `src/blog/feed.tsx`, through `blogFeed` in `entry-server.tsx`, and fails the build on anything
  `feedProblems` finds (RFC 4287's required elements, absolute entry URLs, RFC 3339 dates, well
  formed). Each entry's `content` is the body drawn by `PostBody` with `link={absoluteUrl}`, so
  its site links are absolute. The blog index and post pages carry
  `<link rel="alternate" type="application/atom+xml">` in `render()`'s `head`, with a relative
  href (`./feed.xml`, `../feed.xml`): only the feed's own contents are absolute. The feed is a
  file, not a route, so it is not in the sitemap. With no posts it is dated by the blog index.
- **Further reading.** `CriterionPage` takes `posts` (`POSTS` from `Site`) and lists
  `postsAbout(num, posts)` (`src/blog/post.ts`): the newest three whose `criteria` include the
  criterion, between the labs and "Also in". No posts about it, no section.
- **Routes without Vite.** `src/blog/slugs.ts` lists the slugs with `import.meta.glob`, and falls
  back to reading the folder when the e2e specs import `ROUTES` without Vite. The two must agree.
- **The fixture post**, `tests/fixtures/posts/fixture-contrast-thresholds.md`, exists only in tests
  (`tests/fixturePost.ts`). `tests/blogBuild.test.ts` mocks the post modules with it to test a
  post through `render`, `ROUTES` and the JSON-LD check.

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
  shared blocks. A lab's own rules go in its folder's `lab.css` instead (see "Labs"). Check `examples.css` before naming a site class: examples own names such as
  `.crumbs` and `.res`.
- Fonts are Figtree and Onest only, set as `var(--fh)` and `var(--fb)`. Code uses
  `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`. `e2e/retired.spec.ts` fails if the old
  fonts or the old single-page markup come back into `dist/`.
- The fonts are self-hosted, never loaded from Google Fonts: a reader's visit is not reported
  to a third party, and layout in tests never waits on the network, so it is the same on every
  run. `src/entry-client.tsx` imports the latin subset of each weight the design uses from
  `@fontsource/figtree` and `@fontsource/onest` (each face sets `font-display: swap`), and Vite
  bundles the woff2 files into `dist/assets/`. `scripts/prerender.mjs` fills `<!--@fonts-->`
  with preloads for the two faces above the fold, Onest 400 (body) and Figtree 800 (h1). A new
  weight is a new import there. `e2e/fonts.spec.ts` fails if a built page or stylesheet names
  `fonts.googleapis.com` or `fonts.gstatic.com`.
- `tests/styleRules.test.ts` enforces the mechanical rules: transitions, font stacks, sections
  before "Breakpoints", axe excludes and the "rule" wording.

## Records, labs and thresholds

- Every record has `since` (`'2.0' | '2.1' | '2.2'`). Exactly six criteria are new in 2.2.
- `labs?: readonly string[]` names entries in `src/labs/registry.ts`. Omit the field rather than
  leaving it empty. 1.4.3 carries `['colour-check', 'fade-text']`. A lab renders its own h3 under
  the page's single "Try it yourself" h2, never an h2 of its own.
- Contrast maths lives in `src/color/contrast.ts`. Ratios are truncated, never rounded:
  `formatScore`, `passesThreshold`. Threshold lists live in `src/labs/shared/thresholds.ts`. Don't
  re-implement either in a lab.
- Never call a threshold or a criterion a "rule" in code, class names or copy.
- Slider and colour-input announcements: the visible `<output aria-live="off">` plus one polite
  `.sr` region, set 500 ms after the reader's last change. Changes the reader didn't make, such
  as a URL preload, must not announce.

## Labs

A lab lives in its own **lab folder**, `src/labs/<name>/` (ADR 0004). `src/labs/registry.ts`
collects every `src/labs/*/lab.ts` with `import.meta.glob`, so adding a lab is adding a folder:
no shared list is edited. `src/labs/INDEX.md` lists lab → criteria → folder. Every lab renders
inside `LabShell` (`src/labs/shared/LabShell.tsx`), which adds the verdict line, the Reset button
and the one polite region. To add a lab:

1. Make `src/labs/<name>/`, named after the lab id. Put the component there and keep its pure
   model (state → ratio, results, verdict, announcement) in a separate `.ts` file beside it, as
   `fade-text/fade.ts` does, and unit-test that in `tests/`. Use the parts in `src/labs/shared/`
   (`LabShell`, `LabChoice`, `Choice`, `Slider`, the announcement log, `thresholds`, the zoom
   frame); a part a second lab needs moves into `shared/`, never into an import across lab
   folders.
2. Render `<LabShell className verdict said onReset>` with the mock first, then the controls row.
   Mark the mock `data-lab-mock`. Ids come from `useId`, since a page may show a lab twice.
   The mock passes axe in every state like the rest of the lab. Only a mock that depicts a
   failure axe would flag (failing contrast) carries `data-depicts-failure`, on exactly the
   depicted content and only while it fails.
3. `verdict` is `{ criterion, passes }` for what's on screen. `said` is a new `{ text }` object
   for each change the reader makes, and `null` (or unchanged) otherwise. Reset sets it to
   `null`, so it is never announced. Don't add a live region of your own.
4. Register it in `src/labs/<name>/lab.ts`: `export default { id, title, criteria, steps, Lab } satisfies
   LabEntry;`. `steps` is "How to use this lab" (goal, controls, what to try, what the result
   means), which the shell shows above the lab on criterion pages; `tests/labSteps.test.tsx` holds every lab to it. A step that puts a control in curly quotes (“Live captions”) must quote what the lab shows when it opens, as `tests/labStepNames.test.tsx` checks; the only other quotes are values the reader types (type “#999999”). with `flagshipFor: '<num>'` if it is that criterion's flagship, and
   `import './lab.css';` if it has styles. Then add its id to each record in `criteria` (the
   record's `labs` sets the order on the page). Every criterion has at least one lab and live
   fail and pass examples; the data-integrity test fails on any gap, and
   `tests/labRegistry.test.ts` fails if `criteria` and the records disagree.
5. Put the lab's own CSS in `src/labs/<name>/lab.css`, narrow-width rules included under their
   own `@media`. Lab sheets load after `swatch.css` and `examples.css`, so a lab rule that must
   lose to a shared rule of equal specificity stays in the shared sheet.
6. Add `e2e/labs/<name>.lab.spec.ts` passing its cases to `labCases` (`e2e/labs/support.ts`).
   Each case covers both verdicts by keyboard, axe in the failing state, Reset and the motion
   rules. A lab with URL state passes its query URLs to `axeStates` in the same file.
7. Run `npm run labs:index` and commit `src/labs/INDEX.md`; a unit test fails while it is stale.

A lab that shows what a screen reader would say uses the announcement log
(`src/labs/shared/AnnouncementLog.tsx`, computation in `src/labs/shared/announce.ts`): render the mock
`aria-hidden="true" inert` into a ref, read it with `useAnnouncementLog(ref, state)` and draw it
with `<AnnouncementLog>`. The log reads the root even though it is hidden. Unit tests feed it
React markup through `tests/markup.ts` (no DOM in vitest). A lab that starts failing sets
`startsFailing` and `toPass` in its `e2e/labs/<name>.lab.spec.ts` case.

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

## Instruments

`CONTEXT.md` lists every registered id under the eight instruments it belongs to. Each is a pure
view of the stage's events. "Fail" is the inert stage, driven by the bar only; "pass" is real.

| Ids | Model and drawing | Reads (`StageEvent` kind) | Simulated vs real |
|---|---|---|---|
| `announcement-log`, `voice-log` | `src/labs/shared/announce.ts`, `logOf` in `src/live/events.ts`, `src/labs/language/language.ts` | `focus`, `change`, `read`, `status` | Fail: the bar steps a model over `tabStops` (attributes, not real focus). Pass: real `focusin`/`change`. Live-region text from a MutationObserver on both. |
| `focus-tracker` | `src/live/focusTrack.ts`, `src/live/focus.ts` | `focus` with `map` | As above, with the same output on both stages. |
| `key-log` | `keyLines` in `events.ts`, `didAction` in `src/live/actions.ts` | `keys` | The bar dispatches real `keydown`s on both. Pass also logs real keys whose handler calls `didAction`. |
| `pointer-log`, `context` | `src/live/pointer.ts` | `pointer`, `popup`, `context` | The bar's Hover dispatches `mouseover`/`mouseout`. Pass also logs the real mouse. Tooltips (`role="tooltip"`) and `[data-context]` come from a MutationObserver. |
| `zoom-meter`, `text-fit`, `orientation-meter`, `text-look` | `src/labs/shared/ZoomFrame.tsx`, `src/labs/shared/zoom.ts`, `src/labs/shared/textFit.ts`, `src/live/clip.ts`, `src/live/ReaderColours.tsx` | `zoom`, `text-fit`, `rotate`, `look` | The frame is real layout on both stages and only the bar changes it. On the pass stage the window is a real scrollable region. |
| `vision-filter` | `src/live/vision.ts`, `src/live/cues.ts`, `src/live/VisionDefs.tsx` | `vision` | Identical on both: the filter is depicted, and `[data-cue]` colours are read from computed style. |
| `clock` | `src/live/clock.ts` | `clock` | Mock time from the bar's Wait and Run only. It never starts on its own. |
| `gesture-pad`, `voice-control`, `autofill` | `src/live/gesture.ts`, `src/labs/label-in-name/labelInName.ts`, `src/labs/input-purpose/inputPurpose.ts` | `gesture`, `voice`, `autofill` | The bar sends real `PointerEvent`s (touch, not primary) and hit-tests Tab stops with `hitAt`. A real pointer on the pass stage is logged but not spoken. |
| `mock-player` | `src/live/mockPlayer.ts`, `src/live/PlayerWindow.tsx` | `player` | `[data-player-*]` attributes read by a MutationObserver on both. Play runs in real time. |
| `mock-site`, `menu-order`, `search-name`, `help-place` | `src/live/mockSite.ts`, `src/live/SiteWindow.tsx` | `site` | `[data-site-*]` attributes read by a MutationObserver on both. |

## Changing the shared lab files

A new lab touches no shared file: it is a lab folder, a lab spec and a regenerated index
("Labs" above). The only shared lines it edits are the `labs` field on its own criterion
records. A new key, event or instrument still touches files every lab shares. Keep each edit to
one entry per line so parallel work merges cleanly, and check each step:

1. **Key:** a `SimKey` member in `src/criteria/types.ts`, its label in `KEY_LABEL` and a
   self-contained branch in `press` (`src/live/LiveStage.tsx`). A record lists the same `keys`
   on both stages, and the data-integrity test checks that.
2. **Event:** a `StageEvent` member in `src/live/events.ts`, produced in `press` and in the
   stage's real listeners or MutationObserver. If the stage should speak it, add a
   `<kind>Said` function and a branch in `push`. Never speak real focus: the reader's own screen
   reader does that.
3. **Instrument:** one line in `INSTRUMENTS` (`src/live/instruments.tsx`), which types
   `live.instruments`. Add it to its group in `CONTEXT.md` and to the table above.
4. **Shared lab part:** a part two labs use moves into `src/labs/shared/`, and its styles stay
   in `swatch.css` as a `/* --- <Component> --- */` section before "Breakpoints", with
   narrow-width rules in the shared `max-width` blocks.
5. **URL state:** one `*Query.ts` module in the lab's folder, a line under "URL contracts"
   below, and its URLs passed to `axeStates` in the lab's spec, which scans each in four modes.
6. **Live example:** its own `e2e/<topic>-live.spec.ts`.

## Lab and live-example gotchas

- macOS's disk is case-insensitive, so a component can't share a model's name with different
  case: `mockPlayer.ts` and `MockPlayer.tsx` are one file there. Name the drawing differently
  (`PlayerWindow.tsx`, `SiteWindow.tsx`).
- The bar sends real events into the inert fail stage. `el.click()`, `keydown`, pointer events
  and `focusin`/`focusout` all reach the example's own handlers. Hover is `mouseover`/`mouseout`,
  so use `onMouseEnter`/`onMouseLeave`, not CSS `:hover`. A pass example that listens on
  `document` must ignore untrusted events from outside itself, or the fail bar reaches it.
- Hide a closed popup with the `hidden` attribute, and keep status regions in the DOM from the
  start, never `display: none`. The stage reads attributes: a stop hidden by CSS alone still
  counts as a Tab stop.
- `aria-labelledby` and `<label for>` ids resolve only inside the example root, so keep labels
  inside the example.
- Memoise a lab's `said` on what it derives from. A new object every render restarts the 500 ms
  timer, so the lab never announces.
- axe's `color-contrast` skips inert content and `link-in-text-block` doesn't. A hue-only link
  on the fail stage must be a `<span>`. `data-depicts-failure` is for depicted content axe would
  otherwise fail. Tests hold every mark to `figure.bad` or a `[data-lab-mock]`, and a passing
  lab start has none.

## URL contracts

- All criteria and Home: `?p=1..4`, `?l=A|AA`, `?new`, `?q=`, handled only in
  `src/catalog/urlQuery.ts`.
- Colour check: `?fg=` and `?bg=`, handled only in `src/labs/colour-check/pairQuery.ts`.
- 4.1.2 flagship lab: `?el=`, `?name=`, `?state=`, `?on=`, handled only in `src/labs/name-role-value/nrvQuery.ts`.
- 2.4.7 flagship lab: `?w=`, `?off=`, `?c=`, handled only in `src/labs/focus-ring/ringQuery.ts`.
- 1.1.1 flagship lab: `?img=`, `?alt=` (absent: no alt attribute), handled only in `src/labs/alt-text/altQuery.ts`.
- 1.3.1 flagship lab: `?mock=`, `?real=` (comma list), handled only in `src/labs/structure/structureQuery.ts`.
- 2.5.8 flagship lab: `?size=8..44`, `?gap=0..24`, handled only in `src/labs/target-size/targetQuery.ts`.
- 2.4.3 flagship lab: `?src=`, `?ti=`, handled only in `src/labs/focus-order/orderQuery.ts`.
- 1.4.10 flagship lab: `?zoom=100|200|400`, `?layout=fixed|reflow`, handled only in `src/labs/reflow/reflowQuery.ts`.
- 2.2.1 flagship lab: `?limit=60|120|300`, `?help=none|late|extend|adjust|off`, handled only in `src/labs/session-timeout/timeoutQuery.ts`. The lab's clock is never in the URL.
- 1.4.12 flagship lab: `?spacing=` (comma list of `line,paragraph,letter,word`, may be empty), `?boxes=fixed|flexible`, handled only in `src/labs/text-fit/spacingQuery.ts`.
  A flagship lab pre-renders its start, applies the query in a mount effect without announcing
  it, and writes changes back with `history.replaceState` (the start writes no query).

## Running e2e

- Several checkouts (git worktrees) can't share the default port 4173: `reuseExistingServer`
  makes one checkout's scan silently test another checkout's build. Give each its own port with
  `E2E_PORT=4505 npm run verify`.
- `E2E_WORKERS` sets Playwright's workers (default 6, sized for one suite on a 10-core machine).
  When several checkouts run the suite at once, set `E2E_WORKERS=2` in each, or tests fail on
  the 30s timeout. Locally a failed test is retried once
  (never on CI), and `test:a11y` ends by printing every test that passed only on retry and the
  15 slowest (`scripts/flaky.mjs`, reading `test-results/results.json`). Treat a flaky test as a
  bug to fix, not a pass.
- CI (`.github/workflows/verify.yml`) runs lint, types, unit tests and the build once, uploads
  `dist/`, then runs Playwright in four parallel shards (`--shard=i/4`) against that build, each
  printing its own `scripts/flaky.mjs` summary. `deploy.yml` calls the same workflow and deploys
  that `dist/` only when every shard has passed.
- `npm run verify:changed` runs lint, types, unit tests and the build, then only the e2e spec
  files changed since `labs` (`playwright test --only-changed=labs`). A new lab's spec is its
  own file, so this runs just that lab's bar. The lab bar's tests report their location as
  `e2e/labs/support.ts`; the describe name says which lab. Iterate with it; commit
  only on a green `npm run verify`.
- Merging a branch whose full gate passed: if the target branch has not moved since the branch
  was cut (`git merge-base --is-ancestor <target> <branch>`), the merged tree is the tree that
  passed, so the gate is not re-run; confirm with `npm run build`. If the target has moved, run
  the full `npm run verify` on the merge.
- Open pages with `open(page, url)` from `e2e/support/open.ts`: it checks the page was built
  (200), waits for `<html data-hydrated="true">` and then for `document.fonts.ready`, so
  controls are live and geometry is measured in the real fonts. After a reload or a navigation
  the test caused, call `whenReady(page)`. `tests/e2eOpen.test.ts` fails if a spec waits for
  hydration itself.
- The suite covers about 1,500 tests across 60 pages. On a heavily loaded machine, tests fail on
  the 30s timeout rather than on assertions. Re-run those with
  `npx playwright test --last-failed --workers=1` before treating them as real. Assertion
  failures are always real.
- Press input-bar buttons by keyboard (`locator.press('Enter')`, or focus then Enter), not with
  `click()`. A click leaves the real mouse resting on the page, and while the page smooth-scrolls
  under it a stray real `mouseover` reaches the live example and overrides the bar's pointer.
- Mark a test `test.slow()` if it runs more than one full-page axe scan. Two scans per test come
  close to the 30s limit under load.
- A lab announces `ANNOUNCE_DELAY_MS` (500 ms) after the reader's last change. Wait for an
  announcement on its own budget (`heard` in `e2e/labs/support.ts`, 15s). To show something was
  *not* announced, wait past two delays first, then assert the region is unchanged.
- Mock play and the running clock are real time. Reach a time with Wait presses or the player's
  slider (ArrowRight is +1 s). Drive Play by the bar only on the fail stage, and poll with a long
  timeout.
