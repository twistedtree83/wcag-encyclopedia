import { describe, it, expect } from 'vitest';
import { CORPUS, criterion, criteriaFor, populatedGuidelines } from '../src/criteria/corpus';
import { EXPECTED, EXPECTED_TOTAL, expectedFor } from '../src/criteria/manifest';
import { GUIDELINES, PRINCIPLES, PRINCIPLE_MARKS, guidelineFor } from '../src/criteria/structure';

/**
 * Data integrity.
 *
 * Two jobs. First, every authored record is complete and internally consistent — no card can
 * ship without a restatement or an example. Second, every record matches the closed manifest
 * of 55 Level A/AA criteria, so a typo'd number or a mislabelled level fails the gate.
 *
 * The manifest is asserted complete and correct here from day one. The corpus grows toward
 * it: `every record is in the manifest` holds now, and the content tasks close the gap until
 * the two sets are equal.
 */

describe('the WCAG 2.2 manifest', () => {
  it('holds exactly 55 Level A and AA criteria', () => {
    expect(EXPECTED.length).toBe(EXPECTED_TOTAL);
  });

  it('splits 20 / 20 / 13 / 2 across the four principles', () => {
    const byPrinciple = (n: number) =>
      EXPECTED.filter((c) => c.num.startsWith(`${n}.`)).length;
    expect([byPrinciple(1), byPrinciple(2), byPrinciple(3), byPrinciple(4)]).toEqual([
      20, 20, 13, 2,
    ]);
  });

  it('omits 4.1.1 Parsing, which WCAG 2.2 removed', () => {
    expect(EXPECTED.find((c) => c.num === '4.1.1')).toBeUndefined();
  });

  it('holds only Level A and AA — AAA is out of the closed set', () => {
    for (const entry of EXPECTED) {
      expect(['A', 'AA'], entry.num).toContain(entry.level);
    }
  });

  it('lists every criterion once, under a guideline that exists', () => {
    const nums = EXPECTED.map((c) => c.num);
    expect(nums.length).toBe(new Set(nums).size);
    for (const entry of EXPECTED) {
      expect(guidelineFor(entry.guideline), entry.num).toBeDefined();
    }
  });
});

describe('the structure', () => {
  it('has four principles and thirteen guidelines', () => {
    expect(PRINCIPLES).toHaveLength(4);
    expect(GUIDELINES).toHaveLength(13);
  });

  it('gives every principle a distinct accent *and* a distinct marker shape', () => {
    const marks = Object.values(PRINCIPLE_MARKS);
    // Hue alone must never carry the grouping — 1.4.1, applied to the site itself.
    expect(new Set(marks.map((m) => m.shape)).size).toBe(4);
    expect(new Set(marks.map((m) => m.token)).size).toBe(4);
  });

  it('assigns every guideline to a real principle', () => {
    for (const g of GUIDELINES) {
      expect(PRINCIPLES.map((p) => p.num), g.num).toContain(g.principle);
    }
  });
});

describe('every authored criterion record', () => {
  it('has at least one record to check', () => {
    expect(CORPUS.length).toBeGreaterThan(0);
  });

  it.each(CORPUS.map((c) => [c.num, c] as const))('%s is complete', (_num, record) => {
    expect(record.name.trim()).not.toBe('');
    expect(record.plain.trim()).not.toBe('');
    expect(record.fail.caption.trim()).not.toBe('');
    expect(record.pass.caption.trim()).not.toBe('');
    expect(typeof record.fail.render).toBe('function');
    expect(typeof record.pass.render).toBe('function');
  });

  it.each(CORPUS.map((c) => [c.num, c] as const))(
    '%s matches the manifest on level and guideline',
    (num, record) => {
      const expected = expectedFor(num);
      expect(expected, `${num} is not a Level A or AA criterion of WCAG 2.2`).toBeDefined();
      expect(record.level).toBe(expected!.level);
      expect(record.guideline).toBe(expected!.guideline);
    },
  );

  it.each(CORPUS.map((c) => [c.num, c] as const))(
    '%s has a guideline that is its number minus the last segment',
    (num, record) => {
      expect(record.guideline).toBe(num.split('.').slice(0, 2).join('.'));
    },
  );

  it('numbers every record uniquely', () => {
    const nums = CORPUS.map((c) => c.num);
    expect(nums.length).toBe(new Set(nums).size);
  });

  it('restates rather than reproducing — no normative "must"/"shall" phrasing', () => {
    for (const record of CORPUS) {
      expect(record.plain, record.num).not.toMatch(/\bshall\b/i);
    }
  });
});

describe('corpus lookups', () => {
  it('finds a criterion by number', () => {
    expect(criterion('1.4.1')?.name).toBe('Use of Color');
    expect(criterion('9.9.9')).toBeUndefined();
  });

  it('groups criteria by guideline', () => {
    for (const record of criteriaFor('1.4')) {
      expect(record.guideline).toBe('1.4');
    }
  });

  it('reports populated guidelines in standard numeric order', () => {
    const populated = populatedGuidelines();
    expect(populated).toEqual([...populated].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    ));
    for (const num of populated) {
      expect(guidelineFor(num), num).toBeDefined();
    }
  });
});
