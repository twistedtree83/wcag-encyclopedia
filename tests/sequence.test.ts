import { describe, it, expect } from 'vitest';
import { readingOrder, screenOrder, seqSaid, seqVerdict } from '../src/labs/meaningful-sequence/sequence';

/**
 * The 1.3.2 lab's model (#49): the checkout steps' source order, and whether CSS sorts them on
 * screen. A screen reader follows the source; the verdict asks whether that order is the
 * meaningful one (1 Basket, 2 Address, 3 Confirm). Expected orders are written out by hand.
 */

describe('reading and screen order', () => {
  it('reads the source order, whatever CSS does on screen', () => {
    const seq = { source: 'confirm-first', layout: 'order' } as const;
    expect(readingOrder(seq)).toEqual(['confirm', 'basket', 'address']);
    expect(screenOrder(seq)).toEqual(['basket', 'address', 'confirm']);
  });

  it('shows the source order on screen when nothing reorders it', () => {
    const seq = { source: 'address-first', layout: 'source' } as const;
    expect(screenOrder(seq)).toEqual(['address', 'confirm', 'basket']);
  });
});

describe('verdict', () => {
  it('fails when CSS hides a scrambled source behind a correct-looking screen', () => {
    expect(seqVerdict({ source: 'confirm-first', layout: 'order' })).toEqual({
      criterion: '1.3.2',
      passes: false,
    });
  });

  it('fails when the scrambled source shows on screen too', () => {
    expect(seqVerdict({ source: 'address-first', layout: 'source' }).passes).toBe(false);
  });

  it('passes once the source itself is in order, with or without the CSS', () => {
    expect(seqVerdict({ source: 'in-order', layout: 'order' }).passes).toBe(true);
    expect(seqVerdict({ source: 'in-order', layout: 'source' }).passes).toBe(true);
  });
});

describe('what is announced', () => {
  it('says the reading order, then whether it matches the screen', () => {
    expect(seqSaid({ source: 'confirm-first', layout: 'order' })).toBe(
      'Screen reader reads: 3. Confirm; 1. Basket; 2. Address. Out of order, though the screen looks right.',
    );
    expect(seqSaid({ source: 'address-first', layout: 'source' })).toBe(
      'Screen reader reads: 2. Address; 3. Confirm; 1. Basket. Out of order, on screen too.',
    );
    expect(seqSaid({ source: 'in-order', layout: 'order' })).toBe(
      'Screen reader reads: 1. Basket; 2. Address; 3. Confirm. In order.',
    );
  });
});
