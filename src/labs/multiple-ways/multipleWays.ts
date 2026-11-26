/**
 * 2.4.5 Multiple Ways (#63): the shop's support site, buried page and all, and the lab's model.
 *
 * VAT invoices sits four levels down: Home › Support › Billing › Invoices › VAT invoices. The
 * menu and the links in each page's text are one way there (walking the tree). A search box and
 * a site map are two more. The reader adds and removes them; two ways or more passes. Steps in a
 * process are exempt from 2.4.5, but this is a set of pages, not a process.
 */

import type { Site } from '../../live/mockSite';
import { wayList } from '../../live/mockSite';
import type { Verdict } from '../shared/LabShell';

/** The support site, with the menu only. The live examples and the lab add to it. */
export const SUPPORT_SITE: Site = {
  host: 'shop.example',
  home: 'home',
  pages: [
    { id: 'home', title: 'Home', path: '', text: 'Welcome to the shop.' },
    { id: 'shop', title: 'Shop', path: 'shop', text: 'Everything we sell.' },
    {
      id: 'support',
      title: 'Support',
      path: 'support',
      text: 'How can we help?',
      links: ['billing', 'delivery'],
    },
    { id: 'delivery', title: 'Delivery', path: 'support/delivery', text: 'Two to three days.' },
    {
      id: 'billing',
      title: 'Billing',
      path: 'support/billing',
      text: 'Payments and invoices.',
      links: ['invoices'],
    },
    {
      id: 'invoices',
      title: 'Invoices',
      path: 'support/billing/invoices',
      text: 'Every invoice we send.',
      links: ['vat'],
    },
    {
      id: 'vat',
      title: 'VAT invoices',
      path: 'support/billing/invoices/vat',
      text: 'Download a VAT invoice for any order.',
    },
  ],
  menu: { items: ['home', 'shop', 'support'] },
  search: null,
  siteMap: false,
};

/** The same site with search (filled with “VAT”) and a site map: three ways in. */
export const SUPPORT_SITE_FOUND: Site = { ...SUPPORT_SITE, search: 'VAT', siteMap: true };

export type Way = 'menu' | 'search' | 'sitemap';

export const WAYS: readonly { readonly way: Way; readonly label: string; readonly name: string }[] = [
  { way: 'menu', label: 'The menu', name: 'the menu' },
  { way: 'search', label: 'Search', name: 'search' },
  { way: 'sitemap', label: 'A site map', name: 'the site map' },
];

const nameOf = (way: Way) => WAYS.find((w) => w.way === way)!.name;

/** The pages each way passes through on the way to VAT invoices. */
export const ROUTES: Readonly<Record<Way, readonly string[]>> = {
  menu: ['Home', 'Support', 'Billing', 'Invoices', 'VAT invoices'],
  search: ['Home', 'Search results', 'VAT invoices'],
  sitemap: ['Home', 'Site map', 'VAT invoices'],
};

export type WaysLab = {
  readonly ways: Readonly<Record<Way, boolean>>;
  /** The way the reader last tried, if any, and the route it took (null: the site lacks it). */
  readonly tried: Way | null;
  readonly route: readonly string[] | null;
};

/** A site with nothing but its menu: one way to the buried page. */
export const WAYS_START: WaysLab = {
  ways: { menu: true, search: false, sitemap: false },
  tried: null,
  route: null,
};

/** The lab after a way is added or removed: back on Home, nothing tried yet. */
export function withWay(lab: WaysLab, way: Way, on: boolean): WaysLab {
  return { ways: { ...lab.ways, [way]: on }, tried: null, route: null };
}

/** Try to reach VAT invoices one way, from Home. */
export function tryWay(lab: WaysLab, way: Way): WaysLab {
  return { ...lab, tried: way, route: lab.ways[way] ? ROUTES[way] : null };
}

const offered = (lab: WaysLab) => WAYS.filter((w) => lab.ways[w.way]).map((w) => w.name);

/** The support site the lab's settings describe. */
export function waysSite(lab: WaysLab): Site {
  return {
    ...SUPPORT_SITE,
    menu: lab.ways.menu ? SUPPORT_SITE.menu : null,
    search: lab.ways.search ? 'VAT' : null,
    siteMap: lab.ways.sitemap,
  };
}

export function waysVerdict(lab: WaysLab): Verdict {
  return { criterion: '2.4.5', passes: offered(lab).length >= 2 };
}

/** The live region's sentence: the route just tried, or which ways lead to the buried page. */
export function waysSaid(lab: WaysLab): string {
  if (lab.tried) {
    if (!lab.route) return `This site has no ${nameOf(lab.tried).replace(/^the /, '')}.`;
    const moves = lab.route.length - 1;
    const by = nameOf(lab.tried);
    return `By ${by}: ${lab.route.join(', ')}. ${moves} moves.`;
  }
  const ways = offered(lab);
  if (ways.length === 0) return 'Nothing leads to VAT invoices: it is lost.';
  if (ways.length === 1) return `Only ${ways[0]} leads to VAT invoices.`;
  return `${ways.length} ways lead to VAT invoices: ${wayList(ways)}.`;
}
