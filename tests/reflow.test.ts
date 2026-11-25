import { describe, it, expect } from 'vitest';
import { DESKTOP, ZOOMS, scrollsOf, scrollLine, viewportAt } from '../src/labs/zoom';
import { REFLOW_START, reflowSaid, reflowVerdict } from '../src/labs/reflow';
import { reflowFromSearch, searchFromReflow } from '../src/labs/reflowQuery';
import { zoomSaid } from '../src/live/events';

/**
 * The zoom frame (#53) and the 1.4.10 flagship lab. Anchors come from WCAG's own Reflow
 * understanding: a 1280 CSS px wide window zoomed to 400% is 320 CSS px wide, and 1024 tall
 * becomes 256.
 */

describe('the zoom frame’s window', () => {
  it('is a 1280 by 1024 desktop window at 100%', () => {
    expect(DESKTOP).toEqual({ width: 1280, height: 1024 });
    expect(viewportAt(100)).toEqual({ width: 1280, height: 1024 });
  });

  it('is 320 by 256 CSS px at 400%, and 640 by 512 at 200%', () => {
    expect(ZOOMS).toEqual([100, 200, 400]);
    expect(viewportAt(400)).toEqual({ width: 320, height: 256 });
    expect(viewportAt(200)).toEqual({ width: 640, height: 512 });
  });

  it('swaps width and height when turned', () => {
    expect(viewportAt(400, DESKTOP, true)).toEqual({ width: 256, height: 320 });
  });
});

describe('what scrolls in the frame', () => {
  const box = (scrollWidth: number, scrollHeight: number) => ({
    scrollWidth,
    clientWidth: 320,
    scrollHeight,
    clientHeight: 256,
  });

  it('scrolls down only when the content is just taller', () => {
    expect(scrollsOf(box(320, 900))).toEqual({ sideways: false, down: true });
    expect(scrollLine({ sideways: false, down: true })).toBe('Scrolls down only');
  });

  it('scrolls in two directions when the content is wider too', () => {
    expect(scrollsOf(box(960, 900))).toEqual({ sideways: true, down: true });
    expect(scrollLine({ sideways: true, down: true })).toBe(
      'Scrolls down and sideways: two directions',
    );
  });

  it('ignores a sub-pixel rounding difference', () => {
    expect(scrollsOf(box(321, 256))).toEqual({ sideways: false, down: false });
    expect(scrollLine({ sideways: false, down: false })).toBe('Nothing scrolls');
  });

  it('is said after a zoom, on either stage', () => {
    expect(
      zoomSaid({ kind: 'zoom', simulated: true, zoom: 400, width: 320, height: 256, sideways: true, down: true }),
    ).toBe('Zoomed to 400%, 320 CSS pixels wide. Scrolls down and sideways: two directions.');
  });
});

describe('the 1.4.10 lab', () => {
  it('starts with the fixed-width page at 100%, which fits, and passes', () => {
    expect(REFLOW_START).toEqual({ zoom: 100, layout: 'fixed' });
    expect(reflowVerdict(REFLOW_START)).toEqual({ criterion: '1.4.10', passes: true });
  });

  it('fails once the fixed page is wider than the window: at 200% and at 400%', () => {
    expect(reflowVerdict({ zoom: 200, layout: 'fixed' }).passes).toBe(false);
    expect(reflowVerdict({ zoom: 400, layout: 'fixed' }).passes).toBe(false);
  });

  it('passes at every zoom when the page reflows', () => {
    for (const zoom of ZOOMS) expect(reflowVerdict({ zoom, layout: 'reflow' }).passes).toBe(true);
  });

  it('says the zoom, the width and what scrolls', () => {
    expect(reflowSaid({ zoom: 400, layout: 'fixed' })).toBe(
      '400% zoom, 320 CSS pixels wide. Fixed width: scrolls down and sideways.',
    );
    expect(reflowSaid({ zoom: 400, layout: 'reflow' })).toBe(
      '400% zoom, 320 CSS pixels wide. Reflows: scrolls down only.',
    );
  });
});

describe('the 1.4.10 lab’s URL', () => {
  it('writes nothing for the start, and both values otherwise', () => {
    expect(searchFromReflow(REFLOW_START)).toBe('');
    expect(searchFromReflow({ zoom: 400, layout: 'fixed' })).toBe('?zoom=400&layout=fixed');
  });

  it('reads back what it wrote, filling a missing value from the start', () => {
    expect(reflowFromSearch('?zoom=400&layout=reflow')).toEqual({ zoom: 400, layout: 'reflow' });
    expect(reflowFromSearch('?zoom=200')).toEqual({ zoom: 200, layout: 'fixed' });
  });

  it('ignores what it does not know', () => {
    expect(reflowFromSearch('')).toBeNull();
    expect(reflowFromSearch('?zoom=300&layout=wide')).toBeNull();
  });
});
