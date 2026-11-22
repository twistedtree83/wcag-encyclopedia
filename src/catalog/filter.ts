/**
 * The filter engine.
 *
 * A pure function of `(criteria, query)`. No DOM, no component state, no side effects — so the
 * rules can be tested directly and the component that renders the results has no logic in it
 * worth testing.
 */

import type { CriterionRecord, Level } from '../criteria/types';

/** Single-select, matching the design. `All` is the default. */
export type LevelFilter = 'All' | Extract<Level, 'A' | 'AA'>;

/** One of the four principles, by number, or `All`. */
export type PrincipleFilter = 'All' | 1 | 2 | 3 | 4;

export type Query = {
  readonly principle: PrincipleFilter;
  readonly level: LevelFilter;
  /**
   * A separate on/off input, not a level, so "AA and new in 2.2" is a query a reader can run.
   * On keeps only criteria whose `since` is '2.2'.
   */
  readonly newIn22: boolean;
  /** Free text, matched against number, name, restatement and fail caption. */
  readonly text: string;
};

export const EMPTY_QUERY: Query = { principle: 'All', level: 'All', newIn22: false, text: '' };

export function isFiltering(query: Query): boolean {
  return (
    query.principle !== 'All' ||
    query.level !== 'All' ||
    query.newIn22 ||
    query.text.trim() !== ''
  );
}

function matchesPrinciple(record: CriterionRecord, principle: PrincipleFilter): boolean {
  // The principle is the first segment of the criterion number: 1.4.3 sits under 1.
  return principle === 'All' || record.num.split('.')[0] === String(principle);
}

function matchesLevel(record: CriterionRecord, level: LevelFilter): boolean {
  return level === 'All' || record.level === level;
}

function matchesNewIn22(record: CriterionRecord, newIn22: boolean): boolean {
  return !newIn22 || record.since === '2.2';
}

function matchesText(record: CriterionRecord, text: string): boolean {
  const needle = text.trim().toLowerCase();
  if (needle === '') return true;
  // Number and name together (so "1.4.3 contrast" works), then the restatement and the fail
  // caption: whatever the reader remembers, including what goes wrong, finds the criterion.
  // Each field is searched on its own so a match never straddles two of them.
  const fields = [`${record.num} ${record.name}`, record.plain, record.fail.caption];
  return fields.some((field) => field.toLowerCase().includes(needle));
}

/** The criteria matching a query, in corpus order. All four inputs compose. */
export function filterCriteria(
  criteria: readonly CriterionRecord[],
  query: Query,
): readonly CriterionRecord[] {
  return criteria.filter(
    (record) =>
      matchesPrinciple(record, query.principle) &&
      matchesLevel(record, query.level) &&
      matchesNewIn22(record, query.newIn22) &&
      matchesText(record, query.text),
  );
}

export type Counts = { readonly shown: number; readonly total: number };

export function countMatches(criteria: readonly CriterionRecord[], query: Query): Counts {
  return { shown: filterCriteria(criteria, query).length, total: criteria.length };
}
