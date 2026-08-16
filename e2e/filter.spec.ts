import { test, expect } from '@playwright/test';
import { CORPUS } from '../src/criteria/corpus';
import { GUIDELINES } from '../src/criteria/structure';

/**
 * Counts are derived from the corpus, never hardcoded — otherwise every content task breaks
 * this file for no reason.
 */
const TOTAL = CORPUS.length;
const LEVEL_A = CORPUS.filter((c) => c.level === 'A').length;
/** A guideline with nothing authored yet, or undefined once the corpus is complete. */
const undocumented = GUIDELINES.find((g) => !CORPUS.some((c) => c.guideline === g.num))?.num;
/** A guideline that has criteria but none at Level A, if one exists. */
const documented = GUIDELINES.find((g) => CORPUS.some((c) => c.guideline === g.num))!.num;

test('filtering to Level A hides AA criteria from the page and the a11y tree', async ({
  page,
}) => {
  await page.goto('/');
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

  await expect(summary).toHaveText(`${TOTAL} criteria documented`);
  await expect(page.locator('.card')).toHaveCount(TOTAL);

  await page.getByRole('button', { name: 'Level A', exact: true }).click();
  await expect(summary).toHaveText(`Showing ${LEVEL_A} of ${TOTAL} criteria`);
  await expect(page.locator('.card')).toHaveCount(LEVEL_A);
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
  test.skip(!undocumented, 'corpus is complete — nothing is undocumented any more');
  await page.goto('/');

  await expect(
    page.locator(`[id="g${undocumented}"] .guideline__pending`),
  ).toContainText('Not yet documented');

  // A guideline that does have criteria, filtered so none match, gets a different message —
  // "not yet documented" would misreport the project's own progress.
  await page.locator('.masthead .controls__input').fill('zzzz-no-such-criterion');
  await expect(page.locator(`[id="g${documented}"] .guideline__pending`)).toContainText(
    'match the current filter',
  );
});
