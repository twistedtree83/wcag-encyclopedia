import { describe, it, expect } from 'vitest';
import { render, ROUTES, structuredData } from '../src/entry-server';
import { jsonLdProblems } from '../src/site/jsonLd';
import { routeFor } from '../src/site/routes';

/**
 * Structured data (docs/PRD-seo.md, S-04): the JSON-LD blocks each page carries in its head.
 * `structuredData(route, dates)` is what scripts/prerender.mjs writes; `jsonLdProblems` is the
 * check it runs on every page, and e2e/crawl.spec.ts runs it again over dist/.
 */

const DATES = { published: '2025-06-01', modified: '2025-09-15' };
const ORIGIN = 'https://wcagencyclopedia.com';

/** The parsed blocks of one page's JSON-LD markup. */
function blocks(markup: string): Record<string, any>[] {
  return [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1]!),
  );
}
const byType = (markup: string, type: string) => blocks(markup).filter((b) => b['@type'] === type);
const route = (path: string) => routeFor(path)!;

describe('home', () => {
  const home = structuredData(route(''), DATES);

  it('carries exactly a WebSite and an Organization, and no breadcrumb', () => {
    expect(blocks(home).map((b) => b['@type']).sort()).toEqual(['Organization', 'WebSite']);
    for (const block of blocks(home)) expect(block['@context']).toBe('https://schema.org');
  });

  it('names the site and the organisation, at the home address', () => {
    const [site] = byType(home, 'WebSite');
    const [org] = byType(home, 'Organization');
    expect(site).toMatchObject({ name: 'WCAG Encyclopedia', url: `${ORIGIN}/` });
    expect(org).toMatchObject({ name: 'WCAG Encyclopedia', url: `${ORIGIN}/` });
  });

  it('has a SearchAction into the All criteria search, which reads ?q=', () => {
    const [site] = byType(home, 'WebSite');
    expect(site!.potentialAction).toEqual({
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${ORIGIN}/criteria/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    });
  });
});

describe('fixed pages below home', () => {
  it.each([
    ['criteria/', 'Criteria'],
    ['colour-check/', 'Colour check'],
    ['about/', 'About'],
  ])('%s carries only a BreadcrumbList: Home, then the page', (path, name) => {
    const markup = structuredData(route(path), DATES);
    expect(blocks(markup).map((b) => b['@type'])).toEqual(['BreadcrumbList']);
    expect(byType(markup, 'BreadcrumbList')[0]!.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name, item: `${ORIGIN}/${path}` },
    ]);
  });
});

describe('criterion pages', () => {
  const markup = structuredData(route('criteria/1.4.3/'), DATES);

  it('carry a BreadcrumbList and a TechArticle', () => {
    expect(blocks(markup).map((b) => b['@type'])).toEqual(['BreadcrumbList', 'TechArticle']);
  });

  it('give the TechArticle its headline, the criterion it is about, its dates and the organisation', () => {
    const [article] = byType(markup, 'TechArticle');
    const org = { '@type': 'Organization', name: 'WCAG Encyclopedia', url: `${ORIGIN}/` };
    expect(article).toMatchObject({
      headline: '1.4.3 Contrast (Minimum)',
      url: `${ORIGIN}/criteria/1.4.3/`,
      mainEntityOfPage: `${ORIGIN}/criteria/1.4.3/`,
      datePublished: '2025-06-01',
      dateModified: '2025-09-15',
      inLanguage: 'en',
      author: org,
      publisher: org,
      about: {
        '@type': 'DefinedTerm',
        name: '1.4.3 Contrast (Minimum)',
        termCode: '1.4.3',
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'WCAG 2.2 success criteria' },
      },
    });
    expect(typeof article!.description).toBe('string');
  });

  it('match the visible breadcrumb trail, name for name and address for address', () => {
    for (const r of ROUTES.filter((x) => x.page === 'criterion')) {
      const html = render(r).html;
      const nav = /<nav class="trail" aria-label="Breadcrumb">([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
      const own = `${ORIGIN}/${r.path}`;
      const visible = [...nav.matchAll(/<li>(?:<a href="([^"]*)">|<span aria-current="page">)([^<]*)<\/(?:a|span)><\/li>/g)].map(
        ([, href, name]) => ({ name, item: href === undefined ? own : new URL(href, own).href }),
      );
      const crumbs = byType(structuredData(r, DATES), 'BreadcrumbList')[0]!.itemListElement.map(
        ({ name, item }: { name: string; item: string }) => ({ name, item }),
      );
      expect(visible.length, r.path).toBe(3);
      expect(crumbs, r.path).toEqual(visible);
    }
  });
});

describe('every page', () => {
  it('passes the structured data check, and every block parses', () => {
    for (const r of ROUTES) expect(jsonLdProblems(structuredData(r, DATES), r), r.path || 'home').toEqual([]);
  });

  it('escapes < so no text can close the script element', () => {
    for (const r of ROUTES) {
      for (const [, body = ''] of structuredData(r, DATES).matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
        expect(body).not.toContain('<');
      }
    }
  });
});

describe('the structured data check', () => {
  const home = route('');
  const article = route('criteria/1.4.3/');
  const good = structuredData(article, DATES);
  const swap = (from: string, to: string) => good.replace(from, to);

  it('fails a block that does not parse', () => {
    expect(jsonLdProblems(good.replace('{"@context"', '{"@context",'), article).join(' ')).toMatch(/does not parse/);
  });

  it('fails a page kind missing a block it needs, or carrying one it should not', () => {
    const homeOnly = structuredData(home, DATES);
    expect(jsonLdProblems(homeOnly, article).join(' ')).toMatch(/TechArticle/);
    expect(jsonLdProblems(good, home).join(' ')).toMatch(/BreadcrumbList/);
  });

  it('fails a missing required property', () => {
    expect(jsonLdProblems(swap('"datePublished"', '"datePublishedX"'), article).join(' ')).toMatch(/datePublished/);
    expect(jsonLdProblems(swap('"headline"', '"headlineX"'), article).join(' ')).toMatch(/headline/);
  });

  it('fails an about that does not name the criterion', () => {
    expect(jsonLdProblems(swap('"termCode":"1.4.3"', '"termCode":"1.4.11"'), article).join(' ')).toMatch(/about/);
  });

  it('fails a relative URL, another host, and a URL for another route', () => {
    expect(jsonLdProblems(swap(`"url":"${ORIGIN}/criteria/1.4.3/"`, '"url":"../1.4.3/"'), article).join(' ')).toMatch(
      /does not start with https:\/\/wcagencyclopedia\.com/,
    );
    expect(jsonLdProblems(swap(`"item":"${ORIGIN}/"`, '"item":"https://example.com/"'), article).join(' ')).toMatch(
      /example\.com/,
    );
    expect(
      jsonLdProblems(swap(`"url":"${ORIGIN}/criteria/1.4.3/"`, `"url":"${ORIGIN}/criteria/1.4.11/"`), article).join(' '),
    ).toMatch(/1\.4\.11/);
  });
});
