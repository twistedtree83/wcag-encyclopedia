import { describe, it, expect } from 'vitest';
import {
  parseHex,
  relativeLuminance,
  contrastRatio,
  formatRatio,
  meetsAA,
} from '../src/color/contrast';

describe('the contrast engine', () => {
  it('parses long and short hex, with or without the hash', () => {
    expect(parseHex('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('#f0a')).toEqual({ r: 255, g: 0, b: 170 });
  });

  it('rejects anything that is not a hex colour', () => {
    expect(() => parseHex('rebeccapurple')).toThrow();
    expect(() => parseHex('#12345')).toThrow();
    expect(() => parseHex('')).toThrow();
  });

  it('puts relative luminance at the ends of the range for black and white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
  });

  // The two anchors every contrast implementation must hit.
  it('reports 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('reports 4.5:1 for #767676 on white — the Level AA body-text boundary', () => {
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });

  it('is symmetric — argument order does not matter', () => {
    expect(contrastRatio('#1B1A16', '#FAF7F1')).toBe(contrastRatio('#FAF7F1', '#1B1A16'));
  });

  it('reports 1:1 for a colour against itself', () => {
    expect(contrastRatio('#8A5300', '#8A5300')).toBeCloseTo(1, 10);
  });

  it('truncates rather than rounds when formatting, so it never over-claims', () => {
    // 4.58 must not present as 4.6 and imply more headroom than exists.
    expect(formatRatio(4.58)).toBe('4.5:1');
    expect(formatRatio(21)).toBe('21.0:1');
  });

  it('applies 4.5:1 to body text and 3:1 to large text and UI', () => {
    expect(meetsAA(4.5, 'body')).toBe(true);
    expect(meetsAA(4.49, 'body')).toBe(false);
    expect(meetsAA(3, 'large')).toBe(true);
    expect(meetsAA(3, 'ui')).toBe(true);
    expect(meetsAA(2.99, 'ui')).toBe(false);
  });
});
