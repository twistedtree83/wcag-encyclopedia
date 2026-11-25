import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 1.4.12 and 1.4.4 (#54): a notice card in the zoom frame, its boxes locked at their designed
 * px size or flexible, under both live stages and in both labs.
 *
 *   Broken  locked boxes. Inert; "Toggle text spacing" (1.4.12) or "Enlarge text" (1.4.4) on
 *           the bar changes the text, and the boxes cut it off.
 *   Fixed   flexible boxes. Real; the text grows and every box grows with it.
 *   Labs    1.4.12: four overrides, one at a time or all four, on fixed-height or flexible
 *           boxes, with state in the URL. 1.4.4: text at 100/150/200%, locked or flexible.
 *
 * The verdicts come from the labs' model; the card measures its own boxes (`data-clipped`), and
 * these tests check the two agree. The shared lab bar is the `labs.spec.ts` entries.
 */

const SPACING_URL = '/criteria/1.4.12/';
const RESIZE_URL = '/criteria/1.4.4/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const meter = (stage: Locator) => stage.locator('.stage__instruments .alog').first();
const card = (where: Locator) => where.locator('.ncard');
const live = (stage: Locator) => stage.locator('p.sr[aria-live="polite"]');

const pageOverflows = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 1.4.12 and 1.4.4 stages are the static examples, with no input bar', async ({ page }) => {
    await page.goto(SPACING_URL);
    await expect(broken(page).locator('.spacing--rigid')).toHaveCount(1);
    await expect(fixed(page).locator('.spacing')).toHaveCount(1);
    await expect(page.locator('.inbar')).toHaveCount(0);
    await expect(page.locator('figure.stage .zframe')).toHaveCount(0);

    await page.goto(RESIZE_URL);
    await expect(broken(page).locator('.clipbox--fixed')).toHaveCount(1);
    await expect(fixed(page).locator('.clipbox')).toHaveCount(1);
    await expect(page.locator('.inbar')).toHaveCount(0);
  });
});

test('1.4.12 Broken: "Toggle text spacing" pushes the text out of the locked boxes', async ({ page }) => {
  await open(page, SPACING_URL);
  const stage = broken(page);
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  await expect(meter(stage)).toHaveText('Text and clippingAs designed: nothing changed yet.');
  await expect(card(stage)).toHaveAttribute('data-clipped', 'false');

  await key(stage, 'Toggle text spacing').click();
  await expect(meter(stage).locator('li')).toHaveText(['Text at 100%, spacing on', 'Text is cut off']);
  await expect(card(stage)).toHaveAttribute('data-clipped', 'true');
  await expect(live(stage)).toHaveText('Text spacing on. Text is cut off.');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);

  await key(stage, 'Toggle text spacing').click();
  await expect(meter(stage).locator('li')).toHaveText(['Text at 100%, spacing off', 'All the text fits']);
  await expect(card(stage)).toHaveAttribute('data-clipped', 'false');
});

test('1.4.12 Fixed: with the spacing on, every box grows and all the text fits', async ({ page }) => {
  await open(page, SPACING_URL);
  const stage = fixed(page);
  await key(stage, 'Toggle text spacing').click();
  await expect(meter(stage).locator('li')).toHaveText(['Text at 100%, spacing on', 'All the text fits']);
  await expect(card(stage)).toHaveAttribute('data-clipped', 'false');
  await expect(live(stage)).toHaveText('Text spacing on. All the text fits.');
  await expect(stage.getByRole('region', { name: /^Browser window at 100% zoom/ })).toHaveCount(1);
});

test('1.4.4 Broken: "Enlarge text" to 200% cuts the text off; Fixed: it all fits', async ({ page }) => {
  await open(page, RESIZE_URL);
  const bad = broken(page);
  await expect(bad.locator('.live__example')).toHaveAttribute('inert', '');
  await key(bad, 'Enlarge text').click();
  await expect(meter(bad).locator('li')).toHaveText(['Text at 150%, spacing off', 'Text is cut off']);
  await key(bad, 'Enlarge text').click();
  await expect(meter(bad).locator('li')).toHaveText(['Text at 200%, spacing off', 'Text is cut off']);
  await expect(card(bad)).toHaveAttribute('data-clipped', 'true');
  await expect(live(bad)).toHaveText('Text at 200%. Text is cut off.');

  const good = fixed(page);
  await key(good, 'Enlarge text').click();
  await key(good, 'Enlarge text').click();
  await expect(meter(good).locator('li')).toHaveText(['Text at 200%, spacing off', 'All the text fits']);
  await expect(card(good)).toHaveAttribute('data-clipped', 'false');

  // A third press goes back to 100%.
  await key(bad, 'Enlarge text').click();
  await expect(meter(bad).locator('li')).toHaveText(['Text at 100%, spacing off', 'All the text fits']);
});

const spacingLab = (page: Page) => page.locator('.lab-slot .spacing-lab');
const resizeLab = (page: Page) => page.locator('.lab-slot .resize-lab');
const verdict = (l: Locator) => l.locator('.lab-verdict');
const labSaid = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');
const radio = (l: Locator, name: string) => l.getByRole('radio', { name, exact: true });
const box = (l: Locator, name: string) => l.getByRole('checkbox', { name, exact: true });
const OVERRIDES = ['Line height 1.5', 'Paragraph spacing 2', 'Letter spacing 0.12', 'Word spacing 0.16'];

test('the 1.4.12 lab fails on each override alone, and the card measures the same', async ({ page }) => {
  await open(page, SPACING_URL);
  const l = spacingLab(page);
  await expect(verdict(l)).toHaveText('1.4.12 passes');
  await expect(card(l)).toHaveAttribute('data-clipped', 'false');
  for (const name of OVERRIDES) {
    await box(l, name).focus();
    await page.keyboard.press('Space');
    await expect(verdict(l), name).toHaveText('1.4.12 fails');
    await expect(card(l), name).toHaveAttribute('data-clipped', 'true');
    await page.keyboard.press('Space');
    await expect(verdict(l), name).toHaveText('1.4.12 passes');
    await expect(card(l), name).toHaveAttribute('data-clipped', 'false');
  }
});

test('the 1.4.12 lab passes with all four overrides on flexible boxes', async ({ page }) => {
  await open(page, SPACING_URL);
  const l = spacingLab(page);
  await l.getByRole('button', { name: 'Apply all four' }).focus();
  await page.keyboard.press('Enter');
  for (const name of OVERRIDES) await expect(box(l, name)).toBeChecked();
  await expect(verdict(l)).toHaveText('1.4.12 fails');
  await expect(l.locator('.fit-res li').first()).toHaveText('4 of 4overrides on');

  await radio(l, 'Fixed height').focus();
  await page.keyboard.press('ArrowDown');
  await expect(radio(l, 'Flexible')).toBeChecked();
  await expect(verdict(l)).toHaveText('1.4.12 passes');
  await expect(card(l)).toHaveAttribute('data-clipped', 'false');
  await expect(labSaid(l)).toHaveText(
    'Line height 1.5, paragraph spacing 2, letter spacing 0.12, word spacing 0.16. Flexible boxes: all the text fits.',
  );

  await l.getByRole('button', { name: 'Clear all four' }).click();
  for (const name of OVERRIDES) await expect(box(l, name)).not.toBeChecked();
});

test('the 1.4.12 lab state round-trips through the URL, and a preload is not announced', async ({
  page,
}) => {
  await open(page, SPACING_URL);
  const l = spacingLab(page);
  const length = await page.evaluate(() => history.length);
  await box(l, 'Word spacing 0.16').focus();
  await page.keyboard.press('Space');
  await box(l, 'Line height 1.5').focus();
  await page.keyboard.press('Space');
  await expect(page).toHaveURL(/\?spacing=line,word&boxes=fixed$/);
  await radio(l, 'Fixed height').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page).toHaveURL(/\?spacing=line,word&boxes=flexible$/);
  expect(await page.evaluate(() => history.length)).toBe(length);

  await open(page, SPACING_URL + '?spacing=letter&boxes=fixed');
  const shared = spacingLab(page);
  await expect(box(shared, 'Letter spacing 0.12')).toBeChecked();
  await expect(box(shared, 'Line height 1.5')).not.toBeChecked();
  await expect(radio(shared, 'Fixed height')).toBeChecked();
  await expect(verdict(shared)).toHaveText('1.4.12 fails');
  // Preloaded overrides still meet the boxes as they were designed, so the text is cut off.
  await expect(card(shared)).toHaveAttribute('data-clipped', 'true');
  await page.waitForTimeout(800);
  await expect(labSaid(shared)).toHaveText('');

  await shared.getByRole('button', { name: 'Reset' }).click();
  await expect(verdict(shared)).toHaveText('1.4.12 passes');
  await expect(page).toHaveURL(/\/criteria\/1\.4\.12\/$/);
});

test('a bad link still opens the 1.4.12 lab at the start', async ({ page }) => {
  await open(page, SPACING_URL + '?spacing=huge&boxes=round');
  await expect(verdict(spacingLab(page))).toHaveText('1.4.12 passes');
});

test('the 1.4.4 lab fails once text grows in locked boxes, and passes in flexible ones', async ({
  page,
}) => {
  await open(page, RESIZE_URL);
  const l = resizeLab(page);
  await expect(verdict(l)).toHaveText('1.4.4 passes');
  await expect(card(l)).toHaveAttribute('data-clipped', 'false');
  await radio(l, '100%').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(radio(l, '200%')).toBeChecked();
  await expect(verdict(l)).toHaveText('1.4.4 fails');
  await expect(card(l)).toHaveAttribute('data-clipped', 'true');
  await expect(l.locator('.fit-res li').first()).toHaveText('32pxbody text size');

  await radio(l, 'Locked in px').focus();
  await page.keyboard.press('ArrowDown');
  await expect(verdict(l)).toHaveText('1.4.4 passes');
  await expect(card(l)).toHaveAttribute('data-clipped', 'false');
  await expect(labSaid(l)).toHaveText('Text at 200%. Flexible: all the text fits.');
});

test('both lab mocks are hidden from assistive technology and cannot be focused', async ({ page }) => {
  for (const [url, lab] of [
    [SPACING_URL, spacingLab],
    [RESIZE_URL, resizeLab],
  ] as const) {
    await open(page, url);
    const mock = lab(page).locator('[data-lab-mock]');
    await expect(mock).toHaveAttribute('aria-hidden', 'true');
    await expect(mock).toHaveAttribute('inert', '');
  }
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const mode of MODES) {
  test(`1.4.12 and 1.4.4 have no accessibility violations in any lab state (${mode.name})`, async ({
    page,
  }) => {
    // Six full-page axe scans over two pages: near the default 30s alone, so it times out under load.
    test.slow();
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    const scan = async (state: string) => {
      const results = await new AxeBuilder({ page })
        .withTags(TAGS)
        .exclude('[data-depicts-failure]')
        .analyze();
      expect(results.violations, `${state}: ${results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')}`).toEqual([]);
      expect(await pageOverflows(page), `${state}: the page scrolls sideways`).toBe(false);
    };

    await open(page, SPACING_URL);
    await scan('1.4.12 start');
    for (const stage of [broken(page), fixed(page)]) await key(stage, 'Toggle text spacing').click();
    await expect(meter(fixed(page)).locator('li').first()).toHaveText('Text at 100%, spacing on');
    const s = spacingLab(page);
    await s.getByRole('button', { name: 'Apply all four' }).click();
    await scan('1.4.12 lab, all four on fixed-height boxes');
    await radio(s, 'Flexible').check();
    await scan('1.4.12 lab, all four on flexible boxes');

    await open(page, RESIZE_URL);
    await scan('1.4.4 start');
    for (const stage of [broken(page), fixed(page)]) {
      await key(stage, 'Enlarge text').click();
      await key(stage, 'Enlarge text').click();
    }
    await expect(meter(fixed(page)).locator('li').first()).toHaveText('Text at 200%, spacing off');
    const r = resizeLab(page);
    await radio(r, '200%').check();
    await scan('1.4.4 lab at 200%, locked');
    await radio(r, 'Flexible').check();
    await scan('1.4.4 lab at 200%, flexible');
  });
}
