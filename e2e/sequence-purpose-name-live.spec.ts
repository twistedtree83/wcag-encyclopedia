import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Live examples for 1.3.2, 1.3.5 and 2.5.3 (#49, ADR 0002), in the shape of
 * `live-examples.spec.ts`: each Broken stage is driven only through its input bar over inert,
 * hidden markup; each Fixed stage takes real keys as well as the bar. Instruments: the
 * announcement log, the autofill report (1.3.5) and voice control (2.5.3).
 */

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
/** The lines of the instrument headed `title` under a stage. */
const lines = (stage: Locator, title: string) =>
  stage.locator('.stage__instruments .alog').filter({ hasText: title }).locator('li');
const polite = (stage: Locator) => stage.locator('.stage__instruments [aria-live="polite"]');

async function expectInertBroken(stage: Locator) {
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, text] of [
    ['/criteria/1.3.2/', 'Confirm → Basket → Address'],
    ['/criteria/1.3.5/', 'autocomplete="name"'],
    ['/criteria/2.5.3/', 'aria-label="Submit form"'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('figure.stage')).toHaveCount(2);
      await expect(page.locator('main')).toContainText(text);
      await expect(page.locator('.inbar')).toHaveCount(0);
    });
  }
});

test.describe('1.3.2 Meaningful Sequence', () => {
  const URL = '/criteria/1.3.2/';

  test('the Broken stage tabs in source order while the screen shows 1, 2, 3', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await key(stage, 'Press Tab').click();
    await expect(lines(stage, 'Screen reader says')).toHaveText(['3. Confirm, button']);
    // The ring lands on the box drawn last on screen: the third, Confirm.
    const ring = stage.locator('.sim-ring');
    await expect(ring).toHaveAttribute('data-on', 'true');
    const confirm = (await stage.locator('.seq__step', { hasText: 'Confirm' }).boundingBox())!;
    const basket = (await stage.locator('.seq__step', { hasText: 'Basket' }).boundingBox())!;
    expect(confirm.x).toBeGreaterThan(basket.x);
    await expect
      .poll(async () => Math.abs((await ring.boundingBox())!.x - confirm.x))
      .toBeLessThan(2);

    await key(stage, 'Press Tab').click();
    await key(stage, 'Read it aloud').click();
    await expect(lines(stage, 'Screen reader says')).toHaveText([
      '1. Basket, button',
      '3. Confirm, button',
      '1. Basket, button',
      '2. Address, button',
    ]);
    await expectInertBroken(stage);
    await expect(polite(stage)).toHaveText(
      'Screen reader says: 3. Confirm, button; 1. Basket, button; 2. Address, button',
    );
  });

  test('the Fixed stage takes real Tab in the order it shows', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Press Tab').click();
    await expect(stage.getByRole('button', { name: '1. Basket' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: '2. Address' })).toBeFocused();
    await key(stage, 'Shift+Tab').click();
    await expect(lines(stage, 'Screen reader says')).toHaveText([
      '1. Basket, button',
      '2. Address, button',
      '1. Basket, button',
    ]);
  });
});

test.describe('1.3.5 Identify Input Purpose', () => {
  const URL = '/criteria/1.3.5/';

  test('the Broken stage: autofill finds nothing to fill', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await key(stage, 'Autofill').click();
    await expect(lines(stage, 'Autofill')).toHaveText([
      'Full name: left empty',
      'Email: left empty',
    ]);
    await expect(polite(stage)).toHaveText('Autofill filled 0 of 2 fields.');
    await key(stage, 'Press Tab').click();
    await expect(lines(stage, 'Screen reader says')).toHaveText(['Full name, edit text']);
    await expectInertBroken(stage);
  });

  test('the Fixed stage: autofill fills both fields, and the reader hears them', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Autofill').click();
    await expect(lines(stage, 'Autofill')).toHaveText([
      'Full name: Ada Lovelace',
      'Email: ada@example.com',
    ]);
    await expect(polite(stage)).toHaveText('Autofill filled 2 of 2 fields.');
    await expect(stage.getByLabel('Email')).toHaveValue('ada@example.com');
    await key(stage, 'Press Tab').click();
    await expect(stage.getByLabel('Full name')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(lines(stage, 'Screen reader says')).toHaveText([
      'Full name, edit text, Ada Lovelace',
      'Email, edit text, ada@example.com',
    ]);
  });
});

test.describe('2.5.3 Label in Name', () => {
  const URL = '/criteria/2.5.3/';

  test('the Broken stage: "click Send" matches nothing', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await key(stage, 'Say what you see').click();
    await expect(lines(stage, 'Voice control')).toHaveText(['You said “click Send”', 'Nothing matched']);
    await expect(polite(stage)).toHaveText('You said “click Send”. Nothing matched.');
    await key(stage, 'Press Tab').click();
    await expect(lines(stage, 'Screen reader says')).toHaveText(['Submit form, button']);
    await expectInertBroken(stage);
  });

  test('the Fixed stage: "click Send" reaches the button, and real Tab focuses it', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Say what you see').click();
    await expect(lines(stage, 'Voice control')).toHaveText([
      'You said “click Send”',
      'Clicked Send message to support, button',
    ]);
    await key(stage, 'Press Tab').focus();
    await page.keyboard.press('Shift+Tab');
    await expect(stage.getByRole('button', { name: 'Send message to support' })).toBeFocused();
    await expect(lines(stage, 'Screen reader says')).toHaveText([
      'Send message to support, button',
    ]);
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

const PAGES = [
  { url: '/criteria/1.3.2/', keys: ['Press Tab', 'Read it aloud'] },
  { url: '/criteria/1.3.5/', keys: ['Autofill', 'Press Tab', 'Read it aloud'] },
  { url: '/criteria/2.5.3/', keys: ['Say what you see', 'Press Tab', 'Read it aloud'] },
];

for (const { url, keys } of PAGES) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations after operating both stages (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      for (const stage of [broken(page), fixed(page)]) {
        for (const name of keys) await key(stage, name).click();
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
}
