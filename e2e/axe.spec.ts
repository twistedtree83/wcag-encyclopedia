import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The axe scan.
 *
 * Catches what the unit tests structurally cannot: landmark and heading-order problems,
 * missing accessible names, ARIA misuse, and contrast as actually composited by the browser.
 *
 * Runs in both themes and at 320px. A page documenting WCAG that fails an automated WCAG
 * scan has no standing, so this gates the build.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * A page that teaches by showing failures contains failures. Elements marked
 * `data-depicts-failure` are the ones whose violation *is* the lesson — the low-contrast text
 * inside a 1.4.3 fail frame, for instance. Excluding them is not a way to quiet the scan:
 *
 *  - the exclusion is opt-in per element, never per component, so an accidental violation
 *    elsewhere in a fail frame is still caught (that is how the T-02 bug surfaced);
 *  - a separate test asserts every excluded element really does sit inside a FAIL frame;
 *  - and the colours they use are audited in the opposite direction by TOKEN_PAIRS, which
 *    asserts `expect: 'fail'` — so if one ever started passing, the build would break.
 */
async function scan(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page }).withTags(TAGS).exclude('[data-depicts-failure]').analyze();
}

for (const theme of ['light', 'dark'] as const) {
  test(`has no accessibility violations in the ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    const results = await scan(page);
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([]);
  });
}

test('has no accessibility violations at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  const results = await scan(page);
  expect(
    results.violations,
    results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
  ).toEqual([]);
});

test('does not scroll horizontally at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows, 'the page scrolls in two directions at 320px — fails 1.4.10').toBe(false);
});

test('puts a working skip link first in the tab order', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveText(/skip to content/i);
  await expect(focused).toHaveAttribute('href', '#main');
});

test('gives every interactive element a visible focus indicator', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[href]');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    await link.focus();
    const outlineWidth = await link.evaluate(
      (el) => getComputedStyle(el).outlineWidth,
    );
    expect(Number.parseFloat(outlineWidth), `link ${i} has no focus outline`).toBeGreaterThan(0);
  }
});

test('every deliberate failure sits inside a FAIL frame', async ({ page }) => {
  await page.goto('/');
  const marked = page.locator('[data-depicts-failure]');
  const count = await marked.count();
  expect(count, 'nothing is marked — the exclusion is unused and should be removed').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const insideFail = await marked.nth(i).evaluate((el) => !!el.closest('.frame--fail'));
    expect(insideFail, `excluded element ${i} is not inside a FAIL frame`).toBe(true);
  }
});
