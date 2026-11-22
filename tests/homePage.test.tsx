import { describe, it, expect } from 'vitest';
import { render, ROUTES } from '../src/entry-server';
import { routeFor } from '../src/site/routes';

/**
 * Home as the build writes it (design guide §9.1): the static HTML a reader gets before any
 * script runs. Eight sections in order, every count taken from the corpus.
 */

const home = () => render(routeFor('')!);
const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const text = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
const h2s = (html: string) =>
  [...main(html).matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => text(m[1]!));

describe('the home route', () => {
  it('is published at the site root as the home page', () => {
    expect(ROUTES).toContainEqual({ path: '', page: 'home' });
  });

  it('carries the old #number redirect in its head, and no other page does', () => {
    expect(home().head).toContain('location.replace');
    expect(home().head).toContain('"1.4.3"');
    for (const route of ROUTES.filter((r) => r.page !== 'home')) {
      expect(render(route).head, route.path).toBe('');
    }
  });

  it('has a title and a description', () => {
    expect(home().title).toMatch(/WCAG Encyclopedia/);
    expect(home().description).toMatch(/55/);
  });
});

describe('the home page', () => {
  it('has one h1, the hero headline', () => {
    const html = main(home().html);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(text(html.match(/<h1[^>]*>(.*?)<\/h1>/)![1]!)).toBe(
      'Accessibility that holds up for everyone.',
    );
  });

  it('renders the eight sections in order, the lab retitled', () => {
    expect(h2s(home().html)).toEqual([
      'Check a colour pair',
      'Done well, done badly',
      'Four principles',
      'The index',
      'Try it: fade the text',
      'Three contrast thresholds',
      'New in 2.2',
      'This site meets the criteria it explains.',
    ]);
  });

  it('gives the hero stats from the corpus', () => {
    const stats = text(main(home().html).match(/<ul class="mini"[^>]*>(.*?)<\/ul>/)![1]!);
    expect(stats).toBe('55criteria31at Level A24at Level AA6new in 2.2');
  });

  it('links the primary call to action to All criteria and the secondary to the pairs', () => {
    const html = main(home().html);
    expect(html).toMatch(/<a class="btn p" href="criteria\/">Browse all 55 criteria/);
    expect(html).toMatch(/<a class="btn o" href="#pairs">See it done badly<\/a>/);
  });

  it('makes each principle card one link to All criteria filtered to it, with its shape', () => {
    const cards = [...main(home().html).matchAll(/<li><a href="([^"]+)" class="pc p(\d)">(.*?)<\/a><\/li>/g)];
    expect(cards.map((c) => c[1])).toEqual([
      'criteria/?p=1',
      'criteria/?p=2',
      'criteria/?p=3',
      'criteria/?p=4',
    ]);
    const counts = cards.map((c) => text(c[3]!.match(/<span class="ct">(.*?)<\/span>/)![1]!));
    expect(counts).toEqual(['20 criteria', '20 criteria', '13 criteria', '2 criteria']);
    for (const card of cards) expect(card[3]).toContain('class="shape"');
  });

  it('shows six index cards and a link to all 55', () => {
    const html = main(home().html);
    const index = html.slice(html.indexOf('id="index"'), html.indexOf('id="lab"'));
    expect(index.match(/<li><a class="surf"/g)).toHaveLength(6);
    expect(index).toContain('Showing 6 of 55 criteria.');
    expect(index).toMatch(/<a class="btn o" href="criteria\/">See all 55 criteria<\/a>/);
  });

  it('lists the six criteria new in 2.2, each linking to its page', () => {
    const html = main(home().html);
    const news = html.slice(html.indexOf('class="news"'));
    const links = [...news.matchAll(/<a href="(criteria\/[^"]+)"/g)].map((m) => m[1]);
    expect(links).toEqual([
      'criteria/2.4.11/',
      'criteria/2.5.7/',
      'criteria/2.5.8/',
      'criteria/3.2.6/',
      'criteria/3.3.7/',
      'criteria/3.3.8/',
    ]);
  });

  it('calls the contrast requirements thresholds, never rules', () => {
    const html = text(main(home().html));
    expect(html).toContain('Three contrast thresholds');
    expect(html).not.toMatch(/contrast rules/i);
    for (const ratio of ['4.5 : 1', '7 : 1', '3 : 1']) expect(html).toContain(ratio);
  });

  it('labels the 1.4.6 threshold AAA and outside the index, and never links to it', () => {
    const t = text(main(home().html));
    expect(t).toContain('1.4.6 · Level AAA, not in the index');
    expect(home().html).not.toContain('criteria/1.4.6/');
  });

  it('marks Home current in the main nav', () => {
    expect(home().html).toMatch(/<a href="\.\/" aria-current="page">Home<\/a>/);
  });
});
