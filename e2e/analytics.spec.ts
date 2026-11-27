import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES } from '../src/site/routes';
import { CF_ANALYTICS_TOKEN } from '../src/site/config';
import { open } from './support/open';

/**
 * Cloudflare Web Analytics (docs/PRD-seo.md, S-06) is off until `CF_ANALYTICS_TOKEN` is set in
 * src/site/config.ts. This reads the built site in dist/, like e2e/fonts.spec.ts. The set case,
 * one beacon per page, is in tests/analytics.test.ts.
 */

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

test.describe('analytics', () => {
  test('every built page has one beacon when the token is set, and no cloudflareinsights while unset', () => {
    for (const route of ROUTES) {
      const html = readFileSync(join(DIST, route.path, 'index.html'), 'utf8');
      expect(html.split('cloudflareinsights').length - 1, `/${route.path}`).toBe(
        CF_ANALYTICS_TOKEN === undefined ? 0 : 1,
      );
    }
  });

  test('a page sets no cookie and shows no consent banner', async ({ page, context }) => {
    for (const path of ['/', '/criteria/1.4.3/']) {
      await open(page, path);
      expect(await context.cookies(), path).toEqual([]);
      await expect(page.getByText(/cookie|consent/i), path).toHaveCount(0);
    }
  });
});
