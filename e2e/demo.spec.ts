import { test, expect } from '@playwright/test';

/**
 * The demo player, end to end. Every property here is one the eight later demos inherit, so a
 * regression caught by this file is a regression in all nine.
 */

test('plays, pauses, and names the action on its button', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.demo__button').first();

  // Autoplays (no reduced-motion preference), so the control offers Pause.
  await expect(button).toHaveAccessibleName(/^Pause demo:/);
  await button.click();
  await expect(button).toHaveAccessibleName(/^Play demo:/);
  await button.click();
  await expect(button).toHaveAccessibleName(/^Pause demo:/);
});

test('scrubbing to a position renders that position’s caption', async ({ page }) => {
  await page.goto('/');
  const scrub = page.locator('.demo__scrub').first();
  const caption = page.locator('.demo__caption').first();

  await scrub.fill('11');

  await expect(caption).toContainText('320px');
  await expect(page.locator('.demo__time').first()).toContainText('0:11 / 0:12');
});

test('scrubbing takes manual control rather than fighting the clock', async ({ page }) => {
  await page.goto('/');
  const scrub = page.locator('.demo__scrub').first();
  await scrub.fill('6');
  await expect(page.locator('.demo__button').first()).toHaveAccessibleName(/^Play demo:/);
});

test('the scrub control is keyboard operable and labelled', async ({ page }) => {
  await page.goto('/');
  const scrub = page.locator('.demo__scrub').first();
  await expect(scrub).toHaveAccessibleName(/scrub position/i);
  await scrub.focus();
  const before = await scrub.inputValue();
  await page.keyboard.press('ArrowRight');
  expect(await scrub.inputValue()).not.toBe(before);
});

test('transport controls are at least 44px', async ({ page }) => {
  await page.goto('/');
  for (const sel of ['.demo__button', '.demo__scrub']) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box!.height, `${sel} is under 44px tall`).toBeGreaterThanOrEqual(44);
  }
});

test('captions are on and the demo is silent — no media element anywhere', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.demo__caption').first()).toBeVisible();
  await expect(page.locator('.demo__badge').first()).toHaveText(/cc on/i);
  // Demos are code-driven by design; a <video> or <audio> tag means someone took a shortcut.
  await expect(page.locator('video, audio')).toHaveCount(0);
});

test('does not auto-play under prefers-reduced-motion, but still scrubs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const button = page.locator('.demo__button').first();
  await expect(button).toHaveAccessibleName(/^Play demo:/);
  await expect(page.locator('.demo__meta').first()).toContainText(/reduced motion/i);

  const scrub = page.locator('.demo__scrub').first();
  await scrub.fill('11');
  await expect(page.locator('.demo__caption').first()).toContainText('320px');
});

test('the demo renders in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    await expect(page.locator('.demo__stage').first()).toBeVisible();
    const bg = await page
      .locator('.demo__stage')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    // Themed, not a hardcoded white rectangle flashing in dark mode.
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  }
});
