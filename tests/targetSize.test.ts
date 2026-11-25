import { describe, it, expect } from 'vitest';
import { TARGETS_START, targetCheck, targetSaid, targetVerdict } from '../src/labs/targetSize';
import { searchFromTargets, targetsFromSearch } from '../src/labs/targetQuery';

/**
 * The 2.5.8 flagship lab (#57): three equal square targets in a row, `size` px wide and `gap` px
 * apart. Expected values are worked by hand from the criterion: a target of 24 by 24 or more
 * passes on size; a smaller one passes only if a 24px circle centred on each clears its
 * neighbours' circles, which for equal squares in a row means centres at least 24px apart
 * (circles that touch do not overlap).
 */

describe('the target size verdict', () => {
  it('passes a 24 by 24 target on size alone, even touching its neighbours', () => {
    expect(targetVerdict({ size: 24, gap: 0 })).toEqual({ criterion: '2.5.8', passes: true });
    expect(targetCheck({ size: 24, gap: 0 }).bySize).toBe(true);
  });

  it('fails a 23px target packed edge to edge', () => {
    expect(targetVerdict({ size: 23, gap: 0 }).passes).toBe(false);
  });

  it('passes a small target whose circles only touch: 20px apart by 4px, centres 24px apart', () => {
    const c = targetCheck({ size: 20, gap: 4 });
    expect(c.bySize).toBe(false);
    expect(c.overlap).toBe(0);
    expect(c.passes).toBe(true);
  });

  it('fails 16px targets 7px apart: centres 23px apart, circles overlap by 1px', () => {
    const c = targetCheck({ size: 16, gap: 7 });
    expect(c.overlap).toBe(1);
    expect(c.passes).toBe(false);
  });

  it('starts at 16px targets 8px apart, which pass on spacing', () => {
    expect(TARGETS_START).toEqual({ size: 16, gap: 8 });
    expect(targetVerdict(TARGETS_START).passes).toBe(true);
  });

  it('says what changed in words', () => {
    expect(targetSaid({ size: 24, gap: 4 })).toBe(
      '24 pixel targets, 4 pixels apart. At least 24 by 24. Passes.',
    );
    expect(targetSaid({ size: 16, gap: 8 })).toBe(
      '16 pixel targets, 8 pixels apart. Under 24 by 24, but their 24 pixel circles do not overlap. Passes.',
    );
    expect(targetSaid({ size: 16, gap: 0 })).toBe(
      '16 pixel targets, touching. Under 24 by 24, and their 24 pixel circles overlap by 8 pixels. Fails.',
    );
    expect(targetSaid({ size: 22, gap: 1 })).toBe(
      '22 pixel targets, 1 pixel apart. Under 24 by 24, and their 24 pixel circles overlap by 1 pixel. Fails.',
    );
  });
});

describe('the 2.5.8 lab URL', () => {
  it('writes no query for the start', () => {
    expect(searchFromTargets({ size: 16, gap: 8 })).toBe('');
  });

  it('round-trips a changed state', () => {
    expect(searchFromTargets({ size: 12, gap: 0 })).toBe('?size=12&gap=0');
    expect(targetsFromSearch('?size=12&gap=0')).toEqual({ size: 12, gap: 0 });
  });

  it('fills a missing half from the start', () => {
    expect(targetsFromSearch('?gap=2')).toEqual({ size: 16, gap: 2 });
  });

  it('ignores what it does not know, out of range or not a whole number', () => {
    expect(targetsFromSearch('')).toBeNull();
    expect(targetsFromSearch('?size=4&gap=99')).toBeNull();
    expect(targetsFromSearch('?size=1e1&gap=-1')).toBeNull();
    expect(targetsFromSearch('?w=3')).toBeNull();
  });
});
