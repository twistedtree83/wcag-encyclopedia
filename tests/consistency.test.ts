import { describe, it, expect } from 'vitest';
import type { StageEvent } from '../src/live/events';
import {
  helpOn,
  helpPlaceLines,
  searchNameLines,
  searchNameOn,
  type Site,
  type SiteSeen,
} from '../src/live/mockSite';
import {
  ID_START,
  idLine,
  idSaid,
  idSite,
  idVerdict,
  nameOn,
  showIdPage,
} from '../src/labs/consistentId';
import {
  HELP_START,
  helpLine,
  helpSaid,
  helpSite,
  helpVerdict,
  placeOn,
  showHelpPage,
} from '../src/labs/consistentHelp';

/**
 * 3.2.4 and 3.2.6 on the mock site (#64): a search button named per page, a help link placed per
 * page, the two instruments that judge them, and the two labs' models. Expected text is written
 * out by hand from the criteria, not derived from the code.
 */

const SITE: Site = {
  host: 'shop.example',
  home: 'home',
  pages: [
    { id: 'home', title: 'Home', path: '', text: 'Welcome.' },
    { id: 'products', title: 'Products', path: 'products', text: 'Things.' },
    { id: 'help', title: 'Help', path: 'help', text: 'Ask us.' },
  ],
  menu: { items: ['home', 'products'] },
  search: '',
  siteMap: false,
  searchName: { label: 'Search', on: { products: 'Find' } },
  help: { at: 'header', on: { products: 'footer', help: null } },
};

/** The same site with neither field set. */
const PLAIN: Site = { ...SITE };
delete (PLAIN as { searchName?: unknown }).searchName;
delete (PLAIN as { help?: unknown }).help;

describe('the mock site’s search name and help place', () => {
  it('names the search button per page, “Search” when the site says nothing', () => {
    expect(searchNameOn(SITE, 'home')).toBe('Search');
    expect(searchNameOn(SITE, 'products')).toBe('Find');
    expect(searchNameOn(PLAIN, 'products')).toBe('Search');
    expect(searchNameOn({ ...SITE, search: null }, 'home')).toBeNull();
  });

  it('places the help link per page, or leaves it off a page', () => {
    expect(helpOn(SITE, 'home')).toBe('header');
    expect(helpOn(SITE, 'products')).toBe('footer');
    expect(helpOn(SITE, 'help')).toBeNull();
    expect(helpOn(PLAIN, 'home')).toBeNull();
  });
});

const seen = (title: string, more: Partial<SiteSeen>): StageEvent => ({
  kind: 'site',
  simulated: false,
  page: { title, address: title, via: null, nav: [], ways: [], ...more },
});

describe('the search control instrument', () => {
  it('judges each page’s search button name against the first page’s', () => {
    expect(searchNameLines([])).toEqual([]);
    expect(
      searchNameLines([
        seen('Home', { searchName: 'Search' }),
        seen('Products', { searchName: 'Find', via: 'menu' }),
        seen('Support', { searchName: 'Search', via: 'menu' }),
        seen('Site map', { via: 'site map' }),
      ]),
    ).toEqual([
      { text: 'Home: the search button reads “Search”. The first page seen.', kept: true },
      { text: 'Products: the search button reads “Find”. Named “Search” on Home.', kept: false },
      { text: 'Support: the search button reads “Search”. Same name as on Home.', kept: true },
      { text: 'Site map: no search on this page.', kept: true },
    ]);
  });
});

describe('the help link instrument', () => {
  it('judges each page’s help link against the first page that had one', () => {
    expect(helpPlaceLines([])).toEqual([]);
    expect(
      helpPlaceLines([
        seen('Home', {}),
        seen('Products', { help: 'the header', via: 'menu' }),
        seen('Account', { help: 'the footer', via: 'menu' }),
        seen('Basket', { help: 'the header', via: 'menu' }),
      ]),
    ).toEqual([
      { text: 'Home: no help link. Help need not be on every page.', kept: true },
      { text: 'Products: help in the header. The first page with help.', kept: true },
      { text: 'Account: help in the footer. Moved from the header on Products.', kept: false },
      { text: 'Basket: help in the header. Same place as on Products.', kept: true },
    ]);
  });
});

describe('the 3.2.4 lab: name the search button', () => {
  it('starts with three names and fails', () => {
    expect(ID_START.page).toBe('home');
    expect(idVerdict(ID_START)).toEqual({ criterion: '3.2.4', passes: false });
    expect(idLine(ID_START)).toBe(
      'The search button reads “Search” on Home, “Find” on Products and “Go” on Support.',
    );
    expect(searchNameOn(idSite(ID_START), 'support')).toBe('Go');
  });

  it('passes once every page uses one name', () => {
    const one = nameOn(nameOn(ID_START, 'products', 'Search'), 'support', 'Search');
    expect(idVerdict(one)).toEqual({ criterion: '3.2.4', passes: true });
    expect(idSaid(showIdPage(one, 'support'))).toBe(
      'The search button has one name on every page: “Search”. On Support it reads “Search”.',
    );
    // Any one name will do, as long as it is the same everywhere.
    const go = nameOn(nameOn(ID_START, 'home', 'Go'), 'products', 'Go');
    expect(idVerdict(go).passes).toBe(true);
  });

  it('says how many names there are while they differ', () => {
    expect(idSaid(showIdPage(ID_START, 'products'))).toBe(
      'The search button has 3 names: “Search”, “Find” and “Go”. On Products it reads “Find”.',
    );
    expect(idSaid(nameOn(ID_START, 'support', 'Find'))).toBe(
      'The search button has 2 names: “Search” and “Find”. On Home it reads “Search”.',
    );
  });
});

describe('the 3.2.6 lab: place the help link', () => {
  it('starts with help in three places and fails', () => {
    expect(helpVerdict(HELP_START)).toEqual({ criterion: '3.2.6', passes: false });
    expect(helpLine(HELP_START)).toBe(
      'Help is in the header on Home, in the footer on Products and in the page on Account.',
    );
    expect(helpOn(helpSite(HELP_START), 'products')).toBe('footer');
  });

  it('passes when every page with help has it in one place, even if a page has none', () => {
    const header = placeOn(placeOn(HELP_START, 'products', 'header'), 'account', 'header');
    expect(helpVerdict(header).passes).toBe(true);
    const none = placeOn(header, 'account', 'none');
    expect(helpVerdict(none).passes).toBe(true);
    expect(helpLine(none)).toBe(
      'Help is in the header on Home and in the header on Products. Account has none.',
    );
    expect(helpOn(helpSite(none), 'account')).toBeNull();
    expect(helpSaid(showHelpPage(none, 'account'))).toBe(
      'Every page with help has it in the header. Account has no help link.',
    );
  });

  it('says where help moves to while it moves', () => {
    expect(helpSaid(showHelpPage(HELP_START, 'products'))).toBe(
      'Help moves between pages. On Products it is in the footer.',
    );
  });

  it('has nothing to check when no page offers help', () => {
    const none = (['home', 'products', 'account'] as const).reduce(
      (lab, p) => placeOn(lab, p, 'none'),
      HELP_START,
    );
    expect(helpVerdict(none).passes).toBe(true);
    expect(helpSaid(none)).toBe('No page offers help, so there is nothing to keep in place.');
  });
});
