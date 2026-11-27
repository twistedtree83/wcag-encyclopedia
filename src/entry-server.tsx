/**
 * The build-time renderer (ADR 0001). `scripts/prerender.mjs` imports the SSR build of this
 * module and writes one static HTML file per route; `entry-client.tsx` hydrates it.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { analyticsBeacon } from './site/analytics';
import { CF_ANALYTICS_TOKEN } from './site/config';
import { legacyRedirectScript } from './site/legacyRedirect';
import { Site, pageMeta } from './site/Site';
import { NOT_FOUND, ROUTES, type Route } from './site/routes';

export { NOT_FOUND, ROUTES };
export { canonicalProblems, canonicalTag, pageSources, robotsTxt, sitemapProblems, sitemapXml } from './site/crawl';

/**
 * A route rendered for the prerender step: the app markup, the title and description, and
 * `head`, extra markup for the page's `<head>` (the old `#number` redirect on Home, and
 * `noindex` on the 404 page), and
 * `beacon`, the analytics script for the end of `<body>` (empty while its token is unset).
 */
export type Rendered = {
  html: string;
  title: string;
  description: string;
  head: string;
  beacon: string;
};

/** Keeps the 404 page out of search results; no other page carries it. */
export const NOINDEX = '<meta name="robots" content="noindex" />';

export function render(route: Route): Rendered {
  const html = renderToString(
    <StrictMode>
      <Site route={route} />
    </StrictMode>,
  );
  const head = route.page === 'home' ? legacyRedirectScript() : route.page === 'not-found' ? NOINDEX : '';
  return { html, head, beacon: analyticsBeacon(CF_ANALYTICS_TOKEN), ...pageMeta(route) };
}
