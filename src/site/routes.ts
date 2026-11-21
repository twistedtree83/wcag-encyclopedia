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

import { EXPECTED } from '../criteria/manifest';

export type PageKind = 'criterion';

export type Route = {
  readonly path: string;
  readonly page: PageKind;
  /** The criterion number, on criterion pages. */
  readonly num?: string;
};

/** Site paths the shell links to. Some are written by later tickets (see the ledger). */
export const PATHS = {
  home: '',
  criteria: 'criteria/',
  colourCheck: 'colour-check/',
  about: 'about/',
} as const;

export function criterionPath(num: string): string {
  return `criteria/${num}/`;
}

/**
 * Criterion pages published so far. R-01 proves the pipeline on 1.4.3 alone; R-03 publishes
 * the rest by widening this to every number in the manifest.
 */
const PUBLISHED_CRITERIA: readonly string[] = EXPECTED.filter((c) => c.num === '1.4.3').map(
  (c) => c.num,
);

/** Pages that are not criterion pages (home, colour check, all criteria, about) go here. */
const FIXED_ROUTES: readonly Route[] = [];

const CRITERION_ROUTES: readonly Route[] = PUBLISHED_CRITERIA.map((num) => ({
  path: criterionPath(num),
  page: 'criterion',
  num,
}));

export const ROUTES: readonly Route[] = [...FIXED_ROUTES, ...CRITERION_ROUTES];

export function routeFor(path: string): Route | undefined {
  return ROUTES.find((r) => r.path === path);
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
