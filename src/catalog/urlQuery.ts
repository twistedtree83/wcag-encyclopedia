/**
 * The All criteria page keeps its filters in the URL so a filtered view can be shared.
 *
 *   ?p=1 … ?p=4   a principle
 *   ?l=A, ?l=AA   a level
 *   ?new          new in 2.2 (any value, or none)
 *   ?q=…          the search text
 *
 * Anything unrecognised is ignored rather than rejected: a bad link still opens the page.
 */

import { EMPTY_QUERY, type Counts, type LevelFilter, type PrincipleFilter, type Query } from './filter';

const PRINCIPLES: Record<string, PrincipleFilter> = { '1': 1, '2': 2, '3': 3, '4': 4 };
const LEVELS: Record<string, LevelFilter> = { A: 'A', AA: 'AA' };

export function queryFromSearch(search: string): Query {
  const params = new URLSearchParams(search);
  return {
    principle: PRINCIPLES[params.get('p') ?? ''] ?? EMPTY_QUERY.principle,
    level: LEVELS[params.get('l') ?? ''] ?? EMPTY_QUERY.level,
    newIn22: params.has('new'),
    text: params.get('q') ?? '',
  };
}

/** The search string for a query, with its leading `?`, or `''` for the empty query. */
export function searchFromQuery(query: Query): string {
  const parts: string[] = [];
  if (query.principle !== 'All') parts.push(`p=${query.principle}`);
  if (query.level !== 'All') parts.push(`l=${query.level}`);
  if (query.newIn22) parts.push('new');
  if (query.text.trim() !== '') parts.push(`q=${encodeURIComponent(query.text)}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

/** The polite line under the filters: "Showing 6 of 55 criteria." */
export function resultsLine({ shown, total }: Counts): string {
  return `Showing ${shown} of ${total} criteria.`;
}
