import { test, expect, type Page } from '@playwright/test';

/**
 * The theme toggle, on the pre-rendered pages. One button, "Dark theme", whose pressed state
 * says whether the dark theme is on. The theme follows the OS on first visit, then remembers
 * the reader's choice in both directions.
 */

const KEY = 'wcag-encyclopedia:theme';
const PAGE = '/criteria/1.4.3/';
const attr = (page: Page) => page.locator('html').getAttribute('data-theme');
const toggle = (page: Page) => page.getByRole('button', { name: 'Dark theme' });

async function open(page: Page) {
  await page.goto(PAGE);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

test('opens in the OS theme when nothing is stored', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await open(page);
  expect(await attr(page)).toBe('dark');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');

  await page.emulateMedia({ colorScheme: 'light' });
  await open(page);
  expect(await attr(page)).toBe('light');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
});

test('is one button labelled "Dark theme" whose pressed state follows the theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page);
  await expect(page.getByRole('button', { name: /theme/i })).toHaveCount(1);

  const button = toggle(page);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  expect(await attr(page)).toBe('dark');
  // The label does not change; the pressed state carries the state.
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await button.click();
  expect(await attr(page)).toBe('light');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('is at least 44px in both directions', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await open(page);
    const box = (await toggle(page).boundingBox())!;
    expect(box.height, `${width}px`).toBeGreaterThanOrEqual(44);
    expect(box.width, `${width}px`).toBeGreaterThanOrEqual(44);
  }
});

test('an explicit dark choice survives a reload on a light OS', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page);
  await toggle(page).click();
  await page.reload();
  expect(await attr(page)).toBe('dark');
  expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe('dark');
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
});

test('an explicit light choice survives a reload on a dark OS', async ({ page }) => {
  // The direction that is usually broken: a stored 'light' ignored in favour of the OS.
  await page.emulateMedia({ colorScheme: 'dark' });
  await open(page);
  await toggle(page).click();
  await page.reload();
  expect(await attr(page)).toBe('light');
});

test('paints the stored theme before React runs, so the wrong theme never flashes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(PAGE);
  await page.evaluate((k) => localStorage.setItem(k, 'dark'), KEY);

  // Freeze the page the instant the document exists, before any module has executed.
  await page.goto(PAGE, { waitUntil: 'commit' });
  const early = await page.locator('html').getAttribute('data-theme');
  expect(early, 'the inline script did not set the theme before paint').toBe('dark');
});

test('is keyboard operable with a visible focus ring', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page);
  const button = toggle(page);
  await button.focus();
  const outline = await button.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(Number.parseFloat(outline)).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  expect(await attr(page)).toBe('dark');
});

test('the old single page uses the same toggle', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const button = toggle(page);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  expect(await attr(page)).toBe('dark');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
});
