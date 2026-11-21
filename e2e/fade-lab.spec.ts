import { test, expect, type Page } from '@playwright/test';

/**
 * The fade-the-text lab (R-07) on the 1.4.3 criterion page: the reader is in control, the text
 * really fades, and screen-reader users hear the result once, not once per step of a drag.
 * The axe scan of the page in both themes and at 320px is in `axe.spec.ts`.
 */

async function open(page: Page) {
  const response = await page.goto('/criteria/1.4.3/');
  expect(response?.status()).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
  return page.locator('.fade-lab');
}

test('sits in "Try it yourself" under its own heading', async ({ page }) => {
  await open(page);
  const section = page.locator('section', {
    has: page.getByRole('heading', { level: 2, name: 'Try it yourself' }),
  });
  await expect(
    section.getByRole('heading', { level: 3, name: 'Try it: fade the text' }),
  ).toBeVisible();
  await expect(section.locator('.fade-lab')).toBeVisible();
});

test('the slider is labelled, described, and works with the keyboard', async ({ page }) => {
  const lab = await open(page);
  const slider = lab.getByRole('slider', { name: 'Fade the text' });
  await expect(slider).toHaveAccessibleDescription(/fade the text towards the background/);
  await expect(slider).toHaveAttribute('aria-valuetext', '18% faded');

  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', '19% faded');
  await page.keyboard.press('End');
  await expect(lab.getByText('100% faded')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(lab.getByText('0% faded')).toBeVisible();
});

test('fading the text updates the exhibit, ratio, bar and results', async ({ page }) => {
  const lab = await open(page);
  await expect(lab.locator('output')).toHaveText('11.94 : 1');
  await expect(lab.locator('.lab-res li.ok')).toHaveCount(3);

  await lab.getByRole('slider', { name: 'Fade the text' }).fill('75');

  await expect(lab.locator('output')).toHaveText('2.78 : 1');
  await expect(lab.locator('.lab-res li.bad')).toHaveCount(3);
  await expect(lab.locator('.lab__exhibit h4')).toHaveCSS('color', 'rgb(92, 92, 92)');
  // The fill stops just short of the 3 tick: log(2.78) / log(21) ≈ 33.6% of the bar.
  await expect
    .poll(() =>
      lab.evaluate((el) => {
        const fill = el.querySelector('.scale__fill')!.getBoundingClientRect().width;
        return Math.round((fill / el.querySelector('.scale')!.getBoundingClientRect().width) * 100);
      }),
    )
    .toBe(34);
});

test('announces once the slider rests, not on every step', async ({ page }) => {
  const lab = await open(page);
  const region = lab.locator('[aria-live="polite"]');
  await expect(region).toHaveText('');

  const slider = lab.getByRole('slider', { name: 'Fade the text' });
  await slider.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  // Mid-drag the region is still silent…
  await expect(region).toHaveText('');
  // …then speaks the final state once.
  await expect(region).toHaveText(
    '23% faded. Contrast ratio 10.78 : 1. Passes body text AA, passes large text AA, passes body text AAA.',
  );
  // The visible ratio and results are not live regions themselves.
  await expect(lab.locator('output')).toHaveAttribute('aria-live', 'off');
  await expect(lab.locator('.lab-res[aria-live]')).toHaveCount(0);
});

test('nothing moves on its own', async ({ page }) => {
  const lab = await open(page);
  const snapshot = () =>
    lab.evaluate((el) => ({
      text: el.textContent,
      fill: (el.querySelector('.scale__fill') as HTMLElement).style.width,
      animations: el.getAnimations({ subtree: true }).length,
    }));
  const before = await snapshot();
  await page.waitForTimeout(1500);
  expect(await snapshot()).toEqual(before);
  expect(before.animations).toBe(0);
});

test('the bar does not transition under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const lab = await open(page);
  await expect(lab.locator('.scale__fill')).toHaveCSS('transition-duration', '0s');
});

for (const theme of ['light', 'dark'] as const) {
  test(`the exhibit stays near-black in the ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    const lab = await open(page);
    await expect(lab.locator('.lab__exhibit')).toHaveCSS('background-color', 'rgb(18, 19, 19)');
  });
}
