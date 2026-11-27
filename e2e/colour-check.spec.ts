import { test, expect, type Page } from '@playwright/test';
import { open as openPage } from './support/open';

/**
 * The colour check in the built site: on its own page (wide, with quick-start pairs and the
 * "Done well, done badly" cards) and as the lab on 1.4.1, 1.4.3 and 1.4.11. The axe scan of
 * these pages runs from `axe.spec.ts` through ROUTES.
 *
 * Expected ratios are measured values from the design guide, not recomputed here.
 */

const PAGE = '/colour-check/';

const open = (page: Page, url = PAGE) => openPage(page, url);

const check = (page: Page) => page.locator('#cc');
const textHex = (page: Page) => check(page).getByLabel('Text colour hex code');
const bgHex = (page: Page) => check(page).getByLabel('Background hex code');
const score = (page: Page) => check(page).locator('output');
const preview = (page: Page) =>
  check(page).getByRole('group', { name: 'Preview in the chosen colours' });

test('typing a hex code updates the preview, ratio and results; a partial code is ignored', async ({
  page,
}) => {
  await open(page);
  await expect(score(page)).toHaveText('11.74 : 1');

  // 3 digits without # is a whole code: #999999 on sun.
  await textHex(page).fill('999');
  await bgHex(page).fill('#ffffff');
  await expect(preview(page)).toHaveCSS('color', 'rgb(153, 153, 153)');
  await expect(preview(page)).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(score(page)).toHaveText('2.84 : 1');
  await expect(check(page).locator('.res li.bad')).toHaveCount(4);

  // A partial code changes nothing, and is replaced by the colour when the field loses focus.
  await textHex(page).fill('#12');
  await expect(textHex(page)).toHaveValue('#12');
  await expect(score(page)).toHaveText('2.84 : 1');
  await textHex(page).blur();
  await expect(textHex(page)).toHaveValue('#999999');
});

test('the colour picker updates the check', async ({ page }) => {
  await open(page);
  await check(page).getByLabel('Text colour picker').fill('#ffffff');
  await expect(textHex(page)).toHaveValue('#FFFFFF');
  await expect(score(page)).not.toHaveText('11.74 : 1');
});

test('results show pass and fail with a word for each of the four thresholds', async ({ page }) => {
  await open(page);
  // #767676 on white: 4.54:1, passes AA body, fails AAA.
  await textHex(page).fill('767676');
  await bgHex(page).fill('FFFFFF');
  await expect(score(page)).toHaveText('4.54 : 1');
  const rows = check(page).locator('.res li');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toContainText('Passes');
  await expect(rows.nth(0)).toContainText('Body text, AA · 1.4.3');
  await expect(rows.nth(1)).toContainText('Passes');
  await expect(rows.nth(2)).toContainText('Fails');
  await expect(rows.nth(2)).toContainText('Body text, AAA · 1.4.6');
  await expect(rows.nth(3)).toContainText('Passes');
  await expect(rows.locator('svg')).toHaveCount(4);
  await expect(check(page).locator('.res a')).toHaveCount(0);
});

test('a failing pair offers the nearest passing colour, and the button applies it', async ({
  page,
}) => {
  await open(page);
  await textHex(page).fill('777777');
  await bgHex(page).fill('FFFFFF');
  await expect(score(page)).toHaveText('4.47 : 1');
  await expect(check(page).locator('.fix')).toContainText('#767676');
  await check(page).getByRole('button', { name: 'Use #767676' }).click();
  await expect(textHex(page)).toHaveValue('#767676');
  await expect(score(page)).toHaveText('4.54 : 1');
  await expect(check(page).locator('.fix')).toHaveCount(0);
});

test('swap, quick-start pairs and the greyscale preview work', async ({ page }) => {
  await open(page);
  await check(page).getByRole('button', { name: 'Swap text and background colours' }).click();
  await expect(textHex(page)).toHaveValue('#F8D17D');
  await expect(bgHex(page)).toHaveValue('#1A1C1C');

  await page.getByRole('list', { name: 'Start from a common pair' })
    .getByRole('button', { name: 'Grey on white' })
    .click();
  await expect(textHex(page)).toHaveValue('#999999');
  await expect(bgHex(page)).toHaveValue('#FFFFFF');

  await expect(preview(page)).toHaveCSS('filter', 'none');
  await check(page).getByLabel('Preview in greyscale').check();
  await expect(preview(page)).toHaveCSS('filter', 'grayscale(1)');
});

test('Try it in the checker loads the bad pair and moves focus to the text colour', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('button', { name: /^Try it in the checker\s*: White on yellow$/ }).click();
  await expect(textHex(page)).toHaveValue('#FFFFFF');
  await expect(bgHex(page)).toHaveValue('#F8D17D');
  await expect(textHex(page)).toBeFocused();
});

test('the verdict is announced politely, half a second after the last change', async ({
  page,
}) => {
  await open(page);
  const live = check(page).locator('[aria-live="polite"]');
  await expect(live).toHaveText('');
  await textHex(page).fill('999');
  await bgHex(page).fill('FFF');
  // Not straight away...
  await page.waitForTimeout(200);
  await expect(live).toHaveText('');
  // ...but once the changes stop.
  await expect(live).toHaveText('2.84 to 1. Fails for text and for controls.');
});

test('failing samples in pair cards are hidden from assistive technology', async ({ page }) => {
  await open(page);
  const bad = page.locator('.pairs .tile .sm[data-t]');
  await expect(bad).toHaveCount(6);
  for (const el of await bad.all()) {
    await expect(el).toHaveAttribute('aria-hidden', 'true');
    await expect(el).toHaveText('');
  }
  await expect(page.locator('.pairs .tag').first()).toContainText('Badly · 2.05 : 1');
});

test('?fg= and ?bg= preload a pair', async ({ page }) => {
  await open(page, `${PAGE}?fg=B5B5B5&bg=%23fff`);
  await expect(textHex(page)).toHaveValue('#B5B5B5');
  await expect(bgHex(page)).toHaveValue('#FFFFFF');
  await expect(score(page)).toHaveText('2.05 : 1');
});

test('a ?fg= / ?bg= preload is not announced; the reader’s next change is', async ({ page }) => {
  await open(page, `${PAGE}?fg=B5B5B5&bg=FFFFFF`);
  const live = check(page).locator('[aria-live="polite"]');
  await expect(textHex(page)).toHaveValue('#B5B5B5');
  await page.waitForTimeout(800);
  await expect(live).toHaveText('');
  await textHex(page).fill('999');
  await expect(live).toHaveText('2.84 to 1. Fails for text and for controls.');
});

for (const num of ['1.4.1', '1.4.3', '1.4.11']) {
  test(`${num} has a working colour check under Try it yourself`, async ({ page }) => {
    await open(page, `/criteria/${num}/`);
    const lab = page.locator('.lab-slot').filter({ hasText: 'Try it: check your own colours' });
    const form = lab.getByRole('form', { name: 'Colour check' });
    await expect(form).toBeVisible();
    await form.getByLabel('Text colour hex code').fill('777');
    await form.getByLabel('Background hex code').fill('fff');
    await expect(form.locator('output')).toHaveText('4.47 : 1');
    await expect(form.getByRole('button', { name: 'Use #767676' })).toBeVisible();
    await expect(lab.getByRole('link', { name: 'Open the full colour check' })).toHaveAttribute(
      'href',
      '../../colour-check/?fg=777777&bg=FFFFFF',
    );
  });
}

test('at 1440px the wide check has its preview beside the inputs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const inputs = await check(page).locator('.chk-in').boundingBox();
  const prev = await preview(page).boundingBox();
  expect(prev!.x).toBeGreaterThan(inputs!.x + inputs!.width);
  const pairs = await page.locator('.pairs > li').evaluateAll((li) =>
    li.slice(0, 3).map((l) => Math.round(l.getBoundingClientRect().top)),
  );
  expect(new Set(pairs).size, 'pair cards three up').toBe(1);
});

test('at 390px the check stacks with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const inputs = await check(page).locator('.chk-in').boundingBox();
  const prev = await preview(page).boundingBox();
  expect(prev!.y).toBeGreaterThan(inputs!.y + inputs!.height - 1);
  await textHex(page).fill('777');
  await bgHex(page).fill('fff');
  await expect(check(page).locator('.fix')).toBeVisible();
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});
