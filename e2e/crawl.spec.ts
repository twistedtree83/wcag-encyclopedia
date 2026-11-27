import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { absoluteUrl, canonicalProblems, robotsTxt, sitemapProblems } from '../src/site/crawl';
import { jsonLdProblems } from '../src/site/jsonLd';
import { ROUTES } from '../src/site/routes';

/**
 * The crawl files and canonical tags in the built site (ADR 0006), read from dist/ like
 * e2e/fonts.spec.ts. tests/crawl.test.ts shows each check fails on a bad input.
 */

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const read = (file: string) => readFileSync(join(DIST, file), 'utf8');

test.describe('crawl files', () => {
  test('every built page has one canonical tag, its own absolute URL', () => {
    for (const route of ROUTES) {
      expect(canonicalProblems(read(join(route.path, 'index.html')), route.path), route.path || 'home').toEqual([]);
    }
  });

  test('every built page carries the JSON-LD its kind needs, all parsing, all on SITE_ORIGIN', () => {
    for (const route of ROUTES) {
      expect(jsonLdProblems(read(join(route.path, 'index.html')), route), route.path || 'home').toEqual([]);
    }
  });

  test('sitemap.xml passes the schema check and lists exactly the routes', () => {
    const xml = read('sitemap.xml');
    expect(sitemapProblems(xml)).toEqual([]);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(ROUTES.map((r) => absoluteUrl(r.path)));
  });

  test('every sitemap lastmod is a real date no later than today', () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const [, lastmod = ''] of read('sitemap.xml').matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
      expect(lastmod >= '2025-01-01' && lastmod <= today, lastmod).toBe(true);
    }
  });

  test('robots.txt allows all and points to the sitemap', () => {
    expect(read('robots.txt')).toBe(robotsTxt());
  });
});
