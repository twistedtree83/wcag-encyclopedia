/**
 * Every pre-rendered page, as data (ADR 0001).
 *
 * The prerender step writes one HTML file per route, and the axe scan visits the same list,
 * so adding a page is one entry here. Pure data with no JSX, so Playwright specs and the
 * build script can import it.
 *
 * A path is relative to the site root, with no leading slash and always a trailing slash
 * (`criteria/1.4.3/`; the home page is `''`). The site is served from a repository prefix on
 * GitHub Pages with no rewrites, so pages never link with absolute paths: use `rel`.
 */

import { POST_SLUGS } from '../blog/slugs';
import { EXPECTED } from '../criteria/manifest';

export type PageKind = 'about' | 'blog' | 'colour-check' | 'criteria' | 'criterion' | 'home' | 'not-found' | 'post';

export type Route = {
  readonly path: string;
  readonly page: PageKind;
  /** The criterion number, on criterion pages. */
  readonly num?: string;
  /** The post's slug, on post pages. */
  readonly slug?: string;
};

/** Site paths the shell links to. Some are written by later tickets (see the ledger). */
export const PATHS = {
  home: '',
  criteria: 'criteria/',
  colourCheck: 'colour-check/',
  about: 'about/',
  blog: 'blog/',
} as const;

export function criterionPath(num: string): string {
  return `criteria/${num}/`;
}

/** A post's page: `blog/<slug>/`. The slug is the post's file name and never changes. */
export function postPath(slug: string): string {
  return `${PATHS.blog}${slug}/`;
}

/** Every criterion in the manifest gets a page, in number order. */
const PUBLISHED_CRITERIA: readonly string[] = EXPECTED.map((c) => c.num);

/** Pages that are not criterion or post pages (home, colour check, all criteria, blog, about) go here. */
const FIXED_ROUTES: readonly Route[] = [
  { path: PATHS.home, page: 'home' },
  { path: PATHS.criteria, page: 'criteria' },
  { path: PATHS.colourCheck, page: 'colour-check' },
  { path: PATHS.blog, page: 'blog' },
  { path: PATHS.about, page: 'about' },
];

const CRITERION_ROUTES: readonly Route[] = PUBLISHED_CRITERIA.map((num) => ({
  path: criterionPath(num),
  page: 'criterion',
  num,
}));

/** One page per post file in src/blog/posts/ (src/blog/slugs.ts): no list to edit. */
const POST_ROUTES: readonly Route[] = POST_SLUGS.map((slug) => ({ path: postPath(slug), page: 'post', slug }));

export const ROUTES: readonly Route[] = [...FIXED_ROUTES, ...CRITERION_ROUTES, ...POST_ROUTES];

/**
 * The 404 page (S-05). Not a route: it is written once, to `dist/404.html`, and Cloudflare
 * serves it with status 404 for any path that matches no asset (`not_found_handling` in
 * wrangler.jsonc). So it is in neither the sitemap nor the per-route checks. Its `path` is
 * the file it is written to, and its `data-route`.
 */
export const NOT_FOUND: Route = { path: '404.html', page: 'not-found' };

/** The route a page was rendered for, from its `data-route`: one in ROUTES, or the 404 page. */
export function routeFor(path: string): Route | undefined {
  if (path === NOT_FOUND.path) return NOT_FOUND;
  return ROUTES.find((r) => r.path === path);
}

/**
 * The href for a link from a page to a site path. Pages link relatively (`rel`), except the
 * 404 page: it is served at whatever address was asked for, so it links from the root.
 */
export function linkFrom(from: Route, to: string): string {
  return from.page === 'not-found' ? `/${to}` : rel(from.path, to);
}

/**
 * The relative href from one site path to another, e.g. from `criteria/1.4.3/` to
 * `colour-check/` is `../../colour-check/`. A query string or fragment on `to` is kept.
 */
export function rel(from: string, to: string): string {
  const cut = to.search(/[?#]/);
  const target = cut === -1 ? to : to.slice(0, cut);
  const suffix = cut === -1 ? '' : to.slice(cut);

  const fromParts = from.split('/').filter(Boolean);
  const toParts = target.split('/').filter(Boolean);
  let shared = 0;
  while (
    shared < fromParts.length &&
    shared < toParts.length &&
    fromParts[shared] === toParts[shared]
  ) {
    shared++;
  }

  const up = '../'.repeat(fromParts.length - shared);
  const down = toParts.slice(shared).map((p) => `${p}/`).join('');
  return (up + down || './') + suffix;
}
