import { describe, it, expect } from 'vitest';
import { RING_START, ringCheck, ringSaid, ringVerdict, type Ring } from '../src/labs/focusRing';
import { ringFromSearch, searchFromRing } from '../src/labs/ringQuery';

/**
 * The 2.4.7 flagship lab's model (#44): the reader styles a focus ring on a dark button on a
 * white page. The ring is judged at 3:1 against everything it touches, the non-text threshold
 * from the site's threshold list. Anchor ratios are the widely published ones: black on white
 * is 21:1, #949494 on white 3.03:1 (the lightest grey that clears 3:1), #FFCC00 on white about 1.5:1.
 */

const ring = (patch: Partial<Ring>): Ring => ({ ...RING_START, ...patch });

describe('the focus ring check', () => {
  it('starts as a 3px blue ring, 2px clear of the button, and passes', () => {
    expect(RING_START).toEqual({ width: 3, offset: 2, colour: 'blue' });
    expect(ringVerdict(RING_START)).toEqual({ criterion: '2.4.7', passes: true });
  });

  it('fails with no ring at all', () => {
    expect(ringVerdict(ring({ width: 0 })).passes).toBe(false);
    expect(ringCheck(ring({ width: 0 })).sides).toEqual([]);
  });

  it('with an offset, judges the ring only against the page behind the gap', () => {
    const check = ringCheck(ring({ colour: 'black', offset: 2 }));
    expect(check.sides.map((s) => [s.against, s.score, s.passes])).toEqual([
      ['the page', '21.00', true],
    ]);
  });

  it('a mid grey just clears 3:1 on white', () => {
    const check = ringCheck(ring({ colour: 'grey' }));
    expect(check.sides[0]!.score).toBe('3.03');
    expect(check.passes).toBe(true);
  });

  it('with no offset, the ring also touches the dark button, and a dark ring is lost in it', () => {
    const check = ringCheck(ring({ colour: 'black', offset: 0 }));
    expect(check.sides.map((s) => [s.against, s.passes])).toEqual([
      ['the page', true],
      ['the button', false],
    ]);
    expect(check.passes).toBe(false);
    // A mid grey stands out from both.
    expect(ringCheck(ring({ colour: 'grey', offset: 0 })).passes).toBe(true);
  });

  it('a yellow ring stands out on the dark button but vanishes on the white page', () => {
    expect(ringCheck(ring({ colour: 'yellow', offset: 0 })).sides.map((s) => s.passes)).toEqual([
      false,
      true,
    ]);
    expect(ringVerdict(ring({ colour: 'yellow' })).passes).toBe(false);
  });
});

describe('what the lab says after a change', () => {
  it('says the ring, the ratios and whether it can be seen', () => {
    expect(ringSaid(ring({ colour: 'black' }))).toBe(
      '3 pixel black ring, 2 pixels clear. 21.00 to 1 against the page. Visible.',
    );
    expect(ringSaid(ring({ colour: 'black', offset: 0 }))).toBe(
      '3 pixel black ring, touching the button. 21.00 to 1 against the page, 1.43 to 1 against the button. Lost against the button.',
    );
    expect(ringSaid(ring({ width: 0 }))).toBe('No ring. Focus cannot be seen.');
  });
});

describe('the lab state in the URL', () => {
  it('writes nothing for the start, and a query for anything else', () => {
    expect(searchFromRing(RING_START)).toBe('');
    expect(searchFromRing(ring({ width: 0, colour: 'yellow' }))).toBe('?w=0&off=2&c=yellow');
  });

  it('reads back what it wrote', () => {
    const r = ring({ width: 5, offset: 0, colour: 'grey' });
    expect(ringFromSearch(searchFromRing(r))).toEqual(r);
  });

  it('ignores unknown or out-of-range values, and asks for nothing when none are known', () => {
    expect(ringFromSearch('')).toBeNull();
    expect(ringFromSearch('?w=99&c=pink')).toBeNull();
    expect(ringFromSearch('?w=1.5&off=4')).toEqual(ring({ offset: 4 }));
  });
});
