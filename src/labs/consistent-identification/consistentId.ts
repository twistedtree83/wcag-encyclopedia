/**
 * 3.2.4 Consistent Identification (#64): a three-page shop whose search button is named per page,
 * "Search", "Find" or "Go", and the lab's model. One function, one name: any of the three passes,
 * as long as every page uses it.
 */

import { titleOf, wayList, type Site } from '../../live/mockSite';
import type { Verdict } from '../shared/LabShell';

export type IdPage = 'home' | 'products' | 'support';
export type SearchName = 'Search' | 'Find' | 'Go';

const PAGES: readonly IdPage[] = ['home', 'products', 'support'];

const SITE: Site = {
  host: 'shop.example',
  home: 'home',
  pages: [
    { id: 'home', title: 'Home', path: '', text: 'Welcome to the shop.' },
    { id: 'products', title: 'Products', path: 'products', text: 'Everything we sell.' },
    { id: 'support', title: 'Support', path: 'support', text: 'How can we help?' },
    { id: 'returns', title: 'Returns', path: 'support/returns', text: 'Send it back within 30 days.' },
  ],
  menu: { items: PAGES },
  // Filled to start, so a reader with only the input bar can still search.
  search: 'returns',
  siteMap: false,
};

export type IdLab = {
  /** The search button's name on each page. */
  readonly names: Readonly<Record<IdPage, SearchName>>;
  /** The page the mock shows. */
  readonly page: IdPage;
};

export const ID_START: IdLab = {
  names: { home: 'Search', products: 'Find', support: 'Go' },
  page: 'home',
};

export const NAMES: readonly { readonly value: SearchName; readonly label: string }[] = [
  { value: 'Search', label: 'Search' },
  { value: 'Find', label: 'Find' },
  { value: 'Go', label: 'Go' },
];

export const ID_PAGES: readonly { readonly value: IdPage; readonly label: string }[] = PAGES.map(
  (p) => ({ value: p, label: titleOf(SITE, p) }),
);

export const showIdPage = (lab: IdLab, page: IdPage): IdLab => ({ ...lab, page });
export const nameOn = (lab: IdLab, page: IdPage, name: SearchName): IdLab => ({
  ...lab,
  names: { ...lab.names, [page]: name },
});

/** The site the lab's names describe. Search results take Home's name. */
export function idSite(lab: IdLab): Site {
  return { ...SITE, searchName: { label: lab.names.home, on: { ...lab.names } } };
}

/** The shop with its search button named differently on each page. */
export const FICKLE_SEARCH_SITE: Site = idSite(ID_START);
/** The shop with its search button called “Search” everywhere. */
export const STEADY_SEARCH_SITE: Site = idSite({
  ...ID_START,
  names: { home: 'Search', products: 'Search', support: 'Search' },
});

const quoted = (names: readonly string[]) => names.map((n) => `“${n}”`);
const distinct = (lab: IdLab) => [...new Set(PAGES.map((p) => lab.names[p]))];

/** "The search button reads “Search” on Home, “Find” on Products and “Go” on Support." */
export function idLine(lab: IdLab): string {
  const each = PAGES.map((p) => `“${lab.names[p]}” on ${titleOf(SITE, p)}`);
  return `The search button reads ${wayList(each)}.`;
}

/** The search button has one name on every page. */
export function idVerdict(lab: IdLab): Verdict {
  return { criterion: '3.2.4', passes: distinct(lab).length === 1 };
}

export function idSaid(lab: IdLab): string {
  const names = distinct(lab);
  const how =
    names.length === 1
      ? `The search button has one name on every page: “${names[0]}”.`
      : `The search button has ${names.length} names: ${wayList(quoted(names))}.`;
  return `${how} On ${titleOf(SITE, lab.page)} it reads “${lab.names[lab.page]}”.`;
}
