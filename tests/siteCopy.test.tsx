import { describe, it, expect } from 'vitest';
import { render } from '../src/entry-server';
import { routeFor } from '../src/site/routes';

/**
 * The words the site uses to say what a success criterion is. The All criteria hero says it
 * before anything else, and Home and the footer say it the same way.
 */

const DEFINITION = 'the testable checks a web page has to pass';
const text = (s: string) => s.replace(/<[^>]+>/g, '').replaceAll('&#x27;', "'");
const page = (path: string) => render(routeFor(path)!).html;
const lede = (html: string) => text(html.match(/<p class="lede">(.*?)<\/p>/s)![1]!);
const footer = (html: string) => text(html.slice(html.indexOf('<footer')));

describe('what a success criterion is', () => {
  it('is said plainly on All criteria, before the one-sentence summaries', () => {
    const said = lede(page('criteria/'));
    expect(said).toMatch(/^These are the WCAG 2\.2 success criteria at Levels A and AA:/);
    expect(said).toContain(DEFINITION);
    expect(said.indexOf(DEFINITION)).toBeLessThan(said.indexOf('Each one in a sentence'));
  });

  it('is said the same way on Home and in the footer', () => {
    expect(lede(page(''))).toContain(`Level A and AA success criteria, ${DEFINITION}`);
    expect(footer(page(''))).toContain(`Level A and AA success criteria, ${DEFINITION}`);
  });

  it('shows each criterion broken and then fixed, in all three places', () => {
    expect(lede(page('criteria/'))).toContain('broken and then fixed');
    expect(lede(page(''))).toContain('broken and then fixed');
    expect(footer(page(''))).toContain('broken and then fixed');
  });
});
