/**
 * Structured data (docs/PRD-seo.md, S-04): the JSON-LD blocks in each page's `<head>`, and
 * the check `scripts/prerender.mjs` runs on every page it writes. Every address in them is
 * absolute and built from SITE_ORIGIN (ADR 0006).
 *
 *   home                         WebSite (with a SearchAction into All criteria) and Organization
 *   every page below home        BreadcrumbList, the same trail the page shows (breadcrumbs.ts)
 *   criterion pages              TechArticle, by and from the organisation, its share card the image
 *
 * A new page kind adds its blocks to `BLOCKS` and the types it must carry to `TYPES` (both
 * typed by PageKind, so the compiler flags a missing entry); a new block type adds its
 * required properties to `REQUIRED` and any deeper check to `CHECKS`.
 *
 * Pure strings, no JSX and no Node APIs, so the unit tests and the e2e specs import it too.
 */

import { SITE_ORIGIN } from './config';
import { absoluteUrl } from './crawl';
import type { Crumb } from './breadcrumbs';
import { PATHS, type PageKind, type Route } from './routes';

export const SITE_NAME = 'WCAG Encyclopedia';

/** One JSON-LD object, written as its own `<script type="application/ld+json">`. */
export type JsonLdBlock = { readonly '@context': 'https://schema.org'; readonly '@type': string } & Record<string, unknown>;

/** What the blocks are built from, gathered by `structuredData` in src/entry-server.tsx. */
export type PageFacts = {
  readonly route: Route;
  /** The page's breadcrumb trail, Home first and the page last; empty on home. */
  readonly trail: readonly Crumb[];
  readonly headline: string;
  readonly description: string;
  /** W3C dates (`2025-06-01`): the first and last commit to the page's source files. */
  readonly published: string;
  readonly modified: string;
  /** The criterion a criterion page is about. */
  readonly criterion?: { readonly num: string; readonly name: string };
  /** The absolute address of the page's share card (src/site/share.ts), the article's image. */
  readonly image?: string;
};

const block = (type: string, body: Record<string, unknown>): JsonLdBlock => ({
  '@context': 'https://schema.org',
  '@type': type,
  ...body,
});

/** The organisation behind the site: the author and publisher of every article. */
const organization = () => ({ '@type': 'Organization', name: SITE_NAME, url: absoluteUrl(PATHS.home) });

function website(): JsonLdBlock {
  return block('WebSite', {
    name: SITE_NAME,
    url: absoluteUrl(PATHS.home),
    // The All criteria search reads ?q= on load (src/catalog/urlQuery.ts).
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl(PATHS.criteria)}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  });
}

function breadcrumbList(trail: readonly Crumb[]): JsonLdBlock {
  return block('BreadcrumbList', {
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  });
}

function techArticle(page: PageFacts): JsonLdBlock {
  const { num, name } = page.criterion ?? { num: '', name: '' };
  const url = absoluteUrl(page.route.path);
  return block('TechArticle', {
    headline: page.headline,
    description: page.description,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    datePublished: page.published,
    dateModified: page.modified,
    ...(page.image ? { image: page.image } : {}),
    author: organization(),
    publisher: organization(),
    about: {
      '@type': 'DefinedTerm',
      name: `${num} ${name}`,
      termCode: num,
      inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'WCAG 2.2 success criteria' },
    },
  });
}

const BLOCKS: Record<PageKind, (page: PageFacts) => JsonLdBlock[]> = {
  home: () => [website(), block('Organization', { name: SITE_NAME, url: absoluteUrl(PATHS.home) })],
  criteria: (page) => [breadcrumbList(page.trail)],
  'colour-check': (page) => [breadcrumbList(page.trail)],
  about: (page) => [breadcrumbList(page.trail)],
  criterion: (page) => [breadcrumbList(page.trail), techArticle(page)],
};

export function jsonLdBlocks(page: PageFacts): JsonLdBlock[] {
  return BLOCKS[page.route.page](page);
}

/** The blocks as script elements, with `<` escaped so no text can end the element early. */
export function jsonLdScripts(blocks: readonly JsonLdBlock[]): string {
  return blocks
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b).replaceAll('<', '\\u003c')}</script>`)
    .join('\n    ');
}

// ---------------------------------------------------------------------------------------------
// The check

/** The block types each page kind carries, exactly. */
const TYPES: Record<PageKind, readonly string[]> = {
  home: ['Organization', 'WebSite'],
  criteria: ['BreadcrumbList'],
  'colour-check': ['BreadcrumbList'],
  about: ['BreadcrumbList'],
  criterion: ['BreadcrumbList', 'TechArticle'],
};

/** The properties each block type must have, non-empty. */
const REQUIRED: Record<string, readonly string[]> = {
  WebSite: ['name', 'url'],
  Organization: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  TechArticle: ['headline', 'url', 'datePublished', 'dateModified', 'author', 'publisher', 'about'],
};

type Check = (b: Record<string, any>, route: Route) => string[];

const own = (route: Route, url: unknown, what: string) =>
  url === absoluteUrl(route.path) ? [] : [`${what} ${String(url)} is not ${absoluteUrl(route.path)}, the page's own route`];

const isOrg = (value: any) => value?.['@type'] === 'Organization' && value.name === SITE_NAME && value.url === absoluteUrl(PATHS.home);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Deeper checks per block type, beyond the required properties. */
const CHECKS: Record<string, Check> = {
  WebSite: (b, route) => own(route, b.url, 'WebSite url'),
  BreadcrumbList: (b, route) => {
    const items: any[] = Array.isArray(b.itemListElement) ? b.itemListElement : [];
    const problems: string[] = [];
    if (items.length < 2) problems.push(`BreadcrumbList has ${items.length} item(s), not Home and the page`);
    items.forEach((item, i) => {
      if (item?.['@type'] !== 'ListItem' || item.position !== i + 1 || !item.name) problems.push(`BreadcrumbList item ${i + 1} is not a named ListItem at position ${i + 1}`);
    });
    if (items[0]?.item !== absoluteUrl(PATHS.home)) problems.push('BreadcrumbList does not start at Home');
    return [...problems, ...own(route, items.at(-1)?.item, 'BreadcrumbList last item')];
  },
  TechArticle: (b, route) => {
    const problems = [...own(route, b.url, 'TechArticle url'), ...own(route, b.mainEntityOfPage, 'TechArticle mainEntityOfPage')];
    for (const key of ['datePublished', 'dateModified']) if (!DATE.test(String(b[key]))) problems.push(`TechArticle ${key} "${b[key]}" is not a date`);
    if (String(b.datePublished) > String(b.dateModified)) problems.push('TechArticle datePublished is after dateModified');
    if (!isOrg(b.author)) problems.push('TechArticle author is not the organisation');
    if (!isOrg(b.publisher)) problems.push('TechArticle publisher is not the organisation');
    if (!b.about?.name || b.about.termCode !== route.num || !String(b.about.name).startsWith(`${route.num} `))
      problems.push(`TechArticle about does not name criterion ${route.num}`);
    return problems;
  },
};

/** Keys whose value is an address, which must be absolute and on SITE_ORIGIN. */
const URL_KEYS = new Set(['url', 'item', '@id', 'urlTemplate', 'mainEntityOfPage', 'sameAs', 'logo', 'image']);

function urlProblems(value: unknown, key = ''): string[] {
  // The vocabulary's address, checked on its own in jsonLdProblems, is not a page address.
  if (key === '@context') return [];
  if (typeof value === 'string') {
    const looksLikeUrl = URL_KEYS.has(key) || /^[a-z][a-z+.-]*:\/\//i.test(value) || value.startsWith('/');
    return looksLikeUrl && !value.startsWith(`${SITE_ORIGIN}/`) ? [`${key || 'a value'} ${value} does not start with ${SITE_ORIGIN}/`] : [];
  }
  if (Array.isArray(value)) return value.flatMap((v) => urlProblems(v, key));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => urlProblems(v, k));
  return [];
}

const empty = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * The S-04 check on one page's markup: every JSON-LD block parses and is a schema.org object,
 * the page carries exactly the block types its kind needs, each has its required properties,
 * and every address is absolute on SITE_ORIGIN and, where it names the page, its own route.
 * Returns what is wrong, or `[]`.
 */
export function jsonLdProblems(html: string, route: Route): string[] {
  const problems: string[] = [];
  const parsed: Record<string, any>[] = [];
  for (const [, body = ''] of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      parsed.push(JSON.parse(body));
    } catch {
      problems.push(`a JSON-LD block does not parse: ${body.slice(0, 60)}`);
    }
  }

  const types = parsed.map((b) => String(b['@type'])).sort();
  const want = [...TYPES[route.page]].sort();
  if (types.join() !== want.join()) problems.push(`carries [${types.join(', ')}], not [${want.join(', ')}]`);

  for (const b of parsed) {
    const type = String(b['@type']);
    if (b['@context'] !== 'https://schema.org') problems.push(`${type} has @context ${b['@context']}, not https://schema.org`);
    for (const key of REQUIRED[type] ?? []) if (empty(b[key])) problems.push(`${type} has no ${key}`);
    problems.push(...(CHECKS[type]?.(b, route) ?? []), ...urlProblems(b));
  }
  return problems;
}
