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
import { CORPUS } from '../src/criteria/corpus';
import { EXPECTED } from '../src/criteria/manifest';

/**
 * The filter engine is a pure function, so it is tested directly — no DOM, no rendering, no
 * mocking. Everything a reader can do to the result set is expressible as a Query.
 */

const record = (
  num: string,
  name: string,
  level: 'A' | 'AA',
  more: Partial<Pick<CriterionRecord, 'since' | 'plain'>> & { failCaption?: string } = {},
): CriterionRecord => ({
  num,
  name,
  level,
  guideline: num.split('.').slice(0, 2).join('.'),
  since: more.since ?? '2.0',
  plain: more.plain ?? 'x',
  fail: { render: () => null, caption: more.failCaption ?? 'c' },
  pass: { render: () => null, caption: 'pass caption only' },
});

const CRITERIA = [
  record('1.4.1', 'Use of Color', 'A'),
  record('1.4.3', 'Contrast (Minimum)', 'AA'),
  record('1.4.11', 'Non-text Contrast', 'AA'),
  record('2.1.1', 'Keyboard', 'A'),
];

const q = (over: Partial<Query> = {}): Query => ({ ...EMPTY_QUERY, ...over });

describe('principle filter', () => {
  it('returns everything when set to All', () => {
    expect(filterCriteria(CRITERIA, q({ principle: 'All' }))).toHaveLength(4);
  });

  it('returns only criteria under the chosen principle', () => {
    expect(filterCriteria(CRITERIA, q({ principle: 1 })).map((c) => c.num)).toEqual([
      '1.4.1',
      '1.4.3',
      '1.4.11',
    ]);
    expect(filterCriteria(CRITERIA, q({ principle: 2 })).map((c) => c.num)).toEqual(['2.1.1']);
    expect(filterCriteria(CRITERIA, q({ principle: 3 }))).toEqual([]);
  });
});

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

const WITH_NEW = [
  ...CRITERIA,
  record('2.4.11', 'Focus Not Obscured (Minimum)', 'AA', { since: '2.2' }),
  record('3.2.6', 'Consistent Help', 'A', { since: '2.2' }),
  record('1.4.10', 'Reflow', 'AA', { since: '2.1' }),
];

describe('new in 2.2', () => {
  it('returns everything when off', () => {
    expect(filterCriteria(WITH_NEW, q({ newIn22: false }))).toHaveLength(7);
  });

  it('returns only criteria introduced in 2.2 when on, not those from 2.1', () => {
    expect(filterCriteria(WITH_NEW, q({ newIn22: true })).map((c) => c.num)).toEqual([
      '2.4.11',
      '3.2.6',
    ]);
  });

  it('combines with level: AA and new in 2.2 is only the AA criteria new in 2.2', () => {
    expect(
      filterCriteria(WITH_NEW, q({ level: 'AA', newIn22: true })).map((c) => c.num),
    ).toEqual(['2.4.11']);
  });

  it('combines with principle', () => {
    expect(filterCriteria(WITH_NEW, q({ principle: 3, newIn22: true })).map((c) => c.num)).toEqual(
      ['3.2.6'],
    );
    expect(filterCriteria(WITH_NEW, q({ principle: 1, newIn22: true }))).toEqual([]);
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

  it('matches on the restatement', () => {
    const corpus = [
      ...CRITERIA,
      record('1.2.2', 'Captions (Prerecorded)', 'A', {
        plain: 'Recorded video with speech carries synchronised text of what is said.',
      }),
    ];
    expect(filterCriteria(corpus, q({ text: 'Synchronised' })).map((c) => c.num)).toEqual([
      '1.2.2',
    ]);
  });

  it('matches on the fail caption', () => {
    const corpus = [
      ...CRITERIA,
      record('2.4.7', 'Focus Visible', 'AA', { failCaption: 'The outline is removed on tab.' }),
    ];
    expect(filterCriteria(corpus, q({ text: 'outline is removed' })).map((c) => c.num)).toEqual([
      '2.4.7',
    ]);
  });

  it('does not match on the pass caption', () => {
    expect(filterCriteria(CRITERIA, q({ text: 'pass caption only' }))).toEqual([]);
  });

  it('does not match across the boundary between two fields', () => {
    // '1.4.1 Use of Color' must not be found by the tail of the name glued to the restatement.
    expect(filterCriteria(CRITERIA, q({ text: 'color x' }))).toEqual([]);
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
    expect(isFiltering(q({ principle: 4 }))).toBe(true);
    expect(isFiltering(q({ newIn22: true }))).toBe(true);
  });
});

/**
 * The same engine over the real corpus. Expected lists are literals from WCAG 2.2, not derived
 * from the records, so a wrong `since` or level shows up here as well as in criteria.test.
 */
describe('over the corpus', () => {
  const nums = (query: Query) => filterCriteria(CORPUS, query).map((c) => c.num);

  it('returns all 55, in corpus order, for the empty query', () => {
    const all = filterCriteria(CORPUS, EMPTY_QUERY);
    expect(all).toHaveLength(55);
    expect(all.map((c) => c.num)).toEqual(EXPECTED.map((e) => e.num));
  });

  it('splits by principle 20 / 20 / 13 / 2', () => {
    const counts = ([1, 2, 3, 4] as const).map((p) => nums(q({ principle: p })).length);
    expect(counts).toEqual([20, 20, 13, 2]);
  });

  it('splits by level 31 A / 24 AA', () => {
    expect(nums(q({ level: 'A' }))).toHaveLength(31);
    expect(nums(q({ level: 'AA' }))).toHaveLength(24);
  });

  it('finds the six criteria new in 2.2', () => {
    expect(nums(q({ newIn22: true }))).toEqual([
      '2.4.11',
      '2.5.7',
      '2.5.8',
      '3.2.6',
      '3.3.7',
      '3.3.8',
    ]);
  });

  it('answers "what AA work came with 2.2?"', () => {
    expect(nums(q({ level: 'AA', newIn22: true }))).toEqual(['2.4.11', '2.5.7', '2.5.8', '3.3.8']);
  });

  it('combines all four inputs', () => {
    expect(nums(q({ principle: 2, level: 'AA', newIn22: true, text: 'focus' }))).toEqual([
      '2.4.11',
    ]);
  });

  it('finds 1.4.3 by its fail caption', () => {
    expect(nums(q({ text: 'fading text out' }))).toEqual(['1.4.3']);
  });

  it('reports a count that always matches the list', () => {
    const queries: Query[] = [
      EMPTY_QUERY,
      q({ principle: 3 }),
      q({ level: 'AA', newIn22: true }),
      q({ text: 'focus' }),
      q({ text: 'zzzz' }),
      q({ principle: 4, level: 'A', newIn22: true }),
    ];
    for (const query of queries) {
      expect(countMatches(CORPUS, query)).toEqual({
        shown: filterCriteria(CORPUS, query).length,
        total: 55,
      });
    }
  });
});
