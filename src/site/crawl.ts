/**
 * What crawlers read (ADR 0006): each page's canonical tag, robots.txt and sitemap.xml. These
 * are the only places the site writes an absolute address, and every one is SITE_ORIGIN joined
 * to a route's path. `scripts/prerender.mjs` writes them (it imports this module through the
 * SSR build of `src/entry-server.tsx`) and runs `canonicalProblems` on every page it writes.
 *
 * Pure strings, no JSX and no Node APIs, so the unit tests and the e2e specs import it too.
 */

import { SITE_ORIGIN } from './config';
import type { Route } from './routes';

/** A route's address on the production site: `criteria/1.4.3/` → `https://…/criteria/1.4.3/`. */
export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}/${path}`;
}

export function canonicalTag(path: string): string {
  return `<link rel="canonical" href="${absoluteUrl(path)}" />`;
}

/**
 * The ADR 0006 check on one page's markup: exactly one canonical tag, whose href is
 * SITE_ORIGIN joined to the page's own route path. Returns what is wrong, or `[]`.
 */
export function canonicalProblems(html: string, path: string): string[] {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const canonicals = links.filter((tag) => /\brel\s*=\s*["']?canonical["'\s/>]/i.test(tag));
  if (canonicals.length === 0) return ['no canonical tag'];
  if (canonicals.length > 1) return [`${canonicals.length} canonical tags`];

  const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(canonicals[0] ?? '');
  const url = href ? (href[1] ?? href[2]) : undefined;
  if (url === undefined) return ['the canonical tag has no href'];
  const problems: string[] = [];
  if (!url.startsWith(`${SITE_ORIGIN}/`)) problems.push(`${url} does not start with ${SITE_ORIGIN}/`);
  if (url !== absoluteUrl(path)) problems.push(`${url} is not ${absoluteUrl(path)}, the page's own route`);
  return problems;
}

export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('sitemap.xml')}\n`;
}

/** One page in the sitemap: its route path and the date its sources last changed. */
export type SitemapEntry = { readonly path: string; readonly lastmod: string };

/** W3C Datetime, as the sitemaps.org schema allows it: a date, or a date and time with zone. */
const W3C_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

const escapeXml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&apos;').replaceAll('"', '&quot;');

export function sitemapXml(entries: readonly SitemapEntry[]): string {
  const urls = entries.map(({ path, lastmod }) => {
    if (!W3C_DATE.test(lastmod)) throw new Error(`sitemap: ${path || 'home'} has lastmod "${lastmod}", not a W3C date`);
    return ['  <url>', `    <loc>${escapeXml(absoluteUrl(path))}</loc>`, `    <lastmod>${lastmod}</lastmod>`, '  </url>'];
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.flat(),
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * The sitemaps.org 0.9 schema's rules, checked by hand (no XML library in the build): a
 * `urlset` root in the sitemap namespace holding only `url` elements, each with one absolute
 * `loc` of at most 2,048 characters and then the optional `lastmod`, `changefreq` and
 * `priority` in that order; at most 50,000 URLs; text escaped. Also fails a repeated `loc`.
 */
export function sitemapProblems(xml: string): string[] {
  const problems: string[] = [];
  const doc = /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">([\s\S]*)<\/urlset>\s*$/.exec(xml);
  if (!doc) return ['not a urlset in the http://www.sitemaps.org/schemas/sitemap/0.9 namespace'];
  if (/&(?!(amp|lt|gt|apos|quot);)/.test(xml)) problems.push('an unescaped &');

  const body = doc[1] ?? '';
  const urls = [...body.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  if (body.replace(/<url>[\s\S]*?<\/url>/g, '').trim() !== '') problems.push('urlset holds something other than url elements');
  if (urls.length === 0) problems.push('no url elements');
  if (urls.length > 50_000) problems.push(`${urls.length} urls, over the 50,000 limit`);

  const URL_BODY =
    /^\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>\s*)?(?:<changefreq>(always|hourly|daily|weekly|monthly|yearly|never)<\/changefreq>\s*)?(?:<priority>(0(\.\d+)?|1(\.0+)?)<\/priority>\s*)?$/;
  const seen = new Set<string>();
  for (const [, inner = ''] of urls) {
    const url = URL_BODY.exec(inner);
    if (!url) {
      problems.push(`a url element the schema does not allow: ${inner.trim()}`);
      continue;
    }
    const [, loc = '', lastmod] = url;
    if (!/^https?:\/\/[^/\s]+\/\S*$/.test(loc)) problems.push(`${loc} is not an absolute URL`);
    if (loc.length < 12 || loc.length > 2048) problems.push(`${loc} is not 12 to 2,048 characters`);
    if (lastmod !== undefined && !W3C_DATE.test(lastmod)) problems.push(`${loc} has lastmod "${lastmod}", not a W3C date`);
    if (seen.has(loc)) problems.push(`${loc} is listed twice`);
    seen.add(loc);
  }
  return problems;
}

const PAGE_FILES: Record<Exclude<Route['page'], 'criterion'>, string> = {
  home: 'src/pages/HomePage.tsx',
  criteria: 'src/pages/CriteriaPage.tsx',
  'colour-check': 'src/pages/ColourCheckPage.tsx',
  about: 'src/pages/AboutPage.tsx',
  'not-found': 'src/pages/NotFoundPage.tsx',
};

/**
 * The repository files a page's content comes from, whose last commit date is its sitemap
 * `lastmod`: the criterion record's guideline file for a criterion page (`1.4.3` →
 * `src/criteria/g1-4.tsx`), and the page component for a fixed page. The shared shell is left
 * out, so a header change doesn't mark every page as changed.
 */
export function pageSources(route: Route): string[] {
  if (route.page === 'criterion') {
    const [principle, guideline] = (route.num ?? '').split('.');
    return [`src/criteria/g${principle}-${guideline}.tsx`];
  }
  return [PAGE_FILES[route.page]];
}
