/**
 * The 2.2.1 page keeps its flagship lab's state in the URL, so a reader can share it:
 *
 *   ?limit=60|120|300                      the session's time limit, in seconds
 *   ?help=none|late|extend|adjust|off      what the site offers before it ends
 *
 * The starting state writes no query. Unknown values are ignored rather than rejected, as
 * `reflowQuery.ts` does. The clock is never in the URL: a shared link never starts it.
 */

import { HELPS, LIMITS, TIMEOUT_START, type Help, type Limit, type Timeout } from './timeout';

/** The search string for a state, with its leading `?`, or '' for the start. */
export function searchFromTimeout({ limit, help }: Timeout): string {
  if (limit === TIMEOUT_START.limit && help === TIMEOUT_START.help) return '';
  return `?limit=${limit}&help=${help}`;
}

/** The state a search string asks for, or `null` when it asks for nothing this lab knows. */
export function timeoutFromSearch(search: string): Timeout | null {
  const params = new URLSearchParams(search);
  const l = params.get('limit');
  const h = params.get('help');
  const limit: Limit | null = LIMITS.find((o) => String(o.value) === l)?.value ?? null;
  const help: Help | null = HELPS.find((o) => o.value === h)?.value ?? null;
  if (limit === null && help === null) return null;
  return { limit: limit ?? TIMEOUT_START.limit, help: help ?? TIMEOUT_START.help };
}
