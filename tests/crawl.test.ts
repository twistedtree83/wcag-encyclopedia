import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  canonicalProblems,
  canonicalTag,
  pageSources,
  robotsTxt,
  sitemapProblems,
  sitemapXml,
} from '../src/site/crawl';
import { SITE_ORIGIN } from '../src/site/config';
import { ROUTES } from '../src/site/routes';

/**
 * The crawl files and the canonical tag (ADR 0006): the only places the site spells out an
 * absolute address, all built from SITE_ORIGIN. e2e/crawl.spec.ts runs the same checks over
 * the built site in dist/.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const page = (head: string) => `<!doctype html><html><head>${head}</head><body></body></html>`;

describe('SITE_ORIGIN', () => {
  it('is the bare production domain over HTTPS, with no trailing slash', () => {
    expect(SITE_ORIGIN).toBe('https://wcagencyclopedia.com');
  });
});

describe('the canonical tag', () => {
  it('is the origin joined to the route path, with its trailing slash', () => {
    expect(canonicalTag('criteria/1.4.3/')).toBe(
      '<link rel="canonical" href="https://wcagencyclopedia.com/criteria/1.4.3/" />',
    );
    expect(canonicalTag('')).toBe('<link rel="canonical" href="https://wcagencyclopedia.com/" />');
  });

  it('passes the ADR 0006 check on its own page', () => {
    for (const route of ROUTES) {
      expect(canonicalProblems(page(canonicalTag(route.path)), route.path)).toEqual([]);
    }
  });
});

describe('the ADR 0006 canonical check', () => {
  it('fails a relative canonical URL', () => {
    const problems = canonicalProblems(page('<link rel="canonical" href="../criteria/1.4.3/" />'), 'criteria/1.4.3/');
    expect(problems.join(' ')).toMatch(/does not start with https:\/\/wcagencyclopedia\.com/);
  });

  it('fails a root-relative canonical URL', () => {
    expect(canonicalProblems(page('<link rel="canonical" href="/criteria/1.4.3/" />'), 'criteria/1.4.3/')).not.toEqual([]);
  });

  it('fails a canonical URL that points at another route', () => {
    const problems = canonicalProblems(page(canonicalTag('criteria/1.4.11/')), 'criteria/1.4.3/');
    expect(problems.join(' ')).toMatch(/is not https:\/\/wcagencyclopedia\.com\/criteria\/1\.4\.3\//);
  });

  it('fails another host, plain HTTP, www and a missing trailing slash', () => {
    for (const href of [
      'https://example.com/criteria/1.4.3/',
      'http://wcagencyclopedia.com/criteria/1.4.3/',
      'https://www.wcagencyclopedia.com/criteria/1.4.3/',
      'https://wcagencyclopedia.com/criteria/1.4.3',
    ]) {
      expect(canonicalProblems(page(`<link rel="canonical" href="${href}" />`), 'criteria/1.4.3/'), href).not.toEqual([]);
    }
  });

  it('fails a page with no canonical tag, or with two', () => {
    expect(canonicalProblems(page(''), '')).toEqual(['no canonical tag']);
    expect(canonicalProblems(page(canonicalTag('') + canonicalTag('')), '')).toEqual(['2 canonical tags']);
  });

  it('finds the tag whatever the attribute order or quoting', () => {
    expect(canonicalProblems(page(`<link href='https://wcagencyclopedia.com/about/' rel='canonical'>`), 'about/')).toEqual([]);
  });
});

describe('robots.txt', () => {
  it('allows every crawler everywhere and points to the sitemap', () => {
    expect(robotsTxt()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://wcagencyclopedia.com/sitemap.xml\n',
    );
  });
});

describe('sitemap.xml', () => {
  const entries = [
    { path: '', lastmod: '2026-11-01' },
    { path: 'criteria/1.4.3/', lastmod: '2026-10-20' },
  ];

  it('lists each page at its absolute URL with its lastmod', () => {
    expect(sitemapXml(entries)).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        '    <loc>https://wcagencyclopedia.com/</loc>',
        '    <lastmod>2026-11-01</lastmod>',
        '  </url>',
        '  <url>',
        '    <loc>https://wcagencyclopedia.com/criteria/1.4.3/</loc>',
        '    <lastmod>2026-10-20</lastmod>',
        '  </url>',
        '</urlset>',
        '',
      ].join('\n'),
    );
  });

  it('passes the sitemaps.org schema check', () => {
    expect(sitemapProblems(sitemapXml(entries))).toEqual([]);
  });

  it('refuses a lastmod that is not a W3C date', () => {
    expect(() => sitemapXml([{ path: '', lastmod: '1 Nov 2026' }])).toThrow(/lastmod/);
  });

  describe('the schema check', () => {
    const ok = sitemapXml(entries);

    it('fails a wrong namespace', () => {
      expect(sitemapProblems(ok.replace('sitemaps.org/schemas/sitemap/0.9', 'example.com'))).not.toEqual([]);
    });

    it('fails a url with no loc, or a relative loc', () => {
      expect(sitemapProblems(ok.replace('    <loc>https://wcagencyclopedia.com/</loc>\n', ''))).not.toEqual([]);
      expect(sitemapProblems(ok.replace('<loc>https://wcagencyclopedia.com/</loc>', '<loc>/</loc>'))).not.toEqual([]);
    });

    it('fails a malformed lastmod and an element the schema does not allow', () => {
      expect(sitemapProblems(ok.replace('2026-11-01', '01/11/2026'))).not.toEqual([]);
      expect(sitemapProblems(ok.replace('</url>', '<title>Home</title></url>'))).not.toEqual([]);
    });

    it('fails a repeated loc and an unescaped ampersand', () => {
      expect(sitemapProblems(ok.replace('criteria/1.4.3/', ''))).not.toEqual([]);
      expect(sitemapProblems(ok.replace('criteria/1.4.3/', 'criteria/?a=1&b=2'))).not.toEqual([]);
    });
  });
});

describe('the files each page is built from', () => {
  it('names files that exist, for every route', () => {
    for (const route of ROUTES) {
      const files = pageSources(route);
      expect(files.length, route.path).toBeGreaterThan(0);
      for (const file of files) expect(existsSync(ROOT + file), `${route.path}: ${file}`).toBe(true);
    }
  });

  it('is the criterion record for a criterion page', () => {
    expect(pageSources({ path: 'criteria/1.4.3/', page: 'criterion', num: '1.4.3' })).toEqual(['src/criteria/g1-4.tsx']);
  });
});
