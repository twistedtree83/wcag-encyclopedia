/**
 * The build-time renderer (ADR 0001). `scripts/prerender.mjs` imports the SSR build of this
 * module and writes one static HTML file per route; `entry-client.tsx` hydrates it.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { analyticsBeacon } from './site/analytics';
import { CF_ANALYTICS_TOKEN } from './site/config';
import { legacyRedirectScript } from './site/legacyRedirect';
import { shareTags } from './site/share';
import { Site, pageMeta } from './site/Site';
import { ROUTES, type Route } from './site/routes';

export { ROUTES };
export { canonicalProblems, canonicalTag, openGraphProblems, pageSources, robotsTxt, sitemapProblems, sitemapXml } from './site/crawl';
export { CARD_FONTS, CARD_HEIGHT, CARD_WIDTH, cardContrastProblems, shareCard, toSatori } from './site/share';

/**
 * A route rendered for the prerender step: the app markup, the title and description, and
 * `head`, extra markup for the page's `<head>` (the old `#number` redirect, on Home only), and
 * `beacon`, the analytics script for the end of `<body>` (empty while its token is unset), and
 * `share`, the Open Graph and Twitter tags that point at the page's share card.
 */
export type Rendered = {
  html: string;
  title: string;
  description: string;
  head: string;
  beacon: string;
  share: string;
};

export function render(route: Route): Rendered {
  const html = renderToString(
    <StrictMode>
      <Site route={route} />
    </StrictMode>,
  );
  const head = route.page === 'home' ? legacyRedirectScript() : '';
  return { html, head, beacon: analyticsBeacon(CF_ANALYTICS_TOKEN), share: shareTags(route), ...pageMeta(route) };
}
