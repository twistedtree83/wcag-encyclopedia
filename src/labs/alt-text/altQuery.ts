/**
 * The 1.1.1 page keeps its flagship lab's state in the URL, so a reader can share what they wrote:
 *
 *   ?img=photo|divider   which image the alt is for
 *   ?alt=<text>          the alt attribute's value; absent means no alt attribute, `alt=` is empty
 *
 * The starting state writes no query. Anything unknown is ignored, and an alt longer than
 * `ALT_MAX` is cut, as `nrvQuery.ts` does: a bad link still opens the page.
 */

import { ALT_MAX, ALT_START, PURPOSES, type AltModel } from './altText';

/** The search string for a state, with its leading `?`, or '' for the starting state. */
export function searchFromAlt({ purpose, alt }: AltModel): string {
  if (purpose === ALT_START.purpose && alt === ALT_START.alt) return '';
  const params = new URLSearchParams({ img: purpose });
  if (alt !== null) params.set('alt', alt);
  return `?${params.toString()}`;
}

/** The state a search string asks for, or `null` when it asks for nothing this lab knows. */
export function altFromSearch(search: string): AltModel | null {
  const params = new URLSearchParams(search);
  const purpose = PURPOSES.find((p) => p.value === params.get('img'))?.value ?? null;
  const alt = params.get('alt');
  if (purpose === null && alt === null) return null;
  return { purpose: purpose ?? ALT_START.purpose, alt: alt === null ? null : alt.slice(0, ALT_MAX) };
}
