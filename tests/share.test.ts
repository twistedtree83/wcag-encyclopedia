import { describe, it, expect } from 'vitest';
import { openGraphProblems } from '../src/site/crawl';
import { ROUTES, routeFor } from '../src/site/routes';
import { pageMeta } from '../src/site/Site';
import { cardContrastProblems, shareCard, shareTags, type CardNode } from '../src/site/share';

/**
 * Open Graph and Twitter tags and the share cards they point at (S-03, ADR 0006).
 * e2e/share.spec.ts checks the built pages and the PNGs in dist/.
 */

const page = (head: string) => `<!doctype html><html><head>${head}</head><body></body></html>`;
const route = (path: string) => {
  const r = routeFor(path);
  if (!r) throw new Error(`no route ${path}`);
  return r;
};
const meta = (html: string, key: string) =>
  [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((tag) => tag.includes(`"${key}"`))
    .map((tag) => /content="([^"]*)"/.exec(tag)?.[1])
    .map((value) =>
      value?.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'),
    );

describe('the share tags', () => {
  it('pass the Open Graph check on every route', () => {
    for (const r of ROUTES) {
      expect(openGraphProblems(page(shareTags(r)), r.path), r.path || 'home').toEqual([]);
    }
  });

  it('reuse the page title and description', () => {
    for (const r of ROUTES) {
      const html = shareTags(r);
      const { title, description } = pageMeta(r);
      expect(meta(html, 'og:title')).toEqual([title]);
      expect(meta(html, 'og:description')).toEqual([description]);
    }
  });

  it('point a criterion page at its own card and the fixed pages at the site card', () => {
    const c = shareTags(route('criteria/1.4.3/'));
    expect(meta(c, 'og:image')).toEqual(['https://wcagencyclopedia.com/share/1.4.3.png']);
    expect(meta(c, 'og:type')).toEqual(['article']);
    expect(meta(c, 'og:url')).toEqual(['https://wcagencyclopedia.com/criteria/1.4.3/']);
    for (const path of ['', 'criteria/', 'about/', 'colour-check/']) {
      const html = shareTags(route(path));
      expect(meta(html, 'og:image')).toEqual(['https://wcagencyclopedia.com/share/site.png']);
      expect(meta(html, 'og:type')).toEqual(['website']);
    }
  });

  it('describe the card in og:image:alt and twitter:image:alt', () => {
    const c = shareTags(route('criteria/1.4.3/'));
    const alt = 'Share card: 1.4.3 Contrast (Minimum), Level AA, under the Perceivable principle of WCAG 2.2';
    expect(meta(c, 'og:image:alt')).toEqual([alt]);
    expect(meta(c, 'twitter:image:alt')).toEqual([alt]);
    expect(meta(c, 'twitter:card')).toEqual(['summary_large_image']);
    expect(meta(c, 'og:site_name')).toEqual(['WCAG Encyclopedia']);
    expect(meta(c, 'og:image:width')).toEqual(['1200']);
    expect(meta(c, 'og:image:height')).toEqual(['630']);
  });
});

describe('the Open Graph check', () => {
  const good = shareTags(route('criteria/1.4.3/'));

  it('fails a relative og:url and one that names another route', () => {
    const relative = good.replace('content="https://wcagencyclopedia.com/criteria/1.4.3/"', 'content="../criteria/1.4.3/"');
    expect(openGraphProblems(page(relative), 'criteria/1.4.3/').join(' ')).toMatch(/og:url/);
    expect(openGraphProblems(page(good), 'criteria/1.4.11/').join(' ')).toMatch(/og:url/);
  });

  it('fails an og:image outside the site origin, or not a PNG under share/', () => {
    const other = good.replace('https://wcagencyclopedia.com/share/1.4.3.png', 'https://example.com/share/1.4.3.png');
    expect(openGraphProblems(page(other), 'criteria/1.4.3/').join(' ')).toMatch(/og:image/);
    const jpg = good.replace('share/1.4.3.png', 'share/1.4.3.jpg');
    expect(openGraphProblems(page(jpg), 'criteria/1.4.3/').join(' ')).toMatch(/og:image/);
  });

  it('fails a missing or empty og:image:alt, a missing tag and a doubled tag', () => {
    const noAlt = good.replace(/<meta property="og:image:alt"[^>]*>/, '');
    expect(openGraphProblems(page(noAlt), 'criteria/1.4.3/').join(' ')).toMatch(/og:image:alt/);
    const emptyAlt = good.replace(/(property="og:image:alt" content=")[^"]*/, '$1');
    expect(openGraphProblems(page(emptyAlt), 'criteria/1.4.3/').join(' ')).toMatch(/og:image:alt/);
    const noCard = good.replace(/<meta name="twitter:card"[^>]*>/, '');
    expect(openGraphProblems(page(noCard), 'criteria/1.4.3/').join(' ')).toMatch(/twitter:card/);
    expect(openGraphProblems(page(good + good), 'criteria/1.4.3/').join(' ')).toMatch(/2 og:title/);
  });
});

describe('the share cards', () => {
  it('are one site card, one card per criterion and one per post', () => {
    const files = new Set(ROUTES.map((r) => shareCard(r).file));
    const own = ROUTES.filter((r) => r.page === 'criterion' || r.page === 'post').length;
    expect(files.size).toBe(1 + own);
    expect(shareCard(route('')).file).toBe('share/site.png');
    expect(shareCard(route('criteria/2.4.11/')).file).toBe('share/2.4.11.png');
  });

  it('show the criterion number, name, level and principle', () => {
    const text = (node: CardNode | string): string =>
      typeof node === 'string' ? node : node.children.map(text).join(' ');
    const card = text(shareCard(route('criteria/1.4.3/')).tree);
    for (const words of ['1.4.3', 'Contrast (Minimum)', 'Level AA', 'Perceivable', 'WCAG Encyclopedia']) {
      expect(card).toContain(words);
    }
    expect(text(shareCard(route('criteria/3.3.8/')).tree)).toContain('Understandable');
  });

  it('meet 4.5:1 for every piece of text, by the contrast engine', () => {
    for (const r of ROUTES) {
      expect(cardContrastProblems(shareCard(r).tree), r.path || 'home').toEqual([]);
    }
  });

  it('a contrast check that fails low-contrast text and text with no background', () => {
    const weak: CardNode = {
      type: 'div',
      style: { backgroundColor: '#2A2B2D', color: '#575751' },
      children: ['Faint words'],
    };
    expect(cardContrastProblems(weak).join(' ')).toMatch(/Faint words.*below 4\.5/);
    const bare: CardNode = { type: 'div', style: { color: '#FFFFFF' }, children: ['Floating'] };
    expect(cardContrastProblems(bare).join(' ')).toMatch(/Floating/);
  });
});
