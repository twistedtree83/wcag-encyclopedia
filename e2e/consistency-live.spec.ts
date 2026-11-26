import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 3.2.4 and 3.2.6 on the mock site (#64), in the shape of `mock-site-live.spec.ts`. Each Broken
 * stage is driven only through its input bar over inert, hidden markup; each Fixed stage takes
 * real keys as well as the bar. Moving between mock pages never changes the real page. The labs'
 * verdicts, Reset and motion are covered by `e2e/labs/`; this file checks what they show.
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
const instrument = (stage: Locator, title: string) =>
  stage.locator('.stage__instruments .alog').filter({ hasText: title });
const lines = (stage: Locator, title: string) => instrument(stage, title).locator('li');
const polite = (stage: Locator) => stage.locator('.stage__instruments [aria-live="polite"]');
const example = (stage: Locator) => stage.locator('.live__example');

async function press(stage: Locator, name: string, times = 1) {
  for (let i = 0; i < times; i++) await key(stage, name).click();
}

/** The real page is where it was: same path, same title, and focus is not lost from it. */
async function expectRealPageStill(page: Page, url: string, title: string) {
  expect(new globalThis.URL(page.url()).pathname).toBe(url);
  expect(new globalThis.URL(page.url()).hash).toBe('');
  await expect(page).toHaveTitle(title);
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
}

async function expectInertBroken(stage: Locator) {
  await expect(example(stage)).toHaveAttribute('aria-hidden', 'true');
  await expect(example(stage)).toHaveAttribute('inert', '');
  expect(await example(stage).evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, text] of [
    ['/criteria/3.2.4/', 'Mini basket — "Proceed"'],
    ['/criteria/3.2.6/', 'Account — buried under a settings menu'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('figure.stage')).toHaveCount(2);
      await expect(page.locator('main')).toContainText(text);
      await expect(page.locator('.inbar')).toHaveCount(0);
      await expect(page.locator('figure.stage [data-site]')).toHaveCount(0);
    });
  }
});

test.describe('3.2.4 Consistent Identification', () => {
  const URL = '/criteria/3.2.4/';
  const NAME = 'Search control';
  const LOG = 'Screen reader says';

  test('the Broken stage: the search button is renamed on Products', async ({ page }) => {
    test.slow(); // Twelve bar presses over two mock pages, on a loaded machine.
    await open(page, URL);
    const title = await page.title();
    const stage = broken(page);
    await expect(lines(stage, NAME)).toHaveText([
      '✓ Home: the search button reads “Search”. The first page seen.',
    ]);
    // Stops on Home: Home, Products, Support, the search box, the button.
    await press(stage, 'Press Tab', 5);
    await expect(lines(stage, LOG).last()).toHaveText('Search, button');
    await press(stage, 'Shift+Tab', 3);
    await press(stage, 'Enter');
    await expect(polite(stage)).toHaveText(
      'The example’s site is now on Products, reached by the menu. Menu: Home, Products, Support.',
    );
    await expect(lines(stage, NAME)).toHaveText([
      '✓ Home: the search button reads “Search”. The first page seen.',
      '✕ Products: the search button reads “Find”. Named “Search” on Home.',
    ]);
    // The same five stops land on a button by another name.
    await press(stage, 'Press Tab', 5);
    await expect(lines(stage, LOG).last()).toHaveText('Find, button');
    await expectRealPageStill(page, URL, title);
    await expectInertBroken(stage);
  });

  test('the Fixed stage: “Search” on every page, by real keys and the bar', async ({ page }) => {
    await open(page, URL);
    const title = await page.title();
    const stage = fixed(page);
    await stage.getByRole('link', { name: 'Support' }).focus();
    await page.keyboard.press('Enter');
    await expect(stage.locator('.msite__bar')).toBeFocused();
    await expect(lines(stage, NAME).last()).toHaveText(
      '✓ Support: the search button reads “Search”. Same name as on Home.',
    );
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: 'Search', exact: true })).toBeFocused();
    // The bar alone sends the search, filled with “returns”.
    await press(stage, 'Enter');
    await expect(lines(stage, NAME).last()).toHaveText(
      '✓ Search results for “returns”: the search button reads “Search”. Same name as on Home.',
    );
    await expect(polite(stage)).toHaveText(
      'The example’s site is now on Search results for “returns”, reached by search. Menu: Home, Products, Support.',
    );
    await expectRealPageStill(page, URL, title);
  });
});

test.describe('3.2.6 Consistent Help', () => {
  const URL = '/criteria/3.2.6/';
  const HELP = 'Help link';
  const LOG = 'Screen reader says';

  test('the Broken stage: help moves from the header to the footer', async ({ page }) => {
    test.slow(); // Twelve bar presses over two mock pages, on a loaded machine.
    await open(page, URL);
    const title = await page.title();
    const stage = broken(page);
    await expect(lines(stage, HELP)).toHaveText([
      '✓ Home: help in the header. The first page with help.',
    ]);
    // On Home the fourth stop is Help, straight after the menu.
    await press(stage, 'Press Tab', 4);
    await expect(lines(stage, LOG).last()).toHaveText('Help, link');
    await press(stage, 'Shift+Tab', 2);
    await press(stage, 'Enter');
    await expect(polite(stage)).toHaveText(
      'The example’s site is now on Products, reached by the menu. Menu: Home, Products, Account.',
    );
    await expect(lines(stage, HELP).last()).toHaveText(
      '✕ Products: help in the footer. Moved from the header on Home.',
    );
    // Help is no longer the fourth stop: the page's own links come first, then the footer.
    await press(stage, 'Press Tab', 4);
    await expect(lines(stage, LOG).last()).toHaveText('Kettles, link');
    await press(stage, 'Press Tab', 2);
    await expect(lines(stage, LOG).last()).toHaveText('Help, link');
    await expect(example(stage).locator('[data-site-help]')).toHaveAttribute('data-site-help', 'the footer');
    await expectRealPageStill(page, URL, title);
    await expectInertBroken(stage);
  });

  test('the Fixed stage: help stays in the header, by real keys and the bar', async ({ page }) => {
    await open(page, URL);
    const title = await page.title();
    const stage = fixed(page);
    await stage.getByRole('link', { name: 'Account' }).focus();
    await page.keyboard.press('Enter');
    await expect(stage.locator('.msite__bar')).toBeFocused();
    await expect(lines(stage, HELP).last()).toHaveText(
      '✓ Account: help in the header. Same place as on Home.',
    );
    // Four stops from the top reach Help on every page.
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    await expect(stage.getByRole('link', { name: 'Help' })).toBeFocused();
    await press(stage, 'Enter');
    await expect(polite(stage)).toHaveText(
      'The example’s site is now on Help, reached by the help link. Menu: Home, Products, Account.',
    );
    await expect(lines(stage, HELP).last()).toHaveText(
      '✓ Help: help in the header. Same place as on Home.',
    );
    await expectRealPageStill(page, URL, title);
  });
});

test.describe('the labs', () => {
  test('3.2.4: each page shows the name the reader gave its button', async ({ page }) => {
    await open(page, '/criteria/3.2.4/');
    const lab = page.locator('.lab-slot .id-lab');
    await expect(lab.locator('[data-site-search]')).toHaveText('Search');
    await lab.getByRole('radio', { name: 'Support', exact: true }).check();
    await expect(lab.locator('[data-site-search]')).toHaveText('Go');
    await expect(lab.getByRole('group', { name: 'Name the search button on Support' })).toBeVisible();
    await expect(lab.locator('output.lab-code')).toHaveText(
      'The search button reads “Search” on Home, “Find” on Products and “Go” on Support.',
    );
    await lab.getByRole('radio', { name: 'Find', exact: true }).check();
    await expect(lab.locator('[data-site-search]')).toHaveText('Find');
    await expect(lab.locator('.lab-verdict')).toHaveText('3.2.4 fails');
  });

  test('3.2.6: each page draws its help link where the reader put it', async ({ page }) => {
    await open(page, '/criteria/3.2.6/');
    const lab = page.locator('.lab-slot .help-lab');
    await expect(lab.locator('[data-site-help]')).toHaveAttribute('data-site-help', 'the header');
    await lab.getByRole('radio', { name: 'Account', exact: true }).check();
    await expect(lab.locator('[data-site-help]')).toHaveAttribute('data-site-help', 'the page');
    await lab.getByRole('radio', { name: 'Not on this page' }).check();
    await expect(lab.locator('[data-site-help]')).toHaveCount(0);
    await expect(lab.locator('output.lab-code')).toHaveText(
      'Help is in the header on Home and in the footer on Products. Account has none.',
    );
    await expect(lab.locator('.lab-verdict')).toHaveText('3.2.6 fails');
  });
});

for (const how of ['prefers-reduced-motion', 'data-motion="off"'] as const) {
  test(`a move on the 3.2.6 mock site is instant under ${how}`, async ({ page }) => {
    if (how === 'prefers-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, '/criteria/3.2.6/');
    if (how === 'data-motion="off"') {
      await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'));
    }
    const stage = broken(page);
    await press(stage, 'Press Tab');
    await expect(stage.locator('.sim-ring')).toHaveCSS('transition-duration', '0s');
    await press(stage, 'Enter');
    await expect(lines(stage, 'Help link')).toHaveCount(1);
    await expect(stage.locator('[data-site]')).toHaveCSS('transition-duration', '0s');
  });
}

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

const PAGES = [
  { url: '/criteria/3.2.4/', instrument: 'Search control', lab: '.id-lab', radios: ['Products', 'Go'] },
  { url: '/criteria/3.2.6/', instrument: 'Help link', lab: '.help-lab', radios: ['Products', 'In the page'] },
];

for (const { url, instrument: title, lab, radios } of PAGES) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations after operating both stages (${mode.name})`, async ({
      page,
    }) => {
      test.slow(); // Two full-page axe scans per test.
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      const scan = async () => {
        const results = await new AxeBuilder({ page })
          .withTags(TAGS)
          .exclude('[data-depicts-failure]')
          .analyze();
        expect(
          results.violations,
          results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
        ).toEqual([]);
      };
      await scan();
      // Products, by the menu, on both stages; then a lab state off its start.
      for (const stage of [broken(page), fixed(page)]) {
        for (const name of ['Press Tab', 'Press Tab', 'Enter']) await key(stage, name).click();
      }
      for (const name of radios) {
        await page.locator(`.lab-slot ${lab}`).getByRole('radio', { name, exact: true }).check();
      }
      await expect(lines(broken(page), title)).toHaveCount(2);
      await expect(lines(fixed(page), title)).toHaveCount(2);
      await scan();
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  }
}
