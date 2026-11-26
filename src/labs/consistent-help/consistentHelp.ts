/**
 * 3.2.6 Consistent Help (#64): a three-page shop whose help link sits in the header, in the page
 * or in the footer, page by page, and the lab's model. Help need not be on every page; where it
 * is, it has to be in the same place.
 */

import { HELP_PAGE, HELP_PLACE, titleOf, wayList, type HelpPlace, type Site } from '../../live/mockSite';
import type { Verdict } from '../shared/LabShell';

export type HelpLabPage = 'home' | 'products' | 'account';
export type HelpChoice = HelpPlace | 'none';

const PAGES: readonly HelpLabPage[] = ['home', 'products', 'account'];

const SITE: Site = {
  host: 'shop.example',
  home: 'home',
  pages: [
    { id: 'home', title: 'Home', path: '', text: 'Welcome to the shop.' },
    {
      id: 'products',
      title: 'Products',
      path: 'products',
      text: 'Everything we sell.',
      links: ['kettles', 'teapots'],
    },
    { id: 'kettles', title: 'Kettles', path: 'products/kettles', text: 'Five kettles.' },
    { id: 'teapots', title: 'Teapots', path: 'products/teapots', text: 'Three teapots.' },
    { id: 'account', title: 'Account', path: 'account', text: 'Your orders and details.' },
    { id: HELP_PAGE, title: 'Help', path: 'help', text: 'Call us, or write to us.' },
  ],
  menu: { items: PAGES },
  search: null,
  siteMap: false,
};

export type HelpLab = {
  /** Where each page has its help link, or 'none'. */
  readonly places: Readonly<Record<HelpLabPage, HelpChoice>>;
  /** The page the mock shows. */
  readonly page: HelpLabPage;
};

export const HELP_START: HelpLab = {
  places: { home: 'header', products: 'footer', account: 'page' },
  page: 'home',
};

export const PLACES: readonly { readonly value: HelpChoice; readonly label: string }[] = [
  { value: 'header', label: 'In the header' },
  { value: 'page', label: 'In the page' },
  { value: 'footer', label: 'In the footer' },
  { value: 'none', label: 'Not on this page' },
];

export const HELP_PAGES: readonly { readonly value: HelpLabPage; readonly label: string }[] =
  PAGES.map((p) => ({ value: p, label: titleOf(SITE, p) }));

export const showHelpPage = (lab: HelpLab, page: HelpLabPage): HelpLab => ({ ...lab, page });
export const placeOn = (lab: HelpLab, page: HelpLabPage, place: HelpChoice): HelpLab => ({
  ...lab,
  places: { ...lab.places, [page]: place },
});

const placeOf = (c: HelpChoice): HelpPlace | null => (c === 'none' ? null : c);

/** The site the lab's places describe. The help page keeps Home's place, or the header. */
export function helpSite(lab: HelpLab): Site {
  const on: Record<string, HelpPlace | null> = {};
  for (const p of PAGES) on[p] = placeOf(lab.places[p]);
  return { ...SITE, help: { at: placeOf(lab.places.home) ?? 'header', on } };
}

/** The shop with its help link in a different place on each page. */
export const ROAMING_HELP_SITE: Site = helpSite(HELP_START);
/** The shop with its help link in the header on every page. */
export const STEADY_HELP_SITE: Site = helpSite({
  ...HELP_START,
  places: { home: 'header', products: 'header', account: 'header' },
});

const withHelp = (lab: HelpLab) => PAGES.filter((p) => lab.places[p] !== 'none');
const placesUsed = (lab: HelpLab) => [...new Set(withHelp(lab).map((p) => lab.places[p]))];

/** "Help is in the header on Home, in the footer on Products and in the page on Account." */
export function helpLine(lab: HelpLab): string {
  const has = withHelp(lab);
  const none = PAGES.filter((p) => lab.places[p] === 'none').map((p) => titleOf(SITE, p));
  const each = has.map((p) => `in ${HELP_PLACE[lab.places[p] as HelpPlace]} on ${titleOf(SITE, p)}`);
  const lacking = none.length > 0 ? `${wayList(none)} ${none.length === 1 ? 'has' : 'have'} none.` : '';
  if (has.length === 0) return 'No page has a help link.';
  return [`Help is ${wayList(each)}.`, lacking].filter(Boolean).join(' ');
}

/** Every page that offers help has it in the same place. */
export function helpVerdict(lab: HelpLab): Verdict {
  return { criterion: '3.2.6', passes: placesUsed(lab).length <= 1 };
}

export function helpSaid(lab: HelpLab): string {
  const used = placesUsed(lab);
  if (used.length === 0) return 'No page offers help, so there is nothing to keep in place.';
  const how =
    used.length === 1
      ? `Every page with help has it in ${HELP_PLACE[used[0] as HelpPlace]}.`
      : 'Help moves between pages.';
  const here = lab.places[lab.page];
  const title = titleOf(SITE, lab.page);
  const where =
    here === 'none' ? `${title} has no help link.` : `On ${title} it is in ${HELP_PLACE[here]}.`;
  return `${how} ${where}`;
}
