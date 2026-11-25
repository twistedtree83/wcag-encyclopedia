import { describe, it, expect } from 'vitest';
import { BYPASS_START, bypassSaid, bypassVerdict, pressesToMain } from '../src/labs/bypass';
import {
  OBSCURE_START,
  hiddenShare,
  obscureSaid,
  obscureVerdict,
  type Banner,
} from '../src/labs/obscured';

/**
 * The 2.4.1 and 2.4.11 labs' models (#46). Counts and overlaps are worked out by hand from the
 * mock: a logo, the menu links and a search field before the article; a 200px window with the
 * focused field at 70–110px.
 */

describe('the skip link lab (2.4.1)', () => {
  it('starts with a skip link before a 12-link menu, and passes', () => {
    expect(BYPASS_START).toEqual({ skip: true, links: 12 });
    expect(pressesToMain(BYPASS_START)).toBe(1);
    expect(bypassVerdict(BYPASS_START)).toEqual({ criterion: '2.4.1', passes: true });
  });

  it('without the skip link, Tab walks the logo, every menu link and the search first', () => {
    expect(pressesToMain({ skip: false, links: 12 })).toBe(15);
    expect(pressesToMain({ skip: false, links: 30 })).toBe(33);
    expect(bypassVerdict({ skip: false, links: 12 }).passes).toBe(false);
  });

  it('says how many presses reach the article', () => {
    expect(bypassSaid({ skip: false, links: 12 })).toBe(
      'No skip link: 15 Tab presses to reach the article, on every page.',
    );
    expect(bypassSaid({ skip: true, links: 20 })).toBe(
      'Skip link on: 1 Tab and Enter reach the article, past 20 menu links.',
    );
  });
});

const banner = (patch: Partial<Banner>): Banner => ({ ...OBSCURE_START, ...patch });

describe('the sticky banner lab (2.4.11)', () => {
  it('starts with a 50px banner at the top, clear of the field, and passes', () => {
    expect(OBSCURE_START).toEqual({ top: 0, height: 50 });
    expect(hiddenShare(OBSCURE_START)).toBe(0);
    expect(obscureVerdict(OBSCURE_START)).toEqual({ criterion: '2.4.11', passes: true });
  });

  it('a partly hidden field still passes; a wholly hidden one fails', () => {
    expect(hiddenShare(banner({ top: 60, height: 30 }))).toBe(0.5);
    expect(obscureVerdict(banner({ top: 60, height: 30 })).passes).toBe(true);
    expect(hiddenShare(banner({ height: 120 }))).toBe(1);
    expect(obscureVerdict(banner({ height: 120 })).passes).toBe(false);
  });

  it('says how much of the focused field the banner hides', () => {
    expect(obscureSaid(banner({ height: 120 }))).toBe(
      'Banner 120 pixels tall, at the top. The focused field is completely hidden.',
    );
    expect(obscureSaid(banner({ top: 60, height: 30 }))).toBe(
      'Banner 30 pixels tall, 60 pixels from the top. The focused field is 50% hidden, but still in view.',
    );
    expect(obscureSaid(OBSCURE_START)).toBe(
      'Banner 50 pixels tall, at the top. The focused field is clear of it.',
    );
  });
});
