import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Live examples for 3.2.1 and 1.4.13 (#47, ADR 0002), in the shape of `live-examples.spec.ts`:
 * each Broken stage is driven only through its input bar over inert, hidden markup; each Fixed
 * stage takes real keys and pointer as well as the bar. Instruments: "Where the example is" and
 * the focus tracker (3.2.1), "Pointer and tooltip" (1.4.13).
 *
 * 3.2.1's change of page happens inside the example only: the real page never navigates, and
 * the reader's real focus never moves on the Broken stage.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const DUTIES = 'Duties are estimated at checkout and charged by your carrier on delivery.';
const SHOWS = `Tooltip shows “${DUTIES}”`;

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
const tooltip = (stage: Locator) => stage.locator('.live__example [role="tooltip"]');

async function expectInertBroken(stage: Locator) {
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, text] of [
    ['/criteria/3.2.1/', 'navigates on focus'],
    ['/criteria/1.4.13/', 'Duties are estimated at checkout…'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('figure.stage')).toHaveCount(2);
      await expect(page.locator('main')).toContainText(text);
      await expect(page.locator('.inbar')).toHaveCount(0);
    });
  }
});

test.describe('3.2.1 On Focus', () => {
  const URL = '/criteria/3.2.1/';
  const WHERE = 'Where the example is';

  test('the Broken stage changes page on focus alone, inside the example only', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = broken(page);
    await expect(lines(stage, WHERE)).toHaveText(['shop.example/help']);

    await key(stage, 'Press Tab').click();
    await expect(lines(stage, WHERE)).toHaveText([
      'shop.example/help',
      'shop.example/help/delivery, on focus alone',
    ]);
    await expect(polite(stage)).toHaveText(
      'The example moved to shop.example/help/delivery, on focus alone.',
    );
    await expect(stage.locator('.live__example')).toContainText('Orders arrive in two to three');
    // Focus went with the old page: no drawn ring, and the tracker starts again.
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'false');
    await expect(stage.locator('.ftrack__now')).toHaveText('Focus is not in the example yet.');
    // The real page did not move, and neither did the reader's focus.
    expect(new globalThis.URL(page.url()).pathname).toBe(URL);
    await expect(key(stage, 'Press Tab')).toBeFocused();
    await expectInertBroken(stage);

    // Back to help is an action; tabbing on lands on the select and is thrown out again.
    await key(stage, 'Press Tab').click();
    await expect(stage.locator('.ftrack__now')).toHaveText(
      'Focus is on stop 1 of 1: Back to help, button.',
    );
    await key(stage, 'Enter').click();
    await key(stage, 'Press Tab').click();
    await expect(lines(stage, WHERE)).toHaveText([
      'shop.example/help',
      'shop.example/help/delivery, on focus alone',
      'shop.example/help, after an action',
      'shop.example/help/delivery, on focus alone',
    ]);
  });

  test('the Fixed stage stays put on focus, and Go changes page', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Press Tab').click();
    await expect(stage.getByLabel('Jump to section')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: 'Go', exact: true })).toBeFocused();
    await expect(lines(stage, WHERE)).toHaveText(['shop.example/help']);
    await expect(stage.locator('.ftrack__now')).toHaveText('Focus is on stop 2 of 3: Go, button.');

    await page.keyboard.press('Enter');
    await expect(lines(stage, WHERE)).toHaveText([
      'shop.example/help',
      'shop.example/help/delivery, after an action',
    ]);
    await expect(stage.getByRole('button', { name: 'Back to help' })).toBeFocused();
    await expect(stage.locator('.ftrack__now')).toHaveText(
      'Focus is on stop 1 of 1: Back to help, button.',
    );
    await expect(polite(stage)).toHaveText(
      'The example moved to shop.example/help/delivery, after an action.',
    );
    expect(new globalThis.URL(page.url()).pathname).toBe(URL);

    // The bar's Enter is an action too, and focus comes back to Go.
    await key(stage, 'Enter').click();
    await expect(lines(stage, WHERE).last()).toHaveText('shop.example/help, after an action');
    await expect(stage.getByRole('button', { name: 'Go', exact: true })).toBeFocused();
  });
});

test.describe('1.4.13 Content on Hover or Focus', () => {
  const URL = '/criteria/1.4.13/';
  const LOG = 'Pointer and tooltip';

  test('the Broken stage: the tooltip vanishes on the way in, and Escape does nothing', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = broken(page);
    const cursor = stage.locator('.sim-cursor');
    await expect(cursor).toHaveAttribute('data-on', 'false');

    await key(stage, 'Hover').click();
    await expect(lines(stage, LOG)).toHaveText(['Pointer on the words “incl. duties”', SHOWS]);
    await expect(tooltip(stage)).toBeVisible();
    await expect(cursor).toHaveAttribute('data-on', 'true');
    await expect(polite(stage)).toHaveText(`Pointer on the words “incl. duties”. ${SHOWS}`);

    await key(stage, 'Hover').click();
    await expect(lines(stage, LOG)).toHaveText([
      'Pointer on the words “incl. duties”',
      SHOWS,
      'Pointer on the tooltip',
      'Tooltip closes',
    ]);
    await expect(tooltip(stage)).toBeHidden();
    await expect(stage.locator('.plog__now')).toHaveText('No tooltip is open.');

    // Away, back onto the words, then Escape: it stays over the text.
    await key(stage, 'Hover').click();
    await expect(cursor).toHaveAttribute('data-on', 'false');
    await key(stage, 'Hover').click();
    await key(stage, 'Escape').click();
    await expect(lines(stage, LOG).last()).toHaveText('Pressed Escape');
    await expect(tooltip(stage)).toBeVisible();
    await expect(stage.locator('.plog__now')).toHaveText(`Open now: “${DUTIES}”`);
    await expect(polite(stage)).toHaveText('Pressed Escape.');
    await expectInertBroken(stage);
  });

  test('the Fixed stage with the bar: hoverable, and Escape dismisses it', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Hover').click();
    await key(stage, 'Hover').click();
    await expect(lines(stage, LOG)).toHaveText([
      'Pointer on the words “incl. duties”',
      SHOWS,
      'Pointer on the tooltip',
    ]);
    await expect(tooltip(stage)).toBeVisible();

    await key(stage, 'Escape').click();
    await expect(lines(stage, LOG).last()).toHaveText('Tooltip closes');
    await expect(tooltip(stage)).toBeHidden();
    await expect(polite(stage)).toHaveText('Pressed Escape. Tooltip closes.');
    // The pointer did not move.
    await expect(stage.locator('.sim-cursor')).toHaveAttribute('data-on', 'true');
  });

  test('the Fixed stage with a real pointer and keys', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    const word = stage.getByRole('button', { name: 'incl. duties' });
    await word.hover();
    await expect(tooltip(stage)).toBeVisible();
    await tooltip(stage).hover();
    await expect(tooltip(stage)).toBeVisible();
    await expect(lines(stage, LOG)).toHaveText([
      'Pointer on the words “incl. duties”',
      SHOWS,
      'Pointer on the tooltip',
    ]);
    await page.keyboard.press('Escape');
    await expect(tooltip(stage)).toBeHidden();

    // Keyboard focus opens it too, and it describes the button.
    await page.mouse.move(0, 0);
    await word.focus();
    await expect(tooltip(stage)).toBeVisible();
    await expect(word).toHaveAccessibleDescription(DUTIES);
  });

  test('a simulated Escape on the Broken stage leaves the Fixed tooltip alone', async ({
    page,
  }) => {
    await open(page, URL);
    await key(fixed(page), 'Hover').click();
    await expect(tooltip(fixed(page))).toBeVisible();
    await key(broken(page), 'Escape').click();
    await expect(tooltip(fixed(page))).toBeVisible();
  });
});

for (const how of ['prefers-reduced-motion', 'data-motion="off"'] as const) {
  test(`the drawn pointer moves instantly under ${how}`, async ({ page }) => {
    if (how === 'prefers-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, '/criteria/1.4.13/');
    if (how === 'data-motion="off"') {
      await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'));
    }
    const stage = broken(page);
    await key(stage, 'Hover').click();
    await expect(stage.locator('.sim-cursor')).toHaveCSS('transition-duration', '0s');
  });
}

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

const PAGES = [
  { url: '/criteria/3.2.1/', keys: ['Press Tab', 'Press Tab'] },
  { url: '/criteria/1.4.13/', keys: ['Hover', 'Hover', 'Escape'] },
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
