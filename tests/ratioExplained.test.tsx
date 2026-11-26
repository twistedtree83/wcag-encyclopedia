import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, ROUTES } from '../src/entry-server';
import { criterionPath, PATHS } from '../src/site/routes';
import { RATIO_MARKS, ratioPosition, scaleSentence } from '../src/labs/shared/ratioScale';
import { THRESHOLD_CHECKS, checkSentence } from '../src/labs/shared/thresholds';
import { RatioExplained } from '../src/labs/shared/RatioExplained';

/**
 * What a contrast ratio means, said next to every ratio the contrast labs show: a plain
 * explanation, why the thresholds differ, a 1 to 21 scale with the current ratio on it, and each
 * check phrased as a sentence.
 */

const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ');
const pageAt = (path: string) => main(render(ROUTES.find((r) => r.path === path)!).html);

describe('each check as a sentence', () => {
  it('says what the threshold needs, then what the pair has', () => {
    const [body, large, aaa, ui] = THRESHOLD_CHECKS;
    expect(checkSentence(body!, 2.845, 'This pair has')).toBe(
      'Body text needs at least 4.5 : 1. This pair has 2.84 : 1.',
    );
    expect(checkSentence(large!, 2.845, 'This pair has')).toBe(
      'Large text needs at least 3 : 1. This pair has 2.84 : 1.',
    );
    expect(checkSentence(aaa!, 11.74, 'This pair has')).toBe(
      'Body text at AAA needs at least 7 : 1. This pair has 11.74 : 1.',
    );
    expect(checkSentence(ui!, 1.3, 'These edges have')).toBe(
      'Borders and icons need at least 3 : 1. These edges have 1.30 : 1.',
    );
  });
});

describe('the 1 to 21 scale', () => {
  it('marks the three thresholds', () => {
    expect(RATIO_MARKS).toEqual([3, 4.5, 7]);
  });

  it('runs from 1 : 1 at the left end to 21 : 1 at the right', () => {
    expect(ratioPosition(1)).toBe(0);
    expect(ratioPosition(21)).toBeCloseTo(100);
    expect(ratioPosition(3)).toBeLessThan(ratioPosition(4.5));
    expect(ratioPosition(4.5)).toBeLessThan(ratioPosition(7));
  });

  it('says in words where the ratio sits, truncating so 4.499 is not 4.5', () => {
    expect(scaleSentence(2.84)).toBe(
      'On the scale from 1 : 1 to 21 : 1, 2.84 : 1 is below 3 : 1: too low for text, borders or icons.',
    );
    expect(scaleSentence(4.499)).toContain('4.49 : 1 is between 3 : 1 and 4.5 : 1');
    expect(scaleSentence(4.5)).toContain('between 4.5 : 1 and 7 : 1');
    expect(scaleSentence(11.74)).toContain('at or above 7 : 1');
  });
});

describe('the explanation', () => {
  const html = renderToStaticMarkup(<RatioExplained ratio={2.845} />);

  it('says what the ratio compares and what its ends mean', () => {
    const t = text(html);
    expect(t).toContain('compares how bright the two colours are');
    expect(t).toContain('1 : 1 means the colours are identical');
    expect(t).toContain('21 : 1 is black on white');
    expect(t).toContain('The higher the number, the easier it is to read');
  });

  it('says why the thresholds differ, and what large means', () => {
    const t = text(html);
    expect(t).toContain('Body text needs 4.5 : 1');
    expect(t).toContain('Large text needs 3 : 1');
    expect(t).toContain('at least 24px, or 18.66px and bold');
    expect(t).toContain('needs 7 : 1');
    expect(t).toContain('Borders and icons need 3 : 1');
  });

  it('draws the scale for sighted readers and says it in words for everyone', () => {
    expect(html).toMatch(/<div class="ratio-scale__bar" aria-hidden="true">/);
    expect(text(html)).toContain('2.84 : 1 is below 3 : 1');
  });
});

describe('where it is shown', () => {
  it('on the Colour check page, with the thresholds open', () => {
    const m = pageAt(PATHS.colourCheck);
    expect(m).toMatch(/<details class="ratio-why" open="">/);
    expect(text(m)).toContain('Body text needs at least 4.5 : 1. This pair has 11.74 : 1.');
    expect(text(m)).not.toContain('Threshold 4.5 : 1');
  });

  it('in each contrast lab on 1.4.3 and 1.4.11', () => {
    const p143 = pageAt(criterionPath('1.4.3'));
    expect(p143.match(/class="ratio-x"/g)).toHaveLength(2);
    expect(text(p143)).toContain('This pair has');
    expect(text(p143)).toContain('Body text needs at least 4.5 : 1. This text has');
    const p1411 = pageAt(criterionPath('1.4.11'));
    expect(p1411.match(/class="ratio-x"/g)).toHaveLength(2);
    expect(text(p1411)).toContain('Borders and icons need at least 3 : 1. These edges have');
  });

  it('in the measured badges on the 1.4.3 and 1.4.11 examples', () => {
    expect(text(pageAt(criterionPath('1.4.3')))).toMatch(
      /Body text needs at least 4\.5:1\. This text has \d+\.\d:1\./,
    );
    expect(text(pageAt(criterionPath('1.4.11')))).toMatch(
      /Borders need at least 3:1\. This border has \d+\.\d:1\./,
    );
  });
});
