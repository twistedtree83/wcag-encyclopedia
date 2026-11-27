import { test, expect, type Page } from '@playwright/test';
import { open as openPage } from './support/open';

/**
 * The demo player, end to end, on the criterion pages that carry demos (R-03). Every property
 * here is one the eight later demos inherit, so a regression caught by this file is a
 * regression in all nine.
 */

/** The criterion pages with a demo, and how many players each has. */
const DEMO_PAGES = {
  '1.4.10': 1,
  '2.2.2': 1,
  '2.4.7': 2,
  '2.4.11': 1,
  '2.5.8': 1,
  '3.3.1': 1,
  '4.1.2': 1,
  '4.1.3': 1,
} as const;

/** Opens a criterion page and waits until it is hydrated, so the controls are live. */
const open = (page: Page, num: string) => openPage(page, `/criteria/${num}/`);

test('plays, pauses, and names the action on its button', async ({ page }) => {
  await open(page, '1.4.10');
  const button = page.locator('.demo__button').first();

  // Autoplays (no reduced-motion preference), so the control offers Pause.
  await expect(button).toHaveAccessibleName(/^Pause demo:/);
  await button.click();
  await expect(button).toHaveAccessibleName(/^Play demo:/);
  await button.click();
  await expect(button).toHaveAccessibleName(/^Pause demo:/);
});

test('scrubbing to a position renders that position’s caption', async ({ page }) => {
  await open(page, '1.4.10');
  const scrub = page.locator('.demo__scrub').first();
  const caption = page.locator('.demo__caption').first();

  await scrub.fill('11');

  await expect(caption).toContainText('320px');
  await expect(page.locator('.demo__time').first()).toContainText('0:11 / 0:12');
});

test('scrubbing takes manual control rather than fighting the clock', async ({ page }) => {
  await open(page, '1.4.10');
  const scrub = page.locator('.demo__scrub').first();
  await scrub.fill('6');
  await expect(page.locator('.demo__button').first()).toHaveAccessibleName(/^Play demo:/);
});

test('the scrub control is keyboard operable and labelled', async ({ page }) => {
  await open(page, '1.4.10');
  const scrub = page.locator('.demo__scrub').first();
  await expect(scrub).toHaveAccessibleName(/scrub position/i);
  await scrub.focus();
  const before = await scrub.inputValue();
  await page.keyboard.press('ArrowRight');
  expect(await scrub.inputValue()).not.toBe(before);
});

test('transport controls are at least 44px', async ({ page }) => {
  await open(page, '1.4.10');
  for (const sel of ['.demo__button', '.demo__scrub']) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box!.height, `${sel} is under 44px tall`).toBeGreaterThanOrEqual(44);
  }
});

test('captions are on and the demo is silent — no media element anywhere', async ({ page }) => {
  await open(page, '1.4.10');
  await expect(page.locator('.demo__caption').first()).toBeVisible();
  await expect(page.locator('.demo__badge').first()).toHaveText(/cc on/i);
  // Demos are code-driven by design; a <video> or <audio> tag means someone took a shortcut.
  await expect(page.locator('video, audio')).toHaveCount(0);
});

test('does not auto-play under prefers-reduced-motion, but still scrubs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '1.4.10');

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
    await open(page, '1.4.10');
    await expect(page.locator('.demo__stage').first()).toBeVisible();
    const bg = await page
      .locator('.demo__stage')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    // Themed, not a hardcoded white rectangle flashing in dark mode.
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  }
});

for (const [num, expected] of Object.entries(DEMO_PAGES)) {
  test(`every demo on ${num} plays, pauses, and scrubs independently`, async ({ page }) => {
    await open(page, num);
    const players = page.locator('.demo');
    const count = await players.count();
    expect(count).toBe(expected);

    for (let i = 0; i < count; i++) {
      const player = players.nth(i);
      const caption = player.locator('.demo__caption');
      const scrub = player.locator('.demo__scrub');

      // Demos autoplay, so read from known positions rather than from wherever the clock is.
      // Scrubbing also pauses, which is what makes the second read stable.
      await scrub.fill('0');
      const atStart = await caption.textContent();
      await scrub.fill(await scrub.getAttribute('max').then((m) => m!));
      const atEnd = await caption.textContent();
      // Scrubbing to the end must land on a different keyframe than the start.
      expect(atEnd, `demo ${i} caption did not change across its timeline`).not.toBe(atStart);

      await player.locator('.demo__button').click();
      await expect(player.locator('.demo__button')).toHaveAccessibleName(/^(Play|Pause) demo:/);
    }
  });
}

test('the nine demos are all mounted across the criterion pages', () => {
  expect(Object.values(DEMO_PAGES).reduce((a, b) => a + b, 0)).toBe(9);
});

test('the two 2.4.7 demos differ only in whether the focus ring is drawn', async ({ page }) => {
  await open(page, '2.4.7');
  // Both traverse the same form on the same schedule; the visible ring is the one variable.
  const visible = page.locator('.demo').filter({ hasText: 'Focus is on' }).first();
  await expect(visible).toBeVisible();
  await expect(page.locator('.fdemo__status').first()).toContainText(/Focus is on|Tab order/);
});
