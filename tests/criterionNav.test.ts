import { describe, it, expect } from 'vitest';
import { criterion } from '../src/criteria/corpus';
import { neighbours, related } from '../src/site/criterionNav';

/**
 * How a criterion page links onward: the pager (previous and next in number order) and the
 * "Also in" cards (same guideline, else same principle, at most six).
 */
describe('neighbours', () => {
  it('runs in number order, not string order: 1.4.10 follows 1.4.5', () => {
    expect(neighbours('1.4.5').next?.num).toBe('1.4.10');
    expect(neighbours('1.4.10').prev?.num).toBe('1.4.5');
    expect(neighbours('1.4.1').next?.num).toBe('1.4.2');
  });

  it('crosses guideline and principle boundaries', () => {
    expect(neighbours('1.4.13').next?.num).toBe('2.1.1');
    expect(neighbours('2.1.1').prev?.num).toBe('1.4.13');
  });

  it('gives the first criterion only a next and the last only a previous', () => {
    expect(neighbours('1.1.1')).toEqual({ next: criterion('1.2.1') });
    expect(neighbours('4.1.3')).toEqual({ prev: criterion('4.1.2') });
  });

  it('throws on a number the corpus does not have', () => {
    expect(() => neighbours('9.9.9')).toThrow(/9\.9\.9/);
  });
});

describe('related', () => {
  const nums = (num: string) => related(criterion(num)!).records.map((r) => r.num);

  it('lists the other criteria in the same guideline', () => {
    const r = related(criterion('4.1.2')!);
    expect(r.heading).toBe('Also in guideline 4.1');
    expect(r.byGuideline).toBe(true);
    expect(r.records.map((c) => c.num)).toEqual(['4.1.3']);
  });

  it('stops at six', () => {
    // Guideline 1.4 has nine Level A and AA criteria, so 1.4.3 has eight siblings.
    expect(nums('1.4.3')).toEqual(['1.4.1', '1.4.2', '1.4.4', '1.4.5', '1.4.10', '1.4.11']);
  });

  it('never lists the criterion itself', () => {
    expect(nums('1.4.1')).not.toContain('1.4.1');
  });

  it('falls back to the same principle when the guideline has no others', () => {
    const r = related(criterion('1.1.1')!);
    expect(r.heading).toBe('More from Perceivable');
    expect(r.byGuideline).toBe(false);
    expect(r.records.map((c) => c.num)).toEqual([
      '1.2.1',
      '1.2.2',
      '1.2.3',
      '1.2.4',
      '1.2.5',
      '1.3.1',
    ]);

    const flashes = related(criterion('2.3.1')!);
    expect(flashes.heading).toBe('More from Operable');
    expect(flashes.records.map((c) => c.num)).toEqual([
      '2.1.1',
      '2.1.2',
      '2.1.4',
      '2.2.1',
      '2.2.2',
      '2.4.1',
    ]);
  });
});
