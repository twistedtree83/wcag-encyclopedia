import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feedProblems } from '../src/blog/feed';
import { ROUTES } from '../src/site/routes';
import { open, whenReady } from './support/open';

/**
 * The blog (S-07): the index and each post page as built. The axe scan, the sitemap and the
 * canonical checks reach them through ROUTES like every other page; this covers what is the
 * blog's own. The post page's markup is unit-tested on the fixture post (tests/blogPage.test.tsx),
 * since the built site has no post until the launch posts land.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ASSETS = join(ROOT, 'dist/assets');
const POSTS = join(ROOT, 'src/blog/posts');

/**
 * Text that is in the build-time parser and nowhere in the site's own browser code: a Markdown
 * node type name from mdast-util-from-markdown, an error message from the YAML parser, and one
 * from src/blog/parse.ts.
 */
const PARSER_MARKS = [
  { mark: 'thematicBreak', in: 'node_modules/mdast-util-from-markdown/lib/index.js' },
  { mark: 'Implicit keys need to be on a single line', in: 'node_modules/yaml/dist/compose/resolve-block-map.js' },
  { mark: "a post's headings start at h2", in: 'src/blog/parse.ts' },
];

test.describe('the blog', () => {
  test('ships no Markdown or YAML parser code to the browser', () => {
    const scripts = readdirSync(ASSETS).filter((f) => f.endsWith('.js'));
    expect(scripts.length).toBeGreaterThan(0);
    for (const { mark, in: source } of PARSER_MARKS) {
      expect(readFileSync(join(ROOT, source), 'utf8'), `${source} no longer holds "${mark}"`).toContain(mark);
      for (const file of scripts) {
        expect(readFileSync(join(ASSETS, file), 'utf8').includes(mark), `${file} holds parser code ("${mark}")`).toBe(false);
      }
    }
  });

  test('the index is in the header nav, and lists every post', async ({ page }) => {
    await open(page, '/');
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(/\/blog\/$/);
    await whenReady(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Across the criteria');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' })).toHaveAttribute('aria-current', 'page');
    const posts = ROUTES.filter((r) => r.page === 'post');
    await expect(page.locator('.posts h2 a')).toHaveCount(posts.length);
    if (!posts.length) await expect(page.getByText('No posts yet.')).toBeVisible();
  });

  test('the 404 page’s “Read the blog” link reaches the index', async ({ page }) => {
    const missing = await page.goto('/no-such-page/');
    expect(missing?.status()).toBe(404);
    await whenReady(page);
    const [response] = await Promise.all([
      page.waitForResponse((r) => new URL(r.url()).pathname === '/blog/'),
      page.getByRole('main').getByRole('link', { name: 'Read the blog' }).click(),
    ]);
    expect(response.status()).toBe(200);
    await whenReady(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Across the criteria');
  });

  test('the feed is linked from the index head and served as well-formed Atom', async ({ page, request }) => {
    await open(page, '/blog/');
    const href = await page.locator('head link[rel="alternate"][type="application/atom+xml"]').getAttribute('href');
    expect(href).toBe('./feed.xml');
    const url = new URL(href!, page.url()).href;
    const response = await request.get(url);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/xml/);
    const xml = await response.text();
    expect(feedProblems(xml)).toEqual([]);
    // The browser's own XML parser: a feed that is not well formed gives a parsererror document.
    const parsed = await page.evaluate((text) => {
      const doc = new DOMParser().parseFromString(text, 'application/xml');
      const root = doc.documentElement;
      return { error: doc.getElementsByTagName('parsererror').length, root: root.localName, ns: root.namespaceURI, entries: doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry').length };
    }, xml);
    expect(parsed).toEqual({ error: 0, root: 'feed', ns: 'http://www.w3.org/2005/Atom', entries: ROUTES.filter((r) => r.page === 'post').length });
  });

  test('a criterion page shows "Further reading" only when a post discusses it', () => {
    const discussed = new Set(
      readdirSync(POSTS)
        .filter((f) => f.endsWith('.md'))
        .flatMap((f) => /^criteria:\s*\[([^\]]*)\]/m.exec(readFileSync(join(POSTS, f), 'utf8'))?.[1]?.split(',').map((n) => n.trim()) ?? []),
    );
    for (const route of ROUTES.filter((r) => r.page === 'criterion')) {
      const html = readFileSync(join(ROOT, 'dist', route.path, 'index.html'), 'utf8');
      expect(html.includes('id="reading-title"'), route.path).toBe(discussed.has(route.num!));
    }
  });

  for (const route of ROUTES.filter((r) => r.page === 'post')) {
    test(`${route.path} hydrates with its title, dates and Blog as the current section`, async ({ page }) => {
      await open(page, `/${route.path}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('.post__dates time').first()).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
      await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' })).toHaveAttribute('aria-current', 'page');
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '../');
    });
  }
});
