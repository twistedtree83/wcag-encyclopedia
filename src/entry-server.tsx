/**
 * The build-time renderer (ADR 0001). `scripts/prerender.mjs` imports the SSR build of this
 * module and writes one static HTML file per route; `entry-client.tsx` hydrates it.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { postFor } from './blog/bodies';
import { postMeta } from './blog/posts';
import { criterion } from './criteria/corpus';
import { analyticsBeacon } from './site/analytics';
import { CF_ANALYTICS_TOKEN } from './site/config';
import { trailFor } from './site/breadcrumbs';
import { jsonLdBlocks, jsonLdScripts } from './site/jsonLd';
import { legacyRedirectScript } from './site/legacyRedirect';
import { absoluteUrl } from './site/crawl';
import { shareCard, shareTags } from './site/share';
import { Site, pageMeta, pageName, recordFor } from './site/Site';
import { NOT_FOUND, ROUTES, type Route } from './site/routes';

export { NOT_FOUND, ROUTES };
export { jsonLdProblems } from './site/jsonLd';
export { canonicalProblems, canonicalTag, openGraphProblems, pageSources, robotsTxt, sitemapProblems, sitemapXml } from './site/crawl';
export { CARD_FONTS, CARD_HEIGHT, CARD_WIDTH, cardContrastProblems, shareCard, toSatori } from './site/share';

/**
 * A route rendered for the prerender step: the app markup, the title and description, and
 * `head`, extra markup for the page's `<head>` (the old `#number` redirect on Home, and
 * `noindex` on the 404 page),
 * `beacon`, the analytics script for the end of `<body>` (empty while its token is unset), and
 * `share`, the Open Graph and Twitter tags that point at the page's share card (none on the
 * 404 page, which has no address of its own to share).
 */
export type Rendered = {
  html: string;
  title: string;
  description: string;
  head: string;
  beacon: string;
  share: string;
};

/** Keeps the 404 page out of search results; no other page carries it. */
export const NOINDEX = '<meta name="robots" content="noindex" />';

export function render(route: Route): Rendered {
  const html = renderToString(
    <StrictMode>
      <Site route={route} post={route.page === 'post' ? postFor(route.slug) : undefined} />
    </StrictMode>,
  );
  const head = route.page === 'home' ? legacyRedirectScript() : route.page === 'not-found' ? NOINDEX : '';
  return { html, head, beacon: analyticsBeacon(CF_ANALYTICS_TOKEN), share: route.page === 'not-found' ? '' : shareTags(route), ...pageMeta(route) };
}

/**
 * A route's JSON-LD script elements for `<head>` (src/site/jsonLd.ts). `dates` are the first
 * and last commit to the page's source files, which only the prerender step can read. A post is
 * dated by its frontmatter instead, as its page shows it.
 */
export function structuredData(route: Route, dates: { published: string; modified: string }): string {
  const name = pageName(route);
  const record = route.page === 'criterion' ? recordFor(route) : undefined;
  const post = route.page === 'post' ? postMeta(route.slug) : undefined;
  return jsonLdScripts(
    jsonLdBlocks({
      route,
      trail: trailFor(route, name),
      headline: name,
      description: pageMeta(route).description,
      ...(post ? { published: post.published, modified: post.updated ?? post.published } : dates),
      ...(record ? { criterion: { num: record.num, name: record.name } } : {}),
      ...(post ? { discusses: post.criteria.map((num) => ({ num, name: criterionName(num) })) } : {}),
      ...(record || post ? { image: absoluteUrl(shareCard(route).file) } : {}),
    }),
  );
}

function criterionName(num: string): string {
  const record = criterion(num);
  if (!record) throw new Error(`no criterion record for ${num}`);
  return record.name;
}
