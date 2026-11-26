import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { fadeState, FADE_DEFAULT } from '../src/labs/fade-text/fade';
import { FadeLab } from '../src/labs/fade-text/FadeLab';
import { labById } from '../src/labs/registry';
import { criterion } from '../src/criteria/corpus';
import { render, ROUTES } from '../src/entry-server';

/**
 * The fade-the-text lab (R-07). Expected values come from the design guide's lab screenshots
 * (components/demo-lab-*.png at 18% faded, states/demo-lab-failing.png at 75%), not from the
 * contrast formula, so these tests can disagree with the code.
 */

describe('the fade model', () => {
  it('starts 18% faded, where everything passes (the design screenshot)', () => {
    expect(FADE_DEFAULT).toBe(18);
    const s = fadeState(18);
    expect(s.ratioText).toBe('11.94 : 1');
    expect(s.results.map((r) => r.passes)).toEqual([true, true, true]);
  });

  it('fails all three thresholds at 75% faded (the faded-until-it-fails screenshot)', () => {
    const s = fadeState(75);
    expect(s.ratioText).toBe('2.78 : 1');
    expect(s.results.map((r) => r.passes)).toEqual([false, false, false]);
  });

  it('names the three thresholds the way the design does', () => {
    expect(fadeState(0).results.map((r) => `${r.name}, ${r.level}`)).toEqual([
      'Body text, AA · 1.4.3',
      'Large text, AA · 1.4.3',
      'Body text, AAA · 1.4.6',
    ]);
  });

  it('runs from near-white text at 0% to near-background text at 100%', () => {
    expect(fadeState(0).colour).toBe('#f3f3f3');
    expect(fadeState(100).colour).toBe('#2a2a2a');
  });

  it('crosses the thresholds in order as the text fades', () => {
    // Somewhere in the middle, large text still passes while body text has failed.
    const mixed = [...Array(101).keys()]
      .map(fadeState)
      .find((s) => s.results[1]!.passes && !s.results[0]!.passes);
    expect(mixed).toBeDefined();
  });

  it('phrases each result as a sentence', () => {
    expect(fadeState(75).results.map((r) => r.sentence)).toEqual([
      'Body text needs at least 4.5 : 1. This text has 2.78 : 1.',
      'Large text needs at least 3 : 1. This text has 2.78 : 1.',
      'Body text at AAA needs at least 7 : 1. This text has 2.78 : 1.',
    ]);
  });

  it('describes the state in one sentence for the live region', () => {
    expect(fadeState(75).announcement).toBe(
      '75% faded. Contrast ratio 2.78 : 1. Fails body text AA, fails large text AA, fails body text AAA.',
    );
  });
});

describe('the lab as the build writes it', () => {
  const html = renderToString(<FadeLab />);

  it('has a labelled slider at the default position with a screen-reader description', () => {
    expect(html).toMatch(/<label[^>]*for="[^"]+"[^>]*>.*Fade the text/);
    expect(html).toMatch(/type="range"/);
    expect(html).toMatch(/aria-describedby="[^"]+"/);
    expect(html).toContain('18% faded');
  });

  it('shows the ratio and the three results', () => {
    expect(html).toContain('11.94 : 1');
    expect(html.match(/Passes/g)).toHaveLength(3);
  });

  it('keeps the ratio output and results out of the live region, which starts empty', () => {
    expect(html).toMatch(/<output[^>]*aria-live="off"/);
    expect(html).toMatch(/<p[^>]*aria-live="polite"[^>]*><\/p>/);
  });
});

describe('on the 1.4.3 page', () => {
  it('is registered and listed on 1.4.3', () => {
    expect(labById('fade-text')?.title).toBe('Try it: fade the text');
    expect(criterion('1.4.3')?.labs).toContain('fade-text');
  });

  it('renders under "Try it yourself"', () => {
    const route = ROUTES.find((r) => r.num === '1.4.3')!;
    const html = render(route).html;
    expect(html).toContain('Try it yourself');
    expect(html).toContain('Try it: fade the text');
    expect(html).toContain('11.94 : 1');
  });
});
