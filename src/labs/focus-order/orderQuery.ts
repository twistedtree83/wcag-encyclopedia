/**
 * The 2.4.3 page keeps its flagship lab's state in the URL, so a reader can share the order they
 * broke:
 *
 *   ?src=layout|columns|send-first    the source order of the form's parts
 *   ?ti=none|postcode|send            which part, if any, has tabindex="1"
 *
 * The starting state writes no query. Unknown values are ignored, as `ringQuery.ts` does: a bad
 * link still opens the page.
 */

import { LIFTS, ORDER_START, SOURCES, type Order } from './focusOrder';

/** The search string for a state, with its leading `?`, or '' for the starting state. */
export function searchFromOrder({ source, lift }: Order): string {
  if (source === ORDER_START.source && lift === ORDER_START.lift) return '';
  return `?src=${source}&ti=${lift}`;
}

/** The state a search string asks for, or `null` when it asks for nothing this lab knows. */
export function orderFromSearch(search: string): Order | null {
  const params = new URLSearchParams(search);
  const source = SOURCES.find((o) => o.value === params.get('src'))?.value ?? null;
  const lift = LIFTS.find((o) => o.value === params.get('ti'))?.value ?? null;
  if (source === null && lift === null) return null;
  return { source: source ?? ORDER_START.source, lift: lift ?? ORDER_START.lift };
}
