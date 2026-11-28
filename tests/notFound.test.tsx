import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NOT_FOUND, render, ROUTES } from '../src/entry-server';
import { jsonLdBlocks } from '../src/site/jsonLd';
import { routeFor } from '../src/site/routes';

/**
 * The 404 page (S-05): pre-rendered once to `dist/404.html` and served by Cloudflare for any
 * path that matches no asset. e2e/not-found.spec.ts checks the status and the page in a browser.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));

describe('the 404 page', () => {
  const page = render(NOT_FOUND);

  it('is in the site shell, headed "Page not found"', () => {
    expect(page.html).toContain('<main id="main">');
    expect(page.html).toMatch(/<h1[^>]*>Page not found<\/h1>/);
    expect(page.title).toBe('Page not found: WCAG Encyclopedia');
  });

  it('links to home, all criteria and the blog with root-absolute hrefs, since it is served at any depth', () => {
    expect(page.html).toContain('href="/"');
    expect(page.html).toContain('href="/criteria/"');
    expect(page.html).toContain('href="/blog/"');
    expect(page.html).not.toMatch(/href="\.\.?\//);
  });

  it('asks search engines not to index it', () => {
    expect(page.head).toContain('<meta name="robots" content="noindex" />');
  });

  it('has no share tags or structured data, since it has no address of its own', () => {
    expect(page.share).toBe('');
    expect(jsonLdBlocks({ route: NOT_FOUND, trail: [], headline: page.title, description: page.description, published: '2026-01-01', modified: '2026-01-01' })).toEqual([]);
  });

  it('is not a route, so it is not in the sitemap or the per-route checks', () => {
    expect(ROUTES.some((r) => r.page === 'not-found')).toBe(false);
    expect(ROUTES.some((r) => r.path === NOT_FOUND.path)).toBe(false);
  });

  it('hydrates from its data-route like any page', () => {
    expect(routeFor(NOT_FOUND.path)).toBe(NOT_FOUND);
  });

  it('is what Cloudflare serves, with status 404, for a path that matches no asset', () => {
    const config = readFileSync(`${ROOT}/wrangler.jsonc`, 'utf8');
    expect(config).toMatch(/"not_found_handling":\s*"404-page"/);
    expect(NOT_FOUND.path).toBe('404.html');
  });
});
