import { describe, it, expect } from 'vitest';
import type { StageEvent } from '../src/live/events';
import {
  menuOn,
  menuOrderLines,
  orderKept,
  pageOf,
  siteLines,
  siteSaid,
  wayList,
  type Site,
  type SiteSeen,
} from '../src/live/mockSite';
import {
  WAYS_START,
  tryWay,
  waysSaid,
  waysVerdict,
  withWay,
} from '../src/labs/multipleWays';
import {
  NAV_START,
  navLine,
  navSaid,
  navVerdict,
  showPage,
  withContact,
  withOrder,
} from '../src/labs/consistentNav';

/**
 * The mock site (#63): its pure model, the two instruments' lines, and the 2.4.5 and 3.2.3 labs.
 * Expected text is written out by hand from the criteria, not derived from the code.
 */

const SITE: Site = {
  host: 'shop.example',
  home: 'home',
  pages: [
    { id: 'home', title: 'Home', path: '', text: 'Welcome.' },
    { id: 'support', title: 'Support', path: 'support', text: 'Help.', links: ['billing'] },
    { id: 'billing', title: 'Billing', path: 'support/billing', text: 'Bills.', links: ['vat'] },
    { id: 'vat', title: 'VAT invoices', path: 'support/billing/vat', text: 'VAT.' },
  ],
  menu: { items: ['home', 'support'], on: { support: ['support', 'home'] } },
  search: 'VAT',
  siteMap: true,
};

describe('the mock site model', () => {
  it('gives each page its menu, shuffled where the site says so', () => {
    expect(menuOn(SITE, 'home')).toEqual(['home', 'support']);
    expect(menuOn(SITE, 'support')).toEqual(['support', 'home']);
    expect(menuOn({ ...SITE, menu: null }, 'home')).toBeNull();
  });

  it('draws a page with its address and in-page links', () => {
    expect(pageOf(SITE, { id: 'support', query: '' })).toEqual({
      id: 'support',
      title: 'Support',
      address: 'shop.example/support',
      text: 'Help.',
      links: [{ label: 'Billing', to: 'billing', via: 'link' }],
    });
    expect(pageOf(SITE, { id: 'home', query: '' }).address).toBe('shop.example');
  });

  it('searches page titles, whatever the case', () => {
    const results = pageOf(SITE, { id: 'search', query: 'vat' });
    expect(results.title).toBe('Search results for “vat”');
    expect(results.address).toBe('shop.example/search?q=vat');
    expect(results.links).toEqual([{ label: 'VAT invoices', to: 'vat', via: 'search' }]);
    expect(pageOf(SITE, { id: 'search', query: 'parcel' }).text).toBe('No pages match.');
  });

  it('lists every page on the site map', () => {
    const map = pageOf(SITE, { id: 'site-map', query: '' });
    expect(map.title).toBe('Site map');
    expect(map.address).toBe('shop.example/site-map');
    expect(map.links.map((l) => `${l.label} ${l.via}`)).toEqual([
      'Home site map',
      'Support site map',
      'Billing site map',
      'VAT invoices site map',
    ]);
  });

  it('keeps an order when the shared items stay in sequence, additions allowed', () => {
    expect(orderKept(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    expect(orderKept(['a', 'b', 'c'], ['a', 'x', 'b', 'c'])).toBe(true);
    expect(orderKept(['a', 'b', 'c'], ['a', 'c'])).toBe(true);
    expect(orderKept(['a', 'b', 'c'], ['b', 'a', 'c'])).toBe(false);
  });

  it('names the ways round a site in a sentence', () => {
    expect(wayList(['the menu'])).toBe('the menu');
    expect(wayList(['the menu', 'search'])).toBe('the menu and search');
    expect(wayList(['the menu', 'search', 'the site map'])).toBe('the menu, search and the site map');
    expect(wayList([])).toBe('nothing');
  });
});

const seen = (title: string, nav: string[], via: SiteSeen['via'] = null): StageEvent => ({
  kind: 'site',
  simulated: true,
  page: { title, address: `shop.example/${title.toLowerCase()}`, via, nav, ways: ['the menu'] },
});

describe('the mock site instruments', () => {
  it('says where the visit is, how far it came, and the trail', () => {
    expect(siteLines([])).toBeNull();
    const events = [
      seen('Home', ['Home', 'Support']),
      seen('Support', ['Home', 'Support'], 'menu'),
      seen('VAT', ['Home', 'Support'], 'search'),
    ];
    expect(siteLines(events.slice(0, 1))).toEqual({
      now: 'On Home, where the visit starts.',
      ways: 'Ways to find a page: the menu.',
      trail: ['Home'],
    });
    expect(siteLines(events)).toEqual({
      now: 'On VAT, 2 moves from the start.',
      ways: 'Ways to find a page: the menu.',
      trail: ['Home', 'Support, by the menu', 'VAT, by search'],
    });
  });

  it('judges each page’s menu against the first page’s', () => {
    expect(
      menuOrderLines([
        seen('Home', ['Home', 'Products', 'Support']),
        seen('Products', ['Support', 'Home', 'Products'], 'menu'),
        seen('Support', ['Home', 'Products', 'Support', 'Contact'], 'menu'),
      ]),
    ).toEqual([
      { text: 'Home: Home, Products, Support. The first page seen.', kept: true },
      { text: 'Products: Support, Home, Products. Order changed from Home.', kept: false },
      { text: 'Support: Home, Products, Support, Contact. Same order as Home.', kept: true },
    ]);
  });

  it('says a move between pages, not where the visit started', () => {
    expect(siteSaid({ kind: 'site', simulated: false, page: { title: 'Home', address: 'x', via: null, nav: [], ways: [] } })).toBe('');
    expect(
      siteSaid({
        kind: 'site',
        simulated: true,
        page: { title: 'Billing', address: 'shop.example/support/billing', via: 'link', nav: ['Home', 'Support'], ways: [] },
      }),
    ).toBe('The example’s site is now on Billing, reached by a link on the page. Menu: Home, Support.');
  });
});

describe('the 2.4.5 lab: find the buried page', () => {
  it('starts with the menu alone, which fails', () => {
    expect(waysVerdict(WAYS_START)).toEqual({ criterion: '2.4.5', passes: false });
    expect(waysSaid(WAYS_START)).toBe('Only the menu leads to VAT invoices.');
  });

  it('passes with any two ways', () => {
    const two = withWay(WAYS_START, 'search', true);
    expect(waysVerdict(two).passes).toBe(true);
    expect(waysSaid(two)).toBe('2 ways lead to VAT invoices: the menu and search.');
    const mapOnly = withWay(withWay(WAYS_START, 'menu', false), 'sitemap', true);
    expect(waysVerdict(mapOnly).passes).toBe(false);
    const none = withWay(WAYS_START, 'menu', false);
    expect(waysSaid(none)).toBe('Nothing leads to VAT invoices: it is lost.');
  });

  it('walks the route each way takes, or says the site lacks it', () => {
    const menu = tryWay(WAYS_START, 'menu');
    expect(menu.route).toEqual(['Home', 'Support', 'Billing', 'Invoices', 'VAT invoices']);
    expect(waysSaid(menu)).toBe(
      'By the menu: Home, Support, Billing, Invoices, VAT invoices. 4 moves.',
    );
    const search = tryWay(withWay(WAYS_START, 'search', true), 'search');
    expect(search.route).toEqual(['Home', 'Search results', 'VAT invoices']);
    const missing = tryWay(WAYS_START, 'sitemap');
    expect(missing.route).toBeNull();
    expect(waysSaid(missing)).toBe('This site has no site map.');
  });
});

describe('the 3.2.3 lab: keep the menu in order', () => {
  it('starts shuffled, which fails', () => {
    expect(navVerdict(NAV_START)).toEqual({ criterion: '3.2.3', passes: false });
    expect(navLine(NAV_START, 'home')).toBe('Home, Products, Support, Account');
    expect(navLine(NAV_START, 'support')).toBe('Account, Support, Products, Home');
  });

  it('passes in one order, with or without a page-only link', () => {
    const same = withOrder(NAV_START, 'same');
    expect(navVerdict(same).passes).toBe(true);
    expect(navSaid(same)).toBe(
      'The menu keeps one order on every page. On Home it reads Home, Products, Support, Account.',
    );
    const contact = withContact(showPage(same, 'support'), true);
    expect(navLine(contact, 'support')).toBe('Home, Products, Support, Account, Contact us');
    expect(navVerdict(contact).passes).toBe(true);
  });

  it('says how the shown page’s menu differs', () => {
    expect(navSaid(showPage(NAV_START, 'products'))).toBe(
      'The menu changes order between pages. On Products it reads Support, Home, Account, Products.',
    );
  });
});
