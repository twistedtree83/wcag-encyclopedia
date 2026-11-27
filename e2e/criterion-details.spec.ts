import { test, expect } from '@playwright/test';
import { open } from './support/open';

/**
 * The markup diff and the measured contrast badges, on criterion pages. These tests used to
 * run against the old single page (navigation.spec.ts, retired in R-08 when Home replaced it);
 * the behaviour they guard lives on in the criterion pages, so they moved here unchanged.
 */

/** A criterion with a markup diff, and the one with measured contrast badges. */
const DIFF_PAGE = '/criteria/1.1.1/';
const BADGE_PAGE = '/criteria/1.4.3/';

test('renders a markup diff whose changed lines are marked with glyphs, not colour alone', async ({
  page,
}) => {
  await open(page, DIFF_PAGE);
  const diff = page.locator('.diff').first();
  await expect(diff).toBeVisible();

  // The gutter glyph must be real text, so the diff survives colour being removed.
  const gutters = await diff.locator('.diff__gutter').allTextContents();
  expect(gutters).toContain('-');
  expect(gutters).toContain('+');

  // And every change must be announced to screen readers, not shown only as a tint.
  await expect(diff.locator('.diff__line--del .visually-hidden').first()).toHaveText('removed: ');
  await expect(diff.locator('.diff__line--add .visually-hidden').first()).toHaveText('added: ');
  const dels = await diff.locator('.diff__line--del').count();
  expect(await diff.locator('.diff__line--del .visually-hidden').count()).toBe(dels);
});

test('a long diff line scrolls inside the diff, not the page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await open(page, DIFF_PAGE);
  const scrollable = await page
    .locator('.diff__pre')
    .first()
    .evaluate((el) => getComputedStyle(el).overflowX);
  expect(scrollable).toBe('auto');

  const pageOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(pageOverflows).toBe(false);
});

test('lets a keyboard user reach and scroll the diff', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await open(page, DIFF_PAGE);
  const pre = page.locator('.diff__pre').first();
  // A scrollable region a keyboard user cannot focus is a region they cannot read: 2.1.1.
  await expect(pre).toHaveAttribute('tabindex', '0');
  await pre.focus();
  const outline = await pre.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(Number.parseFloat(outline)).toBeGreaterThan(0);
});

test('measured contrast badges are computed from the live palette, per theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page, BADGE_PAGE);

  // Both themes' badges are in the markup and the token cascade hides the inactive one.
  const fail = page.locator('.measured--fail:visible').first();
  const pass = page.locator('.measured--pass:visible').first();
  await expect(fail).toBeVisible();
  await expect(pass).toBeVisible();

  const lightFail = await fail.textContent();
  const lightPass = await pass.textContent();
  // A ratio is shown, and it is on the correct side of the threshold it names.
  expect(lightFail).toMatch(/\d+\.\d:1/);
  expect(lightPass).toMatch(/\d+\.\d:1/);
  // Each badge is a sentence: what the threshold needs, then what this example has.
  expect(lightFail).toMatch(/needs at least 4\.5:1\. This text has \d+\.\d:1\./);
  expect(lightPass).toMatch(/needs at least 4\.5:1\. This text has \d+\.\d:1\./);

  // The dark palette uses different colours, so a computed badge reports different numbers.
  // A hand-typed ratio would be identical in both themes.
  await page.emulateMedia({ colorScheme: 'dark' });
  await open(page, BADGE_PAGE);
  expect(await page.locator('.measured--fail:visible').first().textContent()).not.toBe(lightFail);
  expect(await page.locator('.measured--pass:visible').first().textContent()).not.toBe(lightPass);
});

test('the measured badge states pass or fail without relying on hue', async ({ page }) => {
  await open(page, BADGE_PAGE);
  await expect(page.locator('.measured--fail').first()).toContainText('✕');
  await expect(page.locator('.measured--pass').first()).toContainText('✓');
  await expect(page.locator('.measured--fail .visually-hidden').first()).toHaveText('Fails: ');
  await expect(page.locator('.measured--pass .visually-hidden').first()).toHaveText('Passes: ');
});
