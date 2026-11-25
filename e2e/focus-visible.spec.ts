import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 2.4.7 (#44): the focus tracker under both live stages, and the flagship focus-ring lab.
 *
 *   Broken  three fields with the outline removed. Operated only by the input bar; no ring is
 *           drawn, so focus disappears, and the focus tracker alone says where it went.
 *   Fixed   the same fields with the site's ring. Real Tab and the bar move real focus.
 *   Lab     the reader styles the ring; the verdict flips with contrast against what it touches.
 *
 * The shared lab bar (verdicts by keyboard, Reset, axe, motion) is the `labs.spec.ts` entry.
 */

const URL = '/criteria/2.4.7/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

async function open(page: Page, url = URL) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const now = (stage: Locator) => stage.locator('.ftrack__now');
const trail = (stage: Locator) => stage.locator('.ftrack__trail li');
const numbers = (stage: Locator) => stage.locator('.ftrack__num text');

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 2.4.7 stages are the static examples, with no input bar', async ({ page }) => {
    await page.goto(URL);
    await expect(broken(page)).toContainText('outline: none');
    await expect(fixed(page)).toContainText('outline-offset');
    await expect(page.locator('.inbar')).toHaveCount(0);
    await expect(page.locator('.ftrack')).toHaveCount(0);
  });
});

test('Broken: simulated Tab moves focus nobody can see, and the tracker follows it', async ({
  page,
}) => {
  await open(page);
  const stage = broken(page);
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  await expect(now(stage)).toHaveText('Focus is not in the example yet.');

  await key(stage, 'Press Tab').click();
  await key(stage, 'Press Tab').click();
  await expect(now(stage)).toHaveText('Focus is on stop 2 of 3: Email, edit text.');
  await expect(numbers(stage)).toHaveText(['1', '2', '3']);
  await expect(trail(stage)).toHaveText(['1 Name, edit text', '2 Email, edit text']);

  // Wraps backwards past the start, as Shift+Tab does.
  await key(stage, 'Shift+Tab').click();
  await key(stage, 'Shift+Tab').click();
  await expect(now(stage)).toHaveText('Focus is on stop 3 of 3: Card, edit text.');
  await expect(trail(stage)).toHaveText([
    '1 Name, edit text',
    '2 Email, edit text',
    '1 Name, edit text',
    '3 Card, edit text',
  ]);
  await expect(trail(stage).last()).toHaveAttribute('aria-current', 'step');

  // The failure: no ring on the example, drawn or real, and no real focus inside it.
  await expect(stage.locator('.sim-ring')).toHaveCount(0);
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
  const outline = await example
    .locator('input')
    .nth(2)
    .evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).toBe('none');
  // The tracker's own ring sits on stop 3 of its map.
  const ring = (await stage.locator('.ftrack__ring').boundingBox())!;
  const third = (await stage.locator('.ftrack__stop').nth(2).boundingBox())!;
  expect(Math.abs(ring.x + ring.width / 2 - (third.x + third.width / 2))).toBeLessThan(2);
});

test('Fixed: real Tab and the bar move real focus, which shows a ring, and the tracker follows', async ({
  page,
}) => {
  await open(page);
  const stage = fixed(page);
  const field = (name: string) => stage.getByRole('textbox', { name });

  await key(stage, 'Press Tab').click();
  await expect(field('Name')).toBeFocused();
  await expect(field('Name')).toHaveCSS('outline-style', 'solid');
  await expect(field('Name')).toHaveCSS('outline-width', '3px');

  await page.keyboard.press('Tab');
  await expect(field('Email')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(field('Card')).toBeFocused();
  await expect(now(stage)).toHaveText('Focus is on stop 3 of 3: Card, edit text.');
  await expect(trail(stage)).toHaveText([
    '1 Name, edit text',
    '2 Email, edit text',
    '3 Card, edit text',
  ]);

  // Shift+Tab from the bar's first button comes back to the last field, real focus.
  await key(stage, 'Press Tab').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(field('Card')).toBeFocused();
  await key(stage, 'Shift+Tab').click();
  await expect(field('Email')).toBeFocused();
  await expect(now(stage)).toHaveText('Focus is on stop 2 of 3: Email, edit text.');
  await expect(trail(stage).last()).toHaveText('2 Email, edit text');
});

test('the two trackers line up beneath their stages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page);
  await key(broken(page), 'Press Tab').click();
  await key(fixed(page), 'Press Tab').click();
  const a = await broken(page).locator('.stage__instruments').boundingBox();
  const b = await fixed(page).locator('.stage__instruments').boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(1);
});

const lab = (page: Page) => page.locator('.lab-slot .ring-lab');
const verdict = (l: Locator) => l.locator('.lab-verdict');
const live = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');

test('the lab verdict follows thickness, gap and colour, by keyboard', async ({ page }) => {
  await open(page);
  const l = lab(page);
  await expect(verdict(l)).toHaveText('2.4.7 passes');
  await expect(l.locator('.ring-res li')).toHaveCount(1);
  await expect(l.locator('.ring-res li')).toContainText('6.70:1 against the page');
  await expect(l.locator('.ring-res li')).toContainText('Stands out: needs 3:1 (AA · 1.4.11)');

  // Close the gap: the blue ring now touches the dark button and is lost against it.
  await l.getByRole('slider', { name: 'Gap from the button' }).focus();
  await page.keyboard.press('Home');
  await expect(verdict(l)).toHaveText('2.4.7 fails');
  await expect(l.locator('.ring-res li')).toHaveCount(2);

  // A mid grey stands out from the white page and the dark button.
  await l.getByRole('radio', { name: 'Blue' }).focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(l.getByRole('radio', { name: 'Mid grey' })).toBeChecked();
  await expect(verdict(l)).toHaveText('2.4.7 passes');
  await expect(live(l)).toHaveText(
    '3 pixel mid grey ring, touching the button. 3.03 to 1 against the page, 4.82 to 1 against the button. Visible.',
  );

  // The mock draws exactly what was chosen.
  const save = l.locator('.ring-mock__btn').nth(1);
  await expect(save).toHaveCSS('outline-color', 'rgb(148, 148, 148)');
  await expect(save).toHaveCSS('outline-offset', '0px');

  // No ring at all.
  await l.getByRole('slider', { name: 'Ring thickness' }).focus();
  await page.keyboard.press('Home');
  await expect(verdict(l)).toHaveText('2.4.7 fails');
  await expect(save).toHaveCSS('outline-style', 'none');
});

test('the lab state round-trips through the URL, and a preload is not announced', async ({
  page,
}) => {
  await open(page);
  const l = lab(page);
  const length = await page.evaluate(() => history.length);
  await l.getByRole('slider', { name: 'Ring thickness' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\?w=4&off=2&c=blue$/);
  await l.getByRole('radio', { name: 'Blue' }).focus();
  await page.keyboard.press('ArrowUp');
  await expect(page).toHaveURL(/\?w=4&off=2&c=yellow$/);
  expect(await page.evaluate(() => history.length)).toBe(length);

  // Open the shared link fresh: the state is applied, silently.
  await open(page, page.url());
  const shared = lab(page);
  await expect(shared.getByRole('radio', { name: 'Yellow' })).toBeChecked();
  await expect(shared.getByRole('slider', { name: 'Ring thickness' })).toHaveValue('4');
  await expect(verdict(shared)).toHaveText('2.4.7 fails');
  await page.waitForTimeout(800);
  await expect(live(shared)).toHaveText('');

  // Reset goes back to the start, and so does the URL.
  await shared.getByRole('button', { name: 'Reset' }).click();
  await expect(verdict(shared)).toHaveText('2.4.7 passes');
  await expect(page).toHaveURL(/\/criteria\/2\.4\.7\/$/);
});

test('a bad link still opens the lab at the start', async ({ page }) => {
  await open(page, URL + '?w=12&c=pink');
  await expect(verdict(lab(page))).toHaveText('2.4.7 passes');
  await expect(page).toHaveURL(/\?w=12&c=pink$/);
});

test('the lab mock is hidden from assistive technology and cannot be focused', async ({ page }) => {
  await open(page);
  const mock = lab(page).locator('[data-lab-mock]');
  await expect(mock).toHaveAttribute('aria-hidden', 'true');
  await expect(mock).toHaveAttribute('inert', '');
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const mode of MODES) {
  test(`2.4.7 has no accessibility violations after operating both stages (${mode.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await open(page);
    for (const stage of [broken(page), fixed(page)]) {
      await key(stage, 'Press Tab').click();
      await key(stage, 'Press Tab').click();
    }
    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      .exclude('[data-depicts-failure]')
      .analyze();
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([]);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}
