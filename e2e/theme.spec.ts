import { test, expect } from '@playwright/test';

const KEY = 'wcag-encyclopedia:theme';
const attr = (page: import('@playwright/test').Page) =>
  page.locator('html').getAttribute('data-theme');

test('opens in the OS theme when nothing is stored', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await attr(page)).toBe('dark');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await attr(page)).toBe('light');
});

test('toggles, and its label names the action rather than the state', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const button = page.locator('.theme-toggle');

  await expect(button).toHaveText(/dark mode/i);
  await button.click();
  expect(await attr(page)).toBe('dark');
  await expect(button).toHaveText(/light mode/i);
});

test('an explicit dark choice survives a reload on a light OS', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('.theme-toggle').click();
  await page.reload();
  expect(await attr(page)).toBe('dark');
  expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe('dark');
});

test('an explicit light choice survives a reload on a dark OS', async ({ page }) => {
  // The direction that is usually broken: a stored 'light' ignored in favour of the OS.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.locator('.theme-toggle').click();
  await page.reload();
  expect(await attr(page)).toBe('light');
});

test('paints the stored theme before React runs — no flash of the wrong theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.evaluate((k) => localStorage.setItem(k, 'dark'), KEY);

  // Freeze the page the instant the document exists, before any module has executed.
  await page.goto('/', { waitUntil: 'commit' });
  const early = await page.locator('html').getAttribute('data-theme');
  expect(early, 'the inline script did not set the theme before paint').toBe('dark');
});

test('the toggle is keyboard operable with a visible focus ring', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.theme-toggle');
  await button.focus();
  const outline = await button.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(Number.parseFloat(outline)).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  expect(await attr(page)).toBe('dark');
});
