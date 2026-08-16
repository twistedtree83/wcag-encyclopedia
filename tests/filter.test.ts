import { describe, it, expect } from 'vitest';
import {
  filterCriteria,
  countMatches,
  summarise,
  isFiltering,
  EMPTY_QUERY,
  type Query,
} from '../src/catalog/filter';
import type { CriterionRecord } from '../src/criteria/types';

/**
 * The filter engine is a pure function, so it is tested directly — no DOM, no rendering, no
 * mocking. Everything a reader can do to the result set is expressible as a Query.
 */

const record = (num: string, name: string, level: 'A' | 'AA'): CriterionRecord => ({
  num,
  name,
  level,
  guideline: num.split('.').slice(0, 2).join('.'),
  plain: 'x',
  fail: { render: () => null, caption: 'c' },
  pass: { render: () => null, caption: 'c' },
});

const CRITERIA = [
  record('1.4.1', 'Use of Color', 'A'),
  record('1.4.3', 'Contrast (Minimum)', 'AA'),
  record('1.4.11', 'Non-text Contrast', 'AA'),
  record('2.1.1', 'Keyboard', 'A'),
];

const q = (over: Partial<Query> = {}): Query => ({ ...EMPTY_QUERY, ...over });

describe('level filter', () => {
  it('returns everything when set to All', () => {
    expect(filterCriteria(CRITERIA, q())).toHaveLength(4);
  });

  it('returns only criteria of the chosen level', () => {
    expect(filterCriteria(CRITERIA, q({ level: 'A' })).map((c) => c.num)).toEqual([
      '1.4.1',
      '2.1.1',
    ]);
    expect(filterCriteria(CRITERIA, q({ level: 'AA' })).map((c) => c.num)).toEqual([
      '1.4.3',
      '1.4.11',
    ]);
  });
});

describe('text search', () => {
  it('returns everything for an empty or whitespace query', () => {
    expect(filterCriteria(CRITERIA, q({ text: '' }))).toHaveLength(4);
    expect(filterCriteria(CRITERIA, q({ text: '   ' }))).toHaveLength(4);
  });

  it('matches on criterion name, case-insensitively', () => {
    expect(filterCriteria(CRITERIA, q({ text: 'contrast' })).map((c) => c.num)).toEqual([
      '1.4.3',
      '1.4.11',
    ]);
    expect(filterCriteria(CRITERIA, q({ text: 'KEYBOARD' })).map((c) => c.num)).toEqual([
      '2.1.1',
    ]);
  });

  it('matches on criterion number, including a partial number', () => {
    expect(filterCriteria(CRITERIA, q({ text: '1.4.11' })).map((c) => c.num)).toEqual(['1.4.11']);
    expect(filterCriteria(CRITERIA, q({ text: '1.4' }))).toHaveLength(3);
  });

  it('ignores surrounding whitespace', () => {
    expect(filterCriteria(CRITERIA, q({ text: '  keyboard  ' }))).toHaveLength(1);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterCriteria(CRITERIA, q({ text: 'zzzz' }))).toEqual([]);
  });
});

describe('level and text compose', () => {
  it('applies both, not either', () => {
    // 'contrast' alone matches two; restricted to AA it still matches two; to A, none.
    expect(filterCriteria(CRITERIA, q({ text: 'contrast', level: 'AA' }))).toHaveLength(2);
    expect(filterCriteria(CRITERIA, q({ text: 'contrast', level: 'A' }))).toEqual([]);
  });
});

describe('counts and summary', () => {
  it('reports a count that matches the list actually returned', () => {
    for (const query of [q(), q({ level: 'A' }), q({ text: 'contrast' })]) {
      const counts = countMatches(CRITERIA, query);
      expect(counts.shown).toBe(filterCriteria(CRITERIA, query).length);
      expect(counts.total).toBe(CRITERIA.length);
    }
  });

  it('says nothing about filtering when nothing is filtered', () => {
    expect(summarise(countMatches(CRITERIA, q()), q())).toBe('4 criteria documented');
  });

  it('names both numbers when a filter is active', () => {
    const query = q({ level: 'A' });
    expect(summarise(countMatches(CRITERIA, query), query)).toBe('Showing 2 of 4 criteria');
  });

  it('says so plainly when a filter matches nothing', () => {
    const query = q({ text: 'zzzz' });
    expect(summarise(countMatches(CRITERIA, query), query)).toBe('No criteria match');
  });
});

describe('isFiltering', () => {
  it('is false only for the empty query', () => {
    expect(isFiltering(q())).toBe(false);
    expect(isFiltering(q({ level: 'A' }))).toBe(true);
    expect(isFiltering(q({ text: 'a' }))).toBe(true);
    expect(isFiltering(q({ text: '   ' }))).toBe(false);
  });
});
