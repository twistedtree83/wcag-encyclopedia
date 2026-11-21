import { test, expect, type Page } from '@playwright/test';

/**
 * The About page: what the site is, its accessibility statement, and where the source lives.
 * Reached from the nav and the footer of every page.
 */

const PAGE = '/about/';
const REPO = 'https://github.com/twistedtree83/wcag-encyclopedia';

async function open(page: Page, url = PAGE) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

test('the main nav reaches the About page and marks it current', async ({ page }) => {
  await open(page, '/criteria/1.4.3/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await nav.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
});

test('the footer links land on the About page and their sections', async ({ page }) => {
  for (const [name, hash] of [
    ['Accessibility statement', '#accessibility-statement'],
    ['How we test', '#how-we-test'],
    ['Source code', '#source-code'],
  ] as const) {
    await open(page, '/criteria/1.4.3/');
    await page.getByRole('contentinfo').getByRole('link', { name }).click();
    await expect(page).toHaveURL(new RegExp(`/about/${hash}$`));
    const target = page.locator(hash);
    await expect(target, `${hash} is missing`).toHaveCount(1);
    await expect(target).toBeInViewport();
  }
});

test.describe('before any script runs', () => {
  test.use({ javaScriptEnabled: false });

  test('says what the site is, in one h1 with headings in order', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('main')).toContainText('WCAG 2.2');

    const levels = await page
      .locator('main :is(h1, h2, h3, h4, h5, h6)')
      .evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]! - levels[i - 1]!,`heading ${i} skips a level`).toBeLessThanOrEqual(1);
    }
  });

  test('the statement gives the pledge in full and how each claim is checked', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const statement = page.locator('#accessibility-statement');
    await expect(statement.getByRole('heading', { level: 2 }).first()).toHaveText(
      'Accessibility statement',
    );
    await expect(statement).toContainText('This site follows its own rules.');

    const howWeTest = page.locator('#how-we-test');
    for (const commitment of [
      'Checked on every release',
      'Keyboard first',
      'Broken examples are labelled',
      'Motion is optional',
    ]) {
      await expect(statement.getByText(commitment, { exact: true }).first()).toBeVisible();
      // Each claim is paired with how it is checked.
      await expect(howWeTest.getByRole('heading', { name: commitment })).toHaveCount(1);
    }

    await expect(howWeTest).toContainText(/axe/i);
    await expect(howWeTest).toContainText(/both themes/i);
    await expect(howWeTest).toContainText('320px');
    await expect(howWeTest).toContainText(/token contrast audit/i);
    await expect(howWeTest).toContainText('4.5:1');
    await expect(howWeTest).toContainText('3:1');
  });

  test('links to the source code on GitHub', async ({ page }) => {
    await page.goto(PAGE);
    await expect(
      page.locator('#source-code').getByRole('link', { name: /source code on GitHub/i }),
    ).toHaveAttribute('href', REPO);
  });
});
