# PRD — Search: technical SEO, a blog, and searchable criterion pages

The site is verified in Google Search Console (a DNS Domain property, so nothing in the repo
carries a token). This PRD covers everything the site itself has to provide to be crawled,
understood and ranked: crawl files and head metadata, structured data, share cards, a blog of
posts, and criterion pages that answer what people actually search for.

Decisions with lasting consequences: ADR 0006 (absolute URLs only for crawlers) and ADR 0007
(posts are Markdown, held to a writing standard). Vocabulary: **Post**, **Test procedure** and
**Common question** in `CONTEXT.md`.

## Decisions

- **Posts cover what no criterion page does**: topics that span criteria, changes between WCAG
  versions, the law, and ways of testing. Every post links to each criterion page it discusses
  and never restates one.
- **No byline, and no mention of how posts are written.** JSON-LD names the organisation as
  author and publisher.
- **Every post goes through a PR the owner approves.** Drafted to `docs/WRITING.md`, checked by
  the writing test in the verify gate.
- **Sources are primary only**: W3C (WCAG, Understanding, Techniques), legal texts and regulator
  guidance, and browser or assistive-technology vendor documentation. Each one is fetched and
  checked while drafting, and each post lists its sources. No statistic without a primary source.
- **Posts may show existing criterion examples and labs** by reference, and never define new
  interface.
- **Blog URLs** are `/blog/` (newest first) and `/blog/<slug>/`. Slugs are permanent. Posts
  show a published and an updated date. No tags or category pages. "Blog" goes in the header nav.
- **Criterion pages** list up to three posts that discuss them, newest first, under "Further
  reading", and only when at least one exists.
- **Criterion pages gain a test procedure and common questions**, written to the same standard.
  The common questions carry no `FAQPage` markup, because Google no longer shows FAQ rich
  results for sites like this.
- **Titles and descriptions are unique per page.** Criterion pages build theirs from the record:
  "1.4.3 Contrast (Minimum) explained, with examples | WCAG 2.2 AA", and a description made from
  the restatement and the most common way the criterion fails, at most 160 characters.
- **Share cards** are generated per criterion page and post at build time, with one site card
  for the fixed pages.
- **Analytics** is Cloudflare Web Analytics: cookieless, no consent banner, and off until its
  token is set in `config.ts`.
- **Launch posts** are the six in S-11 to S-16, then one a week.

## The one step outside the repo

After the first deploy that ships `sitemap.xml`, submit `https://wcagencyclopedia.com/sitemap.xml`
in Search Console → Sitemaps. For analytics, create the site in Cloudflare → Analytics & Logs →
Web Analytics and put its token in `CF_ANALYTICS_TOKEN`.

## Out of scope

- Tag, category or author pages.
- Comments, newsletter sign-up, social sharing buttons.
- Posts in languages other than English.
- Any automated publishing without a human merge.
- `FAQPage`, `HowTo` or review markup.

---

## Tickets

Each ticket must pass `npm run verify`, and each page it adds must pass the axe scan in both
themes and at 320px.

### S-01 Site origin, canonical URLs, robots.txt and sitemap.xml

`SITE_ORIGIN` in `src/site/config.ts`. Every page gets a `<link rel="canonical">` built from it
(ADR 0006). The prerender step writes `dist/robots.txt` (allow all, `Sitemap:` line) and
`dist/sitemap.xml`, listing every route from `ROUTES` with `lastmod` taken from the git date of
the files that page is built from (the criterion record for a criterion page).

- [ ] Every built page has exactly one canonical tag, equal to `SITE_ORIGIN` + its route path
- [ ] `sitemap.xml` is valid against the sitemaps.org schema and lists exactly the routes in `ROUTES`
- [ ] `robots.txt` allows all and points to the sitemap
- [ ] The ADR 0006 test fails on a canonical URL that is relative or points at another route
- [ ] `docs/CONVENTIONS.md` says where the crawl files come from

### S-02 Unique titles and descriptions, and a head-metadata test

Criterion pages build their title and description from the record (see Decisions). Fixed pages
keep hand-written ones, reviewed against the same limits.

- [ ] A unit test over every built page fails on a missing, duplicate, or out-of-range title (30–65 characters) or description (70–160 characters)
- [ ] All 55 criterion descriptions are different from each other and contain no template sentence that repeats across them
- [ ] Titles never repeat the brand twice, and the home title leads with the brand

### S-03 Open Graph, Twitter cards and generated share images

Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`,
`og:site_name`) and `twitter:card=summary_large_image` on every page. Share cards are
1200×630 PNGs rendered at build time (satori + resvg, build dependencies only): criterion
number, name, level and principle marker in the design guide's type and tokens. One site card
is used for the fixed pages.

- [ ] Every page's `og:image` resolves to a file in `dist/` that is 1200×630
- [ ] Card text meets 4.5:1 against its background, checked by the contrast engine
- [ ] No new runtime dependency: the client bundle size does not grow
- [ ] Every image carries `og:image:alt`

### S-04 Structured data

JSON-LD per page: `WebSite` (with `SearchAction` only if the index's search accepts a query
parameter; otherwise none) and `Organization` on home, `BreadcrumbList` on every page below home,
and `TechArticle` on criterion pages (`headline`, `about` naming the criterion, `datePublished`,
`dateModified`, author and publisher the organisation).

- [ ] Every JSON-LD block parses, and a unit test checks the required properties per page kind
- [ ] Breadcrumbs match the visible breadcrumb trail where one exists
- [ ] All URLs are absolute and built from `SITE_ORIGIN`

### S-05 A real 404 page

A pre-rendered "Page not found" page in the site shell, linking to home, all criteria and the
blog. The Worker serves it with status 404 for any path that matches no asset.

- [ ] An unknown path returns status 404 with the page's markup
- [ ] The page has `noindex` and is absent from the sitemap
- [ ] The page passes the axe scan

### S-06 Cloudflare Web Analytics

`CF_ANALYTICS_TOKEN: string | undefined` in `config.ts`. While it is unset, no beacon is
rendered. When it is set, every page loads the beacon script `defer` with that token.

- [ ] With the token unset, no built page references `cloudflareinsights`
- [ ] With a token set, every page has exactly one beacon tag
- [ ] No cookie is set and no consent banner is added

### S-07 Blog: posts, the blog index and the post page

Posts in `src/blog/posts/<slug>.md`, with frontmatter `title`, `description`, `published`,
`updated?` and `criteria` (the criterion numbers it discusses). Rendered at build time to
`/blog/<slug>/`, with the index at `/blog/`. Both join `ROUTES` and so the sitemap and the axe
scan. "Blog" joins the header nav. `BlogPosting` JSON-LD on each post. Ships with one fixture
post that exists only in tests.

- [ ] Adding a post is adding one Markdown file: no list is edited (the same reason as ADR 0004)
- [ ] Every link in a post body to a criterion uses its criterion page, and a link to a criterion that isn't in `criteria` fails the build
- [ ] A post page shows its title, published date and updated date (when set), with no byline
- [ ] No Markdown parser code reaches the client bundle
- [ ] The post's headings start at h2 under the page's h1, and the outline test passes

### S-08 Showing criterion examples and labs inside a post

A directive in post Markdown (for example `::example{num="1.4.3"}` and `::lab{id="contrast"}`)
that renders that criterion's existing fail and pass examples, or that lab, exactly as on its
criterion page, with a link to the criterion page.

- [ ] An unknown criterion number or lab id fails the build
- [ ] An embedded lab works, hydrates and passes its axe states on the post page as it does on its criterion page
- [ ] A post can't define its own example or lab: there is no directive for it

### S-09 Blog feed and "Further reading" on criterion pages

An Atom feed at `/blog/feed.xml`, with full content, linked from the head of every blog page.
Each criterion page lists up to three posts whose `criteria` include it, newest first, under
"Further reading", and only when one exists.

- [ ] The feed validates as Atom 1.0 and its entry URLs are absolute
- [ ] A criterion page with no posts shows no "Further reading" heading
- [ ] The list is derived from post frontmatter: no hand-kept list

### S-10 The writing standard and the writing test

`docs/WRITING.md` (see ADR 0007), and the unit test over every post and every test procedure and
common question.

- [ ] `WRITING.md` covers voice, banned constructions with the reason for each, required substance, sources, length (posts 900–2,500 words) and how to name a criterion
- [ ] The test fails on each banned phrase and pattern (a test case for each), on missing frontmatter, on no criterion link, on no source from the allowed domains, and on length
- [ ] The banned list includes at least: "delve", "in today's digital landscape", "it's important to note", "not just X, but Y" / "it's not X, it's Y", "navigate the complexities", "unlock", "seamless", "robust" (outside 4.x Robust), "game-changer", "in conclusion", "ever-evolving", em-dash runs of more than one per paragraph, and three-item lists of adjectives
- [ ] `CLAUDE.md` points to `WRITING.md`

### S-11 to S-16 Launch posts (not AFK: each needs the owner's approval on its PR)

Each one is drafted to `WRITING.md`, with every source fetched and checked, and at least one
criterion example or lab shown.

- **S-11** What's new in WCAG 2.2: the six new criteria, and why 4.1.1 Parsing was removed
- **S-12** The European Accessibility Act: what WCAG level it actually requires
- **S-13** Accessible forms: every criterion a form touches
- **S-14** Colour contrast beyond text: 1.4.3, 1.4.11 and 1.4.1 together
- **S-15** Keyboard accessibility: 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11 and 2.4.13
- **S-16** How to test a page in 15 minutes: an order of manual checks

### S-17 Test procedures and common questions: the record shape and their sections

`procedure` and `questions` join the criterion record, optional for now. The criterion page
renders "How to test" (an ordered list) and "Common questions" (each question a heading, with
its answer) when present, between the examples and the labs. Authored for 4.1.2 and 4.1.3.

- [ ] The two sections render, and the outline and axe tests pass on the two pages
- [ ] The writing test covers both fields

### S-18 to S-20 Authoring test procedures and common questions

- **S-18** Perceivable (20 criteria)
- **S-19** Operable (20 criteria)
- **S-20** Understandable (13 criteria)

Each answer is checked against the W3C Understanding document for its criterion. None copies
normative text.

### S-21 Make test procedures and common questions required

- [ ] The data-integrity test fails on any of the 55 records without a `procedure` of at least three steps and at least one common question
