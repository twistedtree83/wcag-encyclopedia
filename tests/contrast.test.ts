import { describe, it, expect } from 'vitest';
import {
  parseHex,
  relativeLuminance,
  contrastRatio,
  formatRatio,
  meetsAA,
  normaliseHex,
  formatScore,
  passesThreshold,
  nearestPass,
  AA_BODY,
  AA_LARGE,
  AAA_BODY,
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

describe('the colour check maths', () => {
  it('normalises 3- and 6-digit hex, with or without #, and rejects partial codes', () => {
    expect(normaliseHex('abc')).toBe('#AABBCC');
    expect(normaliseHex(' #1a1c1c ')).toBe('#1A1C1C');
    expect(normaliseHex('#F8D17D')).toBe('#F8D17D');
    expect(normaliseHex('#12')).toBeNull();
    expect(normaliseHex('1234')).toBeNull();
    expect(normaliseHex('#12345')).toBeNull();
    expect(normaliseHex('zzz')).toBeNull();
    expect(normaliseHex('')).toBeNull();
  });

  it('truncates the score to two decimals, never rounding', () => {
    expect(formatScore(4.499)).toBe('4.49');
    expect(formatScore(4.5)).toBe('4.50');
    expect(formatScore(2.999999)).toBe('2.99');
    expect(formatScore(21)).toBe('21.00');
    expect(formatScore(1)).toBe('1.00');
  });

  it('judges a threshold on the truncated ratio, so 4.499 fails 4.5', () => {
    expect(passesThreshold(4.499, AA_BODY)).toBe(false);
    expect(passesThreshold(4.5, AA_BODY)).toBe(true);
    expect(passesThreshold(6.999, AAA_BODY)).toBe(false);
    expect(AAA_BODY).toBe(7);
  });

  it('truncation never turns a fail into a pass', () => {
    // Ratios from 1 to 21 in small steps: whenever the shown score or verdict passes, the
    // real ratio passes too.
    // Collect over-claims and assert once, so the sweep stays fast.
    const overClaims: string[] = [];
    const ratios = [4.4999999, 2.9999999, 6.9999999, 4.4999, 2.999, 6.999];
    for (let i = 0; i <= 30000; i++) ratios.push(1 + i * (20 / 30000));
    for (const r of ratios) {
      for (const t of [AA_BODY, AA_LARGE, AAA_BODY]) {
        if (r < t && (passesThreshold(r, t) || Number(formatScore(r)) >= t)) {
          overClaims.push(`${r} vs ${t}`);
        }
      }
    }
    expect(overClaims).toEqual([]);
  });

  it('suggests #767676 for #777777 on white', () => {
    // #777777 is 4.47:1 on white (truncated); one step darker reaches 4.54:1.
    expect(contrastRatio('#777777', '#FFFFFF')).toBeLessThan(4.5);
    expect(nearestPass('#777777', '#FFFFFF')).toBe('#767676');
  });

  it('mixes towards white when that is the smaller change', () => {
    const c = nearestPass('#333333', '#1A1C1C')!;
    expect(contrastRatio(c, '#1A1C1C')).toBeGreaterThanOrEqual(4.5);
    expect(relativeLuminance(c)).toBeGreaterThan(relativeLuminance('#333333'));
  });

  it('the nearest passing colour always reaches 4.5:1', () => {
    const fgs = ['#B5B5B5', '#9CCADE', '#FF8A80', '#5A5B5F', '#D0312D', '#FFFFFF', '#000000', '#777777'];
    const bgs = ['#FFFFFF', '#2A2B2D', '#3A9A3A', '#F8D17D', '#777777', '#000000'];
    for (const fg of fgs) {
      for (const bg of bgs) {
        const c = nearestPass(fg, bg);
        expect(c, `${fg} on ${bg}`).not.toBeNull();
        expect(contrastRatio(c!, bg), `${fg} on ${bg} gave ${c}`).toBeGreaterThanOrEqual(4.5);
        expect(passesThreshold(contrastRatio(c!, bg), AA_BODY)).toBe(true);
      }
    }
  });
});
