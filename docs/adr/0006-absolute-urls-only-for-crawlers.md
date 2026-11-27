# 0006: Absolute URLs only where crawlers require them

Pages still link to each other with relative URLs (ADR 0001). The exceptions are the places
whose formats require an absolute address: the canonical `<link>`, the Open Graph `og:url` and
`og:image`, structured data (JSON-LD), `sitemap.xml`, `robots.txt` and the blog feed. They are
built from one constant, `SITE_ORIGIN` (`https://wcagencyclopedia.com`) in `src/site/config.ts`,
joined to a route's path, so no file spells the domain out.

The canonical form of every page is the bare domain, over HTTPS, with a trailing slash
(`https://wcagencyclopedia.com/criteria/1.4.3/`). It matches what the Worker serves: `www`
redirects to the bare domain (ADR 0005) and `auto-trailing-slash` serves both spellings of a
path.

## Considered options

- **Make every link absolute.** Rejected. Relative links keep any preview, local `vite preview`
  or future prefix working, and the e2e suite runs against `localhost`.
- **Write the domain into each place that needs it.** Rejected. A domain change, or a typo in
  one place, would split the site's ranking between two addresses without failing a test.

## Consequences

- A unit test reads every built page and fails if a canonical URL, `og:url` or JSON-LD `url`
  does not start with `SITE_ORIGIN`, or does not match the page's own route.
- On a preview or `localhost` build the canonical tags still point at production. That is
  intended: a preview copy that gets crawled credits production.
