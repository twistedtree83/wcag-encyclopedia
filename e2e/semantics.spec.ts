import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open } from './support/open';

/**
 * The semantics flagships (#48) in the built page: the 1.1.1 alt text lab and the 1.3.1
 * structure lab (log, URL state), and both criteria's live examples (ADR 0002). The shared lab
 * bar (verdicts, Reset, axe when failing, motion) is in `e2e/labs/`.
 */

const ALT = '/criteria/1.1.1/';
const STRUCT = '/criteria/1.3.1/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

const altLab = (page: Page) => page.locator('.lab-slot .alt-lab');
const stLab = (page: Page) => page.locator('.lab-slot .st-lab');
const log = (scope: Locator) => scope.locator('.alog li');
const verdict = (lab: Locator) => lab.locator('.lab-verdict');
const live = (scope: Locator) => scope.locator('[aria-live="polite"]');
const radio = (lab: Locator, name: string) => lab.getByRole('radio', { name, exact: true });
const check = (lab: Locator, name: string) => lab.getByRole('checkbox', { name, exact: true });
const escape = (s: string) => s.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');

test.describe('the 1.1.1 alt text lab', () => {
  test('the log follows the alt, from presets and from the reader’s own words', async ({
    page,
  }) => {
    await open(page, ALT);
    const lab = altLab(page);
    await expect(log(lab)).toHaveText(['image']);
    await expect(lab.locator('.nrv-code code')).toHaveText('<img src="overshirt-401.jpg">');

    await radio(lab, 'Leave it out').focus();
    await page.keyboard.press('ArrowDown');
    await expect(log(lab)).toHaveText(['overshirt-401.jpg, image']);
    await expect(verdict(lab)).toHaveText('1.1.1 fails');

    // Decorative: the photo is skipped, so nothing is said at all.
    await page.keyboard.press('ArrowDown');
    await expect(log(lab)).toHaveCount(0);
    await expect(lab.locator('.alog__empty')).toHaveText('Nothing. The image is skipped.');
    await expect(verdict(lab)).toHaveText('1.1.1 fails');

    // The reader's own words, typed into the field.
    await lab.getByLabel('Or write your own alt text').focus();
    await page.keyboard.type('Rust shirt');
    await expect(log(lab)).toHaveText(['Rust shirt, image']);
    await expect(verdict(lab)).toHaveText('1.1.1 passes');
    await expect(lab.locator('.nrv-code code')).toHaveText(
      '<img src="overshirt-401.jpg" alt="Rust shirt">',
    );
    await expect(live(lab)).toHaveText('Screen reader says: Rust shirt, image. The photo is named.');
  });

  test('the divider passes only marked decorative, and a preset follows the image', async ({
    page,
  }) => {
    await open(page, ALT);
    const lab = altLab(page);
    await radio(lab, 'Leave it out').focus();
    await page.keyboard.press('ArrowDown');
    await radio(lab, 'A product photo: it shows what is for sale').focus();
    await page.keyboard.press('ArrowDown');
    // Still "the file name", now the divider's.
    await expect(log(lab)).toHaveText(['swirl-divider.svg, image']);
    await expect(radio(lab, 'The file name')).toBeChecked();
    await expect(verdict(lab)).toHaveText('1.1.1 fails');

    await radio(lab, 'The file name').focus();
    await page.keyboard.press('ArrowDown');
    await expect(log(lab)).toHaveCount(0);
    await expect(verdict(lab)).toHaveText('1.1.1 passes');
    await expect(live(lab)).toHaveText(
      'Screen reader says nothing: the image is skipped. Decoration, correctly skipped.',
    );
  });

  test('the mock is hidden from assistive technology and cannot be focused', async ({ page }) => {
    await open(page, ALT + '?img=photo&alt=Rust%20shirt');
    const mock = altLab(page).locator('[data-lab-mock]');
    await expect(mock).toHaveAttribute('aria-hidden', 'true');
    await expect(mock).toHaveAttribute('inert', '');
    await expect(altLab(page).getByRole('img', { name: 'Rust shirt' })).toHaveCount(0);
  });

  test('a shared link applies its state after load, unannounced', async ({ page }) => {
    await open(page, ALT + '?img=divider&alt=');
    const lab = altLab(page);
    await expect(verdict(lab)).toHaveText('1.1.1 passes');
    await expect(radio(lab, 'A divider: decoration only')).toBeChecked();
    await expect(radio(lab, 'Decorative: alt=""')).toBeChecked();
    await page.waitForTimeout(800);
    await expect(live(lab)).toHaveText('');
  });

  test('a bad link still opens the page at the start', async ({ page }) => {
    await open(page, ALT + '?img=banner');
    await expect(verdict(altLab(page))).toHaveText('1.1.1 fails');
    await expect(log(altLab(page))).toHaveText(['image']);
  });

  test('changes write back to the URL without adding history, and Reset clears it', async ({
    page,
  }) => {
    await open(page, ALT);
    const lab = altLab(page);
    const length = await page.evaluate(() => history.length);
    await radio(lab, 'Leave it out').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page).toHaveURL(/\?img=photo&alt=overshirt-401\.jpg$/);
    await lab.getByLabel('Or write your own alt text').fill('A b');
    await expect(page).toHaveURL(/\?img=photo&alt=A\+b$/);
    expect(await page.evaluate(() => history.length)).toBe(length);
    await lab.getByRole('button', { name: 'Reset' }).click();
    await expect(page).toHaveURL(new RegExp(`${escape(ALT)}$`));
  });
});

test.describe('the 1.3.1 structure lab', () => {
  test('the log hears each part of the form become real', async ({ page }) => {
    await open(page, STRUCT);
    const lab = stLab(page);
    await expect(log(lab)).toHaveText([
      'Track your order',
      'You will need:',
      '• Your order number',
      '• The postcode it went to',
      'Order number',
      'edit text',
      'Postcode',
      'edit text',
    ]);
    await check(lab, 'The heading is an <h3>').focus();
    await page.keyboard.press('Space');
    await expect(log(lab).first()).toHaveText('Track your order, heading, level 3');
    await expect(verdict(lab)).toHaveText('1.3.1 fails');
    await expect(live(lab)).toHaveText('In the markup: heading. Only styled: list and labels.');

    await check(lab, 'Each field has a <label for>').focus();
    await page.keyboard.press('Space');
    await expect(log(lab).filter({ hasText: 'edit text' })).toHaveText([
      'Order number, edit text',
      'Postcode, edit text',
    ]);
  });

  test('the table gains its size and column headers', async ({ page }) => {
    await open(page, STRUCT);
    const lab = stLab(page);
    await radio(lab, 'A form').focus();
    await page.keyboard.press('ArrowDown');
    await expect(log(lab)).toHaveText(['Opening hours', 'Day', 'Hours', 'Saturday', '9am to 5pm', 'Sunday', 'Closed']);
    await check(lab, 'The table is a <table> with <th>').focus();
    await page.keyboard.press('Space');
    await expect(log(lab).nth(1)).toHaveText('table, 3 rows, 2 columns');
    await expect(log(lab).nth(2)).toHaveText('Day, column header');
    await expect(page).toHaveURL(/\?mock=table&real=headers$/);
  });

  test('a shared link applies its state after load, unannounced, and the mock is hidden', async ({
    page,
  }) => {
    await open(page, STRUCT + '?mock=table&real=heading,headers');
    const lab = stLab(page);
    await expect(verdict(lab)).toHaveText('1.3.1 passes');
    await expect(check(lab, 'The table is a <table> with <th>')).toBeChecked();
    const mock = lab.locator('[data-lab-mock]');
    await expect(mock).toHaveAttribute('aria-hidden', 'true');
    await expect(mock).toHaveAttribute('inert', '');
    await expect(lab.getByRole('table')).toHaveCount(0);
    await page.waitForTimeout(800);
    await expect(live(lab)).toHaveText('');
  });

  test('a bad link still opens the page at the start', async ({ page }) => {
    await open(page, STRUCT + '?mock=chart&real=footer');
    await expect(verdict(stLab(page))).toHaveText('1.3.1 fails');
    await expect(radio(stLab(page), 'A form')).toBeChecked();
  });
});

/* Live examples: the fail stage is read by simulated input only; the pass stage is real. */

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });

const LIVE = [
  {
    url: ALT,
    staticBad: 'alt="chart.png"',
    bad: ['image, image', 'chart.png, image', 'decorative swirl, image'],
    good: ['Wool overshirt in rust, worn open, image', 'Sales rose 12% in Q3, then flattened, image'],
  },
  {
    url: STRUCT,
    staticBad: 'Shipping and returns',
    bad: [
      'Shipping and returns — Orders leave the warehouse within two days — Returns are free within thirty days',
    ],
    good: [
      'Shipping and returns, heading, level 3',
      'list, 2 items',
      'Orders leave the warehouse within two days',
      'Returns are free within thirty days',
    ],
  },
] as const;

for (const c of LIVE) {
  test.describe(`${c.url} live examples`, () => {
    test.describe('without JavaScript', () => {
      test.use({ javaScriptEnabled: false });
      test('the stages are the static examples, with no input bar', async ({ page }) => {
        await page.goto(c.url);
        await expect(broken(page)).toContainText(c.staticBad);
        await expect(page.locator('.inbar')).toHaveCount(0);
      });
    });

    test('the Broken stage is read aloud by simulated input over inert, hidden markup', async ({
      page,
    }) => {
      await open(page, c.url);
      const stage = broken(page);
      const example = stage.locator('.live__example');
      await expect(example).toHaveAttribute('aria-hidden', 'true');
      await expect(example).toHaveAttribute('inert', '');
      await key(stage, 'Read it aloud').click();
      await expect(log(stage)).toHaveText([...c.bad]);
      await expect(live(stage)).toHaveText(`Screen reader says: ${c.bad.join('; ')}`);
    });

    test('the Fixed stage is real, and read aloud from the same bar', async ({ page }) => {
      await open(page, c.url);
      const stage = fixed(page);
      await expect(stage.locator('.live__example')).not.toHaveAttribute('aria-hidden', 'true');
      await key(stage, 'Read it aloud').focus();
      await page.keyboard.press('Enter');
      await expect(log(stage)).toHaveText([...c.good]);
    });
  });
}

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const url of [ALT, STRUCT]) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations after operating its stages and lab (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      for (const stage of [broken(page), fixed(page)]) await key(stage, 'Read it aloud').click();
      const lab = url === ALT ? altLab(page) : stLab(page);
      await lab.locator('input[type="radio"]').nth(1).check();
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
}
