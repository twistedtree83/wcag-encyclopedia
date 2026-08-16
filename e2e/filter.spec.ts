import { test, expect } from '@playwright/test';

test('filtering to Level A hides AA criteria from the page and the a11y tree', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('[id="1.4.3"]')).toHaveCount(0); // not yet authored
  await expect(page.locator('[id="1.4.1"]')).toBeVisible();
  await expect(page.locator('[id="1.4.11"]')).toBeVisible();

  await page.getByRole('button', { name: 'Level A', exact: true }).click();

  await expect(page.locator('[id="1.4.1"]')).toBeVisible();
  // Removed from the DOM entirely, so it is absent from the accessibility tree too —
  // a screen reader user and a sighted user see the same set.
  await expect(page.locator('[id="1.4.11"]')).toHaveCount(0);
});

test('the level buttons expose their pressed state', async ({ page }) => {
  await page.goto('/');
  const everything = page.getByRole('button', { name: 'Everything' });
  const levelA = page.getByRole('button', { name: 'Level A', exact: true });

  await expect(everything).toHaveAttribute('aria-pressed', 'true');
  await levelA.click();
  await expect(levelA).toHaveAttribute('aria-pressed', 'true');
  await expect(everything).toHaveAttribute('aria-pressed', 'false');
});

test('search finds a criterion by name and by number', async ({ page }) => {
  await page.goto('/');
  const search = page.locator('.masthead .controls__input');

  await search.fill('reflow');
  await expect(page.locator('[id="1.4.10"]')).toBeVisible();
  await expect(page.locator('[id="1.4.1"]')).toHaveCount(0);

  await search.fill('1.4.11');
  await expect(page.locator('[id="1.4.11"]')).toBeVisible();
  await expect(page.locator('[id="1.4.10"]')).toHaveCount(0);
});

test('the count matches the number of cards actually rendered', async ({ page }) => {
  await page.goto('/');
  const summary = page.locator('.masthead .controls__summary');

  await expect(summary).toHaveText('3 criteria documented');
  await expect(page.locator('.card')).toHaveCount(3);

  await page.getByRole('button', { name: 'Level A', exact: true }).click();
  await expect(summary).toHaveText('Showing 1 of 3 criteria');
  await expect(page.locator('.card')).toHaveCount(1);
});

test('announces the result count, so a screen reader user knows the filter did something', async ({
  page,
}) => {
  await page.goto('/');
  const summary = page.locator('.masthead .controls__summary');
  await expect(summary).toHaveAttribute('role', 'status');
  await expect(summary).toHaveAttribute('aria-live', 'polite');
});

test('says so plainly when nothing matches', async ({ page }) => {
  await page.goto('/');
  await page.locator('.masthead .controls__input').fill('zzzz');
  await expect(page.locator('.masthead .controls__summary')).toHaveText('No criteria match');
  await expect(page.locator('.card')).toHaveCount(0);
});

test('distinguishes "filtered out" from "not yet documented"', async ({ page }) => {
  await page.goto('/');
  // 1.1 has nothing authored yet.
  await expect(page.locator('[id="g1.1"] .guideline__pending')).toContainText('Not yet documented');

  await page.locator('.masthead .controls__input').fill('reflow');
  // 1.4 has criteria, but none match — a different message, not the same placeholder.
  await expect(page.locator('[id="g2.1"] .guideline__pending')).toContainText('Not yet documented');
  await page.getByRole('button', { name: 'Level A', exact: true }).click();
  await page.locator('.masthead .controls__input').fill('reflow');
  await expect(page.locator('[id="g1.4"] .guideline__pending')).toContainText(
    'match the current filter',
  );
});
