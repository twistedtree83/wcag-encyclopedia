/**
 * The filter engine.
 *
 * A pure function of `(criteria, query)`. No DOM, no component state, no side effects — so the
 * rules can be tested directly and the component that renders the results has no logic in it
 * worth testing.
 */

import type { CriterionRecord, Level } from '../criteria/types';

/** Single-select, matching the design. `All` is the default. */
export type LevelFilter = 'All' | Level;

export type Query = {
  readonly level: LevelFilter;
  /** Free text, matched against criterion number and name. */
  readonly text: string;
};

export const EMPTY_QUERY: Query = { level: 'All', text: '' };

export function isFiltering(query: Query): boolean {
  return query.level !== 'All' || query.text.trim() !== '';
}

function matchesLevel(record: CriterionRecord, level: LevelFilter): boolean {
  return level === 'All' || record.level === level;
}

function matchesText(record: CriterionRecord, text: string): boolean {
  const needle = text.trim().toLowerCase();
  if (needle === '') return true;
  // Number and name, so either half of what the reader remembers finds the card.
  return `${record.num} ${record.name}`.toLowerCase().includes(needle);
}

/** The criteria matching a query, in corpus order. Level and text compose. */
export function filterCriteria(
  criteria: readonly CriterionRecord[],
  query: Query,
): readonly CriterionRecord[] {
  return criteria.filter(
    (record) => matchesLevel(record, query.level) && matchesText(record, query.text),
  );
}

export type Counts = { readonly shown: number; readonly total: number };

export function countMatches(criteria: readonly CriterionRecord[], query: Query): Counts {
  return { shown: filterCriteria(criteria, query).length, total: criteria.length };
}

/** The line under the controls. Says nothing when nothing is filtered. */
export function summarise(counts: Counts, query: Query): string {
  if (!isFiltering(query)) return `${counts.total} criteria documented`;
  if (counts.shown === 0) return 'No criteria match';
  return `Showing ${counts.shown} of ${counts.total} criteria`;
}
