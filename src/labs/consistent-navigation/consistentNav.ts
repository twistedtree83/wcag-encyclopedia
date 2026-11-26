/**
 * 3.2.3 Consistent Navigation (#63): a four-page shop whose menu either keeps one order on every
 * page or shuffles from page to page, and the lab's model. Adding a page-only link is allowed, as
 * long as the shared links keep their relative order.
 */

import { menuOn, orderKept, titleOf, type Site } from '../../live/mockSite';
import type { Verdict } from '../shared/LabShell';

export type NavPage = 'home' | 'products' | 'support' | 'account';

const MENU: readonly NavPage[] = ['home', 'products', 'support', 'account'];

/** The shuffled menus: each page but Home has its own order. */
const SHUFFLED: Readonly<Record<string, readonly string[]>> = {
  products: ['support', 'home', 'account', 'products'],
  support: ['account', 'support', 'products', 'home'],
  account: ['products', 'account', 'home', 'support'],
};

const base = (on?: Readonly<Record<string, readonly string[]>>, contact = false): Site => ({
  host: 'shop.example',
  home: 'home',
  pages: [
    { id: 'home', title: 'Home', path: '', text: 'Welcome to the shop.' },
    { id: 'products', title: 'Products', path: 'products', text: 'Everything we sell.' },
    { id: 'support', title: 'Support', path: 'support', text: 'How can we help?' },
    { id: 'account', title: 'Account', path: 'account', text: 'Your orders and details.' },
    { id: 'contact', title: 'Contact us', path: 'support/contact', text: 'Write to us.' },
  ],
  menu: {
    items: MENU,
    on: contact ? { ...on, support: [...(on?.support ?? MENU), 'contact'] } : (on ?? {}),
  },
  search: null,
  siteMap: false,
});

/** The shop with its menu shuffled on every page but Home. */
export const SHUFFLED_SITE: Site = base(SHUFFLED);
/** The shop with one menu order everywhere. */
export const STEADY_SITE: Site = base();

export type NavOrder = 'same' | 'shuffled';

export const ORDERS: readonly { readonly value: NavOrder; readonly label: string }[] = [
  { value: 'same', label: 'Same order on every page' },
  { value: 'shuffled', label: 'Shuffled on each page' },
];

export const NAV_PAGES: readonly { readonly value: NavPage; readonly label: string }[] = MENU.map(
  (p) => ({ value: p, label: titleOf(STEADY_SITE, p) }),
);

export type NavLab = {
  readonly order: NavOrder;
  /** Support adds a page-only “Contact us” link at the end of its menu. */
  readonly contact: boolean;
  /** The page the mock shows. */
  readonly page: NavPage;
};

export const NAV_START: NavLab = { order: 'shuffled', contact: false, page: 'home' };

export const withOrder = (lab: NavLab, order: NavOrder): NavLab => ({ ...lab, order });
export const withContact = (lab: NavLab, contact: boolean): NavLab => ({ ...lab, contact });
export const showPage = (lab: NavLab, page: NavPage): NavLab => ({ ...lab, page });

/** The site the lab's settings describe. */
export function navSite(lab: NavLab): Site {
  return base(lab.order === 'shuffled' ? SHUFFLED : undefined, lab.contact);
}

/** A page's menu as it reads: "Home, Products, Support, Account". */
export function navLine(lab: NavLab, page: NavPage): string {
  const site = navSite(lab);
  return (menuOn(site, page) ?? []).map((id) => titleOf(site, id)).join(', ');
}

/** Every page's menu keeps Home's order (a page may add its own links). */
export function navVerdict(lab: NavLab): Verdict {
  const site = navSite(lab);
  const first = menuOn(site, 'home') ?? [];
  return {
    criterion: '3.2.3',
    passes: MENU.every((p) => orderKept(first, menuOn(site, p) ?? [])),
  };
}

export function navSaid(lab: NavLab): string {
  const order = navVerdict(lab).passes
    ? 'The menu keeps one order on every page.'
    : 'The menu changes order between pages.';
  return `${order} On ${titleOf(STEADY_SITE, lab.page)} it reads ${navLine(lab, lab.page)}.`;
}
