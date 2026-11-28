import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODES, SITE_TAGS } from './labs/support';
import { whenReady } from './support/open';

/**
 * The 404 page (S-05). Any path that matches no built file gets `dist/404.html` with status
 * 404: on Cloudflare through `not_found_handling` in wrangler.jsonc, and in `vite preview`
 * through the same rule in vite.config.ts. It is served at whatever depth was asked for, so
 * its assets and links are root-absolute.
 */

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

/** Unknown paths at the root, below a real section, and several levels deep. */
const UNKNOWN = ['/no-such-page/', '/criteria/9.9.9/', '/criteria/1.4.3/extra/deep/'];

async function openMissing(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} should be not found`).toBe(404);
  await whenReady(page);
}

test.describe('the 404 page', () => {
  for (const url of UNKNOWN) {
    test(`${url} returns status 404 with the page in the site shell`, async ({ page }) => {
      await openMissing(page, url);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
      await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      // The stylesheet loaded at this depth: the shell is styled, not browser defaults.
      const styled = await page.evaluate(() => document.styleSheets.length > 0 && getComputedStyle(document.body).fontFamily.includes('Onest'));
      expect(styled, 'the stylesheet did not load at this depth').toBe(true);
    });
  }

  test('links to home, all criteria and the blog, from any depth', async ({ page }) => {
    await openMissing(page, '/criteria/9.9.9/');
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    await expect(main.getByRole('link', { name: 'Browse all 55 criteria' })).toHaveAttribute('href', '/criteria/');
    await expect(main.getByRole('link', { name: 'Read the blog' })).toHaveAttribute('href', '/blog/');
    await main.getByRole('link', { name: 'Browse all 55 criteria' }).click();
    await expect(page).toHaveURL(/\/criteria\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('is noindex, has no canonical, share tags or JSON-LD, and is not in the sitemap', async ({ page }) => {
    await openMissing(page, '/no-such-page/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]')).toHaveCount(0);
    const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
    expect(sitemap).not.toContain('404');
    expect(sitemap).not.toContain('not-found');
  });

  for (const mode of MODES) {
    test(`has no accessibility violations (${mode.name})`, async ({ page }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await openMissing(page, '/criteria/9.9.9/');
      const results = await new AxeBuilder({ page }).withTags(SITE_TAGS).analyze();
      expect(results.violations, results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([]);
    });
  }

  test('hydrates without errors and gives every link and button a visible focus indicator', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await openMissing(page, '/criteria/9.9.9/');
    // The page's own 404 status is logged as a failed load; anything else is a real error.
    expect(errors.filter((e) => !e.includes('404'))).toEqual([]);
    const controls = page.locator('a[href], button');
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await controls.nth(i).focus();
      const outline = await controls.nth(i).evaluate((el) => getComputedStyle(el).outlineWidth);
      expect(Number.parseFloat(outline), `control ${i} has no focus outline`).toBeGreaterThan(0);
    }
  });

  test('does not scroll horizontally at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openMissing(page, '/no-such-page/');
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflows).toBe(false);
  });
});
