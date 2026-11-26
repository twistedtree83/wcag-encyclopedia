import { describe, it, expect } from 'vitest';
import {
  RESIZE_START,
  SPACING_START,
  clips,
  resizeSaid,
  resizeVerdict,
  spacingSaid,
  spacingVerdict,
} from '../src/labs/shared/textFit';
import { textFitSaid } from '../src/live/events';
import { searchFromSpacing, spacingFromSearch } from '../src/labs/text-fit/spacingQuery';

/**
 * Text that has to fit (#54): the 1.4.12 flagship lab (text-spacing overrides on fixed-height
 * or flexible boxes) and the 1.4.4 lab (text at 200% in px-locked or flexible boxes). The
 * overrides and their figures are 1.4.12's own: line height 1.5, paragraph spacing 2, letter
 * spacing 0.12 and word spacing 0.16, each times the font size.
 */

describe('the 1.4.12 lab', () => {
  it('starts with no overrides on fixed-height boxes, and passes because nothing has grown', () => {
    expect(SPACING_START).toEqual({ on: [], boxes: 'fixed' });
    expect(spacingVerdict(SPACING_START)).toEqual({ criterion: '1.4.12', passes: true });
  });

  it('fails as soon as any one override reaches the fixed-height boxes', () => {
    for (const one of ['line', 'paragraph', 'letter', 'word'] as const) {
      expect(spacingVerdict({ on: [one], boxes: 'fixed' }).passes, one).toBe(false);
    }
  });

  it('passes with all four overrides on flexible boxes', () => {
    expect(
      spacingVerdict({ on: ['line', 'paragraph', 'letter', 'word'], boxes: 'flexible' }).passes,
    ).toBe(true);
  });

  it('says which overrides are on and whether the text fits', () => {
    expect(spacingSaid({ on: ['line'], boxes: 'fixed' })).toBe(
      'Line height 1.5. Fixed-height boxes: text is cut off.',
    );
    expect(spacingSaid({ on: ['line', 'paragraph', 'letter', 'word'], boxes: 'flexible' })).toBe(
      'Line height 1.5, paragraph spacing 2, letter spacing 0.12, word spacing 0.16. Flexible boxes: all the text fits.',
    );
    expect(spacingSaid({ on: [], boxes: 'flexible' })).toBe(
      'No spacing overrides. Flexible boxes: all the text fits.',
    );
  });
});

describe('the 1.4.12 lab’s URL', () => {
  it('writes nothing for the start', () => {
    expect(searchFromSpacing(SPACING_START)).toBe('');
  });

  it('writes the overrides in a fixed order, and the boxes', () => {
    expect(searchFromSpacing({ on: ['word', 'line'], boxes: 'fixed' })).toBe(
      '?spacing=line,word&boxes=fixed',
    );
    expect(searchFromSpacing({ on: [], boxes: 'flexible' })).toBe('?spacing=&boxes=flexible');
  });

  it('reads back what it wrote', () => {
    const state = { on: ['line', 'paragraph', 'letter', 'word'], boxes: 'flexible' } as const;
    expect(spacingFromSearch(searchFromSpacing(state))).toEqual(state);
  });

  it('ignores what it does not know, and asks for nothing when nothing is known', () => {
    expect(spacingFromSearch('?spacing=line,huge&boxes=round')).toEqual({ on: ['line'], boxes: 'fixed' });
    expect(spacingFromSearch('?zoom=400')).toBeNull();
    expect(spacingFromSearch('')).toBeNull();
  });
});

describe('the 1.4.4 lab', () => {
  it('starts at 100% in px-locked boxes, and passes', () => {
    expect(RESIZE_START).toEqual({ scale: 100, boxes: 'locked' });
    expect(resizeVerdict(RESIZE_START)).toEqual({ criterion: '1.4.4', passes: true });
  });

  it('fails once the text grows inside px-locked boxes, and passes in flexible ones', () => {
    expect(resizeVerdict({ scale: 150, boxes: 'locked' }).passes).toBe(false);
    expect(resizeVerdict({ scale: 200, boxes: 'locked' }).passes).toBe(false);
    expect(resizeVerdict({ scale: 200, boxes: 'flexible' }).passes).toBe(true);
  });

  it('says the text size and whether the text fits', () => {
    expect(resizeSaid({ scale: 200, boxes: 'locked' })).toBe('Text at 200%. Locked in px: text is cut off.');
    expect(resizeSaid({ scale: 200, boxes: 'flexible' })).toBe('Text at 200%. Flexible: all the text fits.');
  });
});

describe('a box that clips its text', () => {
  const box = (scrollWidth: number, scrollHeight: number) => ({
    scrollWidth,
    clientWidth: 200,
    scrollHeight,
    clientHeight: 40,
  });

  it('holds more than it shows, either way', () => {
    expect(clips(box(200, 40))).toBe(false);
    expect(clips(box(205, 40))).toBe(true);
    expect(clips(box(200, 64))).toBe(true);
  });

  it('ignores a pixel of rounding', () => {
    expect(clips(box(201, 41))).toBe(false);
  });
});

describe('what a live stage says after the text changes', () => {
  it('names the text size or the spacing, and whether text is cut off', () => {
    expect(textFitSaid({ kind: 'text-fit', simulated: true, scale: 200, spacing: false, clipped: true })).toBe(
      'Text at 200%. Text is cut off.',
    );
    expect(textFitSaid({ kind: 'text-fit', simulated: false, scale: 100, spacing: true, clipped: false })).toBe(
      'Text spacing on. All the text fits.',
    );
    expect(textFitSaid({ kind: 'text-fit', simulated: false, scale: 100, spacing: false, clipped: false })).toBe(
      'Text at 100%, spacing off. All the text fits.',
    );
  });
});
