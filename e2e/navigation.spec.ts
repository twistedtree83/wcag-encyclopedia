import { test, expect } from '@playwright/test';

/**
 * The shell's navigation contract: every link the page offers resolves to something real,
 * the heading hierarchy is honest, and a deep-linked card clears the sticky masthead.
 */

/** Guideline fragments contain dots, which are class syntax in a CSS selector. */
const byId = (href: string) => `[id="${href.replace(/^#/, '')}"]`;

test('every rail link resolves to a section that exists', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('.rail__link').evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  expect(hrefs.length, 'the rail should list all thirteen guidelines').toBe(13);
  for (const href of hrefs) {
    await expect(page.locator(byId(href)), `${href} has no target`).toHaveCount(1);
  }
});

test('every principle opener links to its own guidelines', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('.opener__link').evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  expect(hrefs.length).toBe(13);
  for (const href of hrefs) {
    await expect(page.locator(byId(href)), `${href} has no target`).toHaveCount(1);
  }
});

test('renders all four principle openers and all thirteen guideline sections', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.opener')).toHaveCount(4);
  await expect(page.locator('[data-guideline]')).toHaveCount(13);
});

test('skips no heading levels', async ({ page }) => {
  await page.goto('/');
  const levels = await page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));

  expect(levels[0], 'the page should start at h1').toBe(1);
  expect(levels.filter((l) => l === 1), 'exactly one h1').toHaveLength(1);
  for (let i = 1; i < levels.length; i++) {
    expect(
      levels[i]! - levels[i - 1]!,
      `heading level jumped from h${levels[i - 1]} to h${levels[i]}`,
    ).toBeLessThanOrEqual(1);
  }
});

test('a deep-linked card is not obscured by the sticky masthead', async ({ page }) => {
  await page.goto('/#1.4.1');
  await page.waitForTimeout(400);

  const mastheadBottom = await page
    .locator('.masthead')
    .evaluate((el) => el.getBoundingClientRect().bottom);
  const cardTop = await page
    .locator('[id="1.4.1"]')
    .evaluate((el) => el.getBoundingClientRect().top);

  // 2.4.11, by the same mechanism the page documents.
  expect(cardTop, 'the sticky header covers the deep-linked card').toBeGreaterThanOrEqual(
    mastheadBottom - 1,
  );
});

test('marks the current guideline in the rail as you scroll', async ({ page }) => {
  await page.goto('/');
  // Align the section head to the viewport top so it is unambiguously past the reading line;
  // scrollIntoViewIfNeeded would scroll only far enough to make some part visible.
  await page.evaluate(() =>
    document
      .querySelector('[id="g2.4"]')!
      .scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' }),
  );
  await page.waitForTimeout(500);
  const current = page.locator('.rail__link[aria-current]');
  await expect(current).toHaveCount(1);
  await expect(current).toContainText('Navigable');
});
