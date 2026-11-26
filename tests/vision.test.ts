import { describe, it, expect } from 'vitest';
import { cssColourToHex, nextFilter, seeCue, seen, visionSaid } from '../src/live/vision';

/**
 * The vision filter (#56): what a colour looks like through greyscale and the three colour-vision
 * simulations, and whether a cue that carries meaning still stands out. Expected colours are
 * worked by hand from the published matrices (CSS grayscale(1); Machado, Oliveira and Fernandes
 * 2009 at full severity, in linear RGB); expected ratios from the WCAG formula.
 */

describe('a colour through the filter', () => {
  it('leaves full colour alone', () => {
    expect(seen('#1668C4', 'none')).toBe('#1668C4');
  });

  it('turns red into the grey CSS grayscale(1) draws: 0.2126 of full red', () => {
    expect(seen('#FF0000', 'greyscale')).toBe('#363636');
  });

  it('turns pure red into a dark olive for a red-blind eye', () => {
    expect(seen('#FF0000', 'protanopia')).toBe('#6D5F00');
  });

  it('keeps white white and black black under every filter', () => {
    for (const f of ['greyscale', 'protanopia', 'deuteranopia', 'tritanopia'] as const) {
      expect(seen('#FFFFFF', f), f).toBe('#FFFFFF');
      expect(seen('#000000', f), f).toBe('#000000');
    }
  });
});

describe('cycling the filter', () => {
  it('goes greyscale first, through the three colour-vision views, and back to full colour', () => {
    const order = ['none'];
    for (let i = 0; i < 5; i++) order.push(nextFilter(order.at(-1) as never));
    expect(order).toEqual([
      'none',
      'greyscale',
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'none',
    ]);
  });
});

describe('reading a rendered colour', () => {
  it('reads rgb() and rgba() as getComputedStyle writes them', () => {
    expect(cssColourToHex('rgb(22, 104, 196)')).toBe('#1668C4');
    expect(cssColourToHex('rgba(255, 255, 255, 1)')).toBe('#FFFFFF');
  });

  it('reads a transparent colour as nothing', () => {
    expect(cssColourToHex('rgba(0, 0, 0, 0)')).toBeNull();
    expect(cssColourToHex('transparent')).toBeNull();
  });
});

describe('whether a cue still stands out', () => {
  const link = {
    label: 'delivery schedule',
    colour: '#1668C4',
    against: '#4A4B4F',
    vs: 'the text around it',
    need: 3,
    also: null,
  };

  it('loses a link that differs from its sentence by hue alone', () => {
    const s = seeCue(link, 'greyscale');
    expect(s.ratioText).toBe('1.32 : 1');
    expect(s.found).toBe(false);
    expect(s.line).toBe('Delivery schedule: 1.32 : 1 against the text around it, needs 3 : 1. Lost.');
  });

  it('still finds it when something other than colour marks it', () => {
    const s = seeCue({ ...link, also: 'underlined' }, 'greyscale');
    expect(s.found).toBe(true);
    expect(s.line).toBe('Delivery schedule: 1.32 : 1 against the text around it, and underlined. Stands out.');
  });

  it('finds an edge that is 3 : 1 against its background', () => {
    const edge = { label: 'the field’s edge', colour: '#6A6A6A', against: '#FFFFFF', vs: 'the background', need: 3, also: null };
    const s = seeCue(edge, 'none');
    expect(s.ratioText).toBe('5.40 : 1');
    expect(s.line).toBe('The field’s edge: 5.40 : 1 against the background. Stands out.');
  });
});

describe('what is said', () => {
  it('names the filter, then each cue, starting it with a capital', () => {
    const cue = seeCue(
      { label: 'x', colour: '#000000', against: '#FFFFFF', vs: 'the background', need: 3, also: null },
      'greyscale',
    );
    expect(visionSaid({ filter: 'greyscale', cues: [cue] })).toBe(
      'Vision filter: greyscale. X: 21.00 : 1 against the background. Stands out.',
    );
  });
});
