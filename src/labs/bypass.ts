/**
 * The 2.4.1 lab's model (#46): a mock page with a logo, a menu of `links` links and a search
 * field before the article. The reader adds or removes a skip link and lengthens the menu, and
 * counts the Tab presses it takes to reach the article. With the skip link it is one Tab and
 * Enter, however long the menu; without it, every stop before the article, on every page.
 */

import type { Verdict } from './LabShell';

export type Bypass = { readonly skip: boolean; readonly links: number };

export const MIN_LINKS = 2;
export const MAX_LINKS = 30;

export const BYPASS_START: Bypass = { skip: true, links: 12 };

/** Stops before the article besides the menu: the logo and the search field. */
const OTHER_STOPS = 2;

/** Tab presses until focus is in the article. With a skip link, add one Enter. */
export function pressesToMain({ skip, links }: Bypass): number {
  return skip ? 1 : links + OTHER_STOPS + 1;
}

export function bypassVerdict({ skip }: Bypass): Verdict {
  return { criterion: '2.4.1', passes: skip };
}

/** The live region's sentence after a change. */
export function bypassSaid(b: Bypass): string {
  return b.skip
    ? `Skip link on: 1 Tab and Enter reach the article, past ${b.links} menu links.`
    : `No skip link: ${pressesToMain(b)} Tab presses to reach the article, on every page.`;
}
