/**
 * The mock site (#63, CONTEXT.md "Instrument"): a miniature site of a few pages, drawn inside a
 * live example or a lab, that the reader moves between. It never navigates the real page: its
 * links are caught and the next page is drawn in place, with its own address bar.
 *
 *   Site        the data: pages, the menu (and any page whose menu is in another order), whether
 *               there is a search box (and what it starts filled with) and a site map.
 *   pageOf      the page to draw for a place on the site, including the synthesised search
 *               results and site map pages.
 *   SiteSeen    what a stage reads off the drawn site (`[data-site]`, see `SiteWindow.tsx`) after
 *               any change: so instruments see what is shown, whatever moved it.
 *
 * Everything here is pure; the drawing and the DOM reading are in `SiteWindow.tsx`.
 */

import type { StageEvent } from './events';

/** How the reader got to a page: the menu, search, the site map or a link in a page's text. */
export type Via = 'menu' | 'search' | 'site map' | 'link' | 'help';

export type SitePageData = {
  readonly id: string;
  readonly title: string;
  /** The address after the host, '' for the home page. */
  readonly path: string;
  readonly text: string;
  /** Pages linked from this page's text, by id. */
  readonly links?: readonly string[];
};

export type Site = {
  readonly host: string;
  /** The page a visit starts on. */
  readonly home: string;
  readonly pages: readonly SitePageData[];
  /** The menu's pages in order, and the pages whose menu is in another order; null for none. */
  readonly menu: {
    readonly items: readonly string[];
    readonly on?: Readonly<Record<string, readonly string[]>>;
  } | null;
  /** A search box, filled with this to start; null for no search. */
  readonly search: string | null;
  /** A site map link in the footer. */
  readonly siteMap: boolean;
  /** The search button's name, and the pages that name it otherwise (#64); “Search” if absent. */
  readonly searchName?: { readonly label: string; readonly on?: Readonly<Record<string, string>> };
  /** Where the help link sits, and the pages that place it otherwise or (null) leave it off (#64). */
  readonly help?: { readonly at: HelpPlace; readonly on?: Readonly<Record<string, HelpPlace | null>> };
};

/** Where on a page the help link is drawn: after the menu, at the end of the page, or the footer. */
export type HelpPlace = 'header' | 'page' | 'footer';

/** How a help place reads: "the header". Also the drawn `data-site-help` value. */
export const HELP_PLACE: Readonly<Record<HelpPlace, string>> = {
  header: 'the header',
  page: 'the page',
  footer: 'the footer',
};

/** The page the help link goes to. */
export const HELP_PAGE = 'help';

/** Where the visit is: a page id ('search' and 'site-map' are synthesised) and the search. */
export type SitePlace = { readonly id: string; readonly query: string };

export type SiteLink = { readonly label: string; readonly to: string; readonly via: Via };

export type ShownPage = {
  readonly id: string;
  readonly title: string;
  readonly address: string;
  readonly text: string;
  readonly links: readonly SiteLink[];
};

export const SEARCH_PAGE = 'search';
export const SITE_MAP_PAGE = 'site-map';

const pageById = (site: Site, id: string) => site.pages.find((p) => p.id === id);

/** The title a page id is shown under. */
export function titleOf(site: Site, id: string): string {
  if (id === SITE_MAP_PAGE) return 'Site map';
  return pageById(site, id)?.title ?? id;
}

/** The menu on a page, as page ids in order, or null when the site has no menu. */
export function menuOn(site: Site, id: string): readonly string[] | null {
  if (!site.menu) return null;
  return site.menu.on?.[id] ?? site.menu.items;
}

/** The search button's name on a page, or null when the site has no search. */
export function searchNameOn(site: Site, id: string): string | null {
  if (site.search === null) return null;
  return site.searchName?.on?.[id] ?? site.searchName?.label ?? 'Search';
}

/** Where the help link is on a page, or null when that page (or the site) has none. */
export function helpOn(site: Site, id: string): HelpPlace | null {
  if (!site.help) return null;
  const on = site.help.on?.[id];
  return on === undefined ? site.help.at : on;
}

const addressOf = (site: Site, path: string) => (path ? `${site.host}/${path}` : site.host);

/** Pages whose title has every word of the query, whatever the case. */
function searchSite(site: Site, query: string): readonly SitePageData[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return site.pages.filter((p) => words.every((w) => p.title.toLowerCase().includes(w)));
}

/** The page to draw for a place on the site. An unknown id draws the home page. */
export function pageOf(site: Site, { id, query }: SitePlace): ShownPage {
  if (id === SEARCH_PAGE) {
    const found = searchSite(site, query);
    return {
      id,
      title: `Search results for “${query}”`,
      address: addressOf(site, `search?q=${encodeURIComponent(query)}`),
      text: found.length > 0 ? `${found.length} found.` : 'No pages match.',
      links: found.map((p) => ({ label: p.title, to: p.id, via: 'search' })),
    };
  }
  if (id === SITE_MAP_PAGE) {
    return {
      id,
      title: 'Site map',
      address: addressOf(site, 'site-map'),
      text: 'Every page on this site.',
      links: site.pages.map((p) => ({ label: p.title, to: p.id, via: 'site map' })),
    };
  }
  const page = pageById(site, id) ?? pageById(site, site.home)!;
  return {
    id: page.id,
    title: page.title,
    address: addressOf(site, page.path),
    text: page.text,
    links: (page.links ?? []).map((to) => ({ label: titleOf(site, to), to, via: 'link' })),
  };
}

/**
 * Whether `b` keeps `a`'s order: the items both share come in the same sequence. Items only one
 * of them has (a page-only link, a missing one) don't count, as 3.2.3 allows.
 */
export function orderKept(a: readonly string[], b: readonly string[]): boolean {
  const shared = (xs: readonly string[], ys: readonly string[]) => xs.filter((x) => ys.includes(x));
  const x = shared(a, b);
  const y = shared(b, a);
  return x.length === y.length && x.every((item, i) => item === y[i]);
}

/** "the menu", "the menu and search", "the menu, search and the site map", or "nothing". */
export function wayList(ways: readonly string[]): string {
  if (ways.length === 0) return 'nothing';
  if (ways.length === 1) return ways[0]!;
  return `${ways.slice(0, -1).join(', ')} and ${ways[ways.length - 1]}`;
}

/** What a stage reads off the drawn site: the page, how it was reached, its menu and ways. */
export type SiteSeen = {
  readonly title: string;
  readonly address: string;
  /** How the reader got here, or null where the visit started. */
  readonly via: Via | null;
  /** The menu's labels, in order, as drawn. */
  readonly nav: readonly string[];
  /** The ways round the site the page offers ("the menu", "search", "the site map"). */
  readonly ways: readonly string[];
  /** The search button's name as drawn (#64); absent when the page has no search. */
  readonly searchName?: string;
  /** Where the help link is drawn ("the header"), absent when the page has none (#64). */
  readonly help?: string;
};

const VIA: Readonly<Record<Via, string>> = {
  menu: 'by the menu',
  search: 'by search',
  'site map': 'by the site map',
  link: 'by a link on the page',
  help: 'by the help link',
};

type SiteEvent = Extract<StageEvent, { kind: 'site' }>;
const sitesOf = (events: readonly StageEvent[]) =>
  events.filter((e): e is SiteEvent => e.kind === 'site');

/** How many trail lines the mock site instrument shows. */
export const TRAIL_LINES = 5;

/** The mock site instrument (#63): where the visit is, the ways round, and the pages it passed. */
export function siteLines(
  events: readonly StageEvent[],
): { now: string; ways: string; trail: string[] } | null {
  const sites = sitesOf(events);
  // The visit starts again wherever the stage last read a page reached by nothing.
  const from = sites.map((e) => e.page.via).lastIndexOf(null);
  const visit = sites.slice(Math.max(from, 0));
  const last = visit[visit.length - 1];
  if (!last) return null;
  const moves = visit.length - 1;
  return {
    now:
      moves === 0
        ? `On ${last.page.title}, where the visit starts.`
        : `On ${last.page.title}, ${moves} ${moves === 1 ? 'move' : 'moves'} from the start.`,
    ways: `Ways to find a page: ${wayList(last.page.ways)}.`,
    trail: visit
      .map((e) => (e.page.via ? `${e.page.title}, ${VIA[e.page.via]}` : e.page.title))
      .slice(-TRAIL_LINES),
  };
}

/** The menu order instrument (#63): each page visited, its menu, and whether it kept the first's. */
export function menuOrderLines(
  events: readonly StageEvent[],
  max = TRAIL_LINES,
): { text: string; kept: boolean }[] {
  const sites = sitesOf(events);
  const first = sites[0];
  if (!first) return [];
  return sites
    .map((e, i) => {
      const menu = `${e.page.title}: ${e.page.nav.join(', ')}.`;
      if (i === 0) return { text: `${menu} The first page seen.`, kept: true };
      const kept = orderKept(first.page.nav, e.page.nav);
      const judged = kept ? `Same order as ${first.page.title}.` : `Order changed from ${first.page.title}.`;
      return { text: `${menu} ${judged}`, kept };
    })
    .slice(-max);
}

type Judged = { text: string; kept: boolean };

/**
 * The search control instrument (#64): each page visited, its search button's name, and whether
 * it is the name the first page with search gave it (3.2.4).
 */
export function searchNameLines(events: readonly StageEvent[], max = TRAIL_LINES): Judged[] {
  const sites = sitesOf(events);
  const first = sites.find((e) => e.page.searchName !== undefined);
  return sites
    .map((e) => {
      const { title, searchName } = e.page;
      if (searchName === undefined) return { text: `${title}: no search on this page.`, kept: true };
      const reads = `${title}: the search button reads “${searchName}”.`;
      if (e === first) return { text: `${reads} The first page seen.`, kept: true };
      const kept = searchName === first!.page.searchName;
      const judged = kept
        ? `Same name as on ${first!.page.title}.`
        : `Named “${first!.page.searchName}” on ${first!.page.title}.`;
      return { text: `${reads} ${judged}`, kept };
    })
    .slice(-max);
}

/**
 * The help link instrument (#64): each page visited, where its help link is, and whether that is
 * where the first page with help had it (3.2.6). A page with no help is fine.
 */
export function helpPlaceLines(events: readonly StageEvent[], max = TRAIL_LINES): Judged[] {
  const sites = sitesOf(events);
  const first = sites.find((e) => e.page.help !== undefined);
  return sites
    .map((e) => {
      const { title, help } = e.page;
      if (help === undefined) {
        return { text: `${title}: no help link. Help need not be on every page.`, kept: true };
      }
      const where = `${title}: help in ${help}.`;
      if (e === first) return { text: `${where} The first page with help.`, kept: true };
      const kept = help === first!.page.help;
      const judged = kept
        ? `Same place as on ${first!.page.title}.`
        : `Moved from ${first!.page.help} on ${first!.page.title}.`;
      return { text: `${where} ${judged}`, kept };
    })
    .slice(-max);
}

/** What is said when the site moves to another page: a drawn page reaches no screen reader. */
export function siteSaid({ page }: SiteEvent): string {
  if (!page.via) return '';
  const menu = page.nav.length > 0 ? ` Menu: ${page.nav.join(', ')}.` : '';
  return `The example’s site is now on ${page.title}, reached ${VIA[page.via]}.${menu}`;
}
