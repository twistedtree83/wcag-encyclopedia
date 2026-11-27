import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open } from './support/open';

/**
 * The mock site (#63) in 2.4.5's and 3.2.3's live examples and labs, in the shape of
 * `live-examples.spec.ts`. Each Broken stage is driven only through its input bar over inert,
 * hidden markup; each Fixed stage takes real keys as well as the bar. Moving between mock pages
 * never changes the real page's address, title or focus. The labs' verdicts, Reset and motion
 * are covered by `e2e/labs/`; this file checks what they show.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

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
    ['/criteria/2.4.5/', 'Home › Support › Billing › Invoices › VAT'],
    ['/criteria/3.2.3/', 'Page B · Support · Home · Account · Products'],
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

test.describe('2.4.5 Multiple Ways', () => {
  const URL = '/criteria/2.4.5/';
  const SITE = 'Mock site';

  test('the Broken stage: the menu is the only way down, by simulated input', async ({ page }) => {
    test.slow(); // Sixteen bar presses through four mock pages, on a loaded machine.
    await open(page, URL);
    const title = await page.title();
    const stage = broken(page);
    const log = instrument(stage, SITE);
    await expect(log.locator('.msite-log__now')).toHaveText('On Home, where the visit starts.');
    await expect(log.locator('.msite-log__ways')).toHaveText('Ways to find a page: the menu.');

    // Home: Home, Shop, Support.
    await press(stage, 'Press Tab', 3);
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await press(stage, 'Enter');
    await expect(polite(stage)).toHaveText(
      'The example’s site is now on Support, reached by the menu. Menu: Home, Shop, Support.',
    );
    // A new page: the drawn focus went with the old one.
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'false');
    await expectRealPageStill(page, URL, title);
    await expectInertBroken(stage);

    // Then down the tree by the links in each page: the menu stops come first each time.
    for (const _ of ['Billing', 'Invoices', 'VAT invoices']) {
      await press(stage, 'Press Tab', 4);
      await press(stage, 'Enter');
    }
    await expect(log.locator('.msite-log__now')).toHaveText('On VAT invoices, 4 moves from the start.');
    await expect(lines(stage, SITE)).toHaveText([
      'Home',
      'Support, by the menu',
      'Billing, by a link on the page',
      'Invoices, by a link on the page',
      'VAT invoices, by a link on the page',
    ]);
    await expect(example(stage)).toContainText('shop.example/support/billing/invoices/vat');
    await expectRealPageStill(page, URL, title);
    await expectInertBroken(stage);
  });

  test('the Fixed stage: search and the site map lead there too, by real keys', async ({ page }) => {
    await open(page, URL);
    const title = await page.title();
    const stage = fixed(page);
    const log = instrument(stage, SITE);
    await expect(log.locator('.msite-log__ways')).toHaveText(
      'Ways to find a page: the menu, search and the site map.',
    );

    // Real keys: the search box is filled with “VAT”; Enter sends it.
    await stage.getByRole('searchbox', { name: 'Search the shop' }).focus();
    await page.keyboard.press('Enter');
    await expect(log.locator('.msite-log__now')).toHaveText(
      'On Search results for “VAT”, 1 move from the start.',
    );
    // Focus starts at the top of the new page, as on a page load, inside the example.
    await expect(stage.locator('.msite__bar')).toBeFocused();
    await expectRealPageStill(page, URL, title);

    await stage.getByRole('link', { name: 'VAT invoices' }).focus();
    await page.keyboard.press('Enter');
    await expect(log.locator('.msite-log__now')).toHaveText('On VAT invoices, 2 moves from the start.');
    await expect(lines(stage, SITE)).toHaveText([
      'Home',
      'Search results for “VAT”, by search',
      'VAT invoices, by search',
    ]);
    await expect(polite(stage)).toHaveText(
      'The example’s site is now on VAT invoices, reached by search. Menu: Home, Shop, Support.',
    );
    await expectRealPageStill(page, URL, title);

    // The bar alone, as a touch reader would: Home, then the site map, then VAT invoices.
    // Stops on VAT invoices: Home, Shop, Support, the search box, Search, Site map.
    await press(stage, 'Press Tab');
    await press(stage, 'Enter');
    await expect(log.locator('.msite-log__now')).toHaveText('On Home, 3 moves from the start.');
    await press(stage, 'Press Tab', 6);
    await expect(stage.getByRole('link', { name: 'Site map' })).toBeFocused();
    await press(stage, 'Enter');
    await expect(log.locator('.msite-log__now')).toHaveText('On Site map, 4 moves from the start.');
    // Site map stops: the menu (3), the search box, Search, then the map's links.
    await press(stage, 'Press Tab', 12);
    await expect(stage.getByRole('link', { name: 'VAT invoices' })).toBeFocused();
    await press(stage, 'Enter');
    await expect(lines(stage, SITE).last()).toHaveText('VAT invoices, by the site map');
    await expectRealPageStill(page, URL, title);
  });
});

test.describe('3.2.3 Consistent Navigation', () => {
  const URL = '/criteria/3.2.3/';
  const ORDER = 'Menu order';
  const LOG = 'Screen reader says';

  test('the Broken stage: the menu shuffles from page to page', async ({ page }) => {
    await open(page, URL);
    const title = await page.title();
    const stage = broken(page);
    await expect(lines(stage, ORDER)).toHaveText([
      '✓ Home: Home, Products, Support, Account. The first page seen.',
    ]);
    await press(stage, 'Press Tab', 2);
    await press(stage, 'Enter');
    await expect(lines(stage, ORDER)).toHaveText([
      '✓ Home: Home, Products, Support, Account. The first page seen.',
      '✕ Products: Support, Home, Account, Products. Order changed from Home.',
    ]);
    // Two Tabs reached Products on Home; on Products they reach Home.
    await press(stage, 'Press Tab', 2);
    await expect(lines(stage, LOG).last()).toHaveText('Home, link');
    await expectRealPageStill(page, URL, title);
    await expectInertBroken(stage);
  });

  test('the Fixed stage: one order everywhere, by real keys and the bar', async ({ page }) => {
    await open(page, URL);
    const title = await page.title();
    const stage = fixed(page);
    await press(stage, 'Press Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('link', { name: 'Support' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(stage.locator('.msite__bar')).toBeFocused();
    await expect(lines(stage, ORDER).last()).toHaveText(
      '✓ Support: Home, Products, Support, Account. Same order as Home.',
    );
    await expect(polite(stage)).toHaveText(
      'The example’s site is now on Support, reached by the menu. Menu: Home, Products, Support, Account.',
    );
    // The same three Tabs land on Support again.
    for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
    await expect(stage.getByRole('link', { name: 'Support' })).toBeFocused();
    await press(stage, 'Press Tab');
    await press(stage, 'Enter');
    await expect(lines(stage, ORDER).last()).toHaveText(
      '✓ Account: Home, Products, Support, Account. Same order as Home.',
    );
    await expectRealPageStill(page, URL, title);
  });
});

test.describe('the labs', () => {
  test('2.4.5: each way walks its route, or says the site lacks it', async ({ page }) => {
    await open(page, '/criteria/2.4.5/');
    const lab = page.locator('.lab-slot .ways-lab');
    await lab.getByRole('button', { name: 'Try the menu' }).click();
    await expect(lab.locator('output.lab-code')).toHaveText(
      'Route: Home › Support › Billing › Invoices › VAT invoices',
    );
    await expect(lab.locator('[data-site]')).toHaveAttribute('data-site-page', 'VAT invoices');
    await lab.getByRole('button', { name: 'Try search' }).click();
    await expect(lab.locator('output.lab-code')).toHaveText('That way is not on this site.');
    await expect(lab.locator('[data-site]')).toHaveAttribute('data-site-page', 'Home');
    await lab.getByRole('checkbox', { name: 'Search' }).check();
    await expect(lab.locator('.msite__search')).toHaveCount(1);
    await expect(lab.locator('.lab-verdict')).toHaveText('2.4.5 passes');
    expect(new globalThis.URL(page.url()).pathname).toBe('/criteria/2.4.5/');
  });

  test('3.2.3: moving between pages shows each page’s menu', async ({ page }) => {
    await open(page, '/criteria/3.2.3/');
    const lab = page.locator('.lab-slot .nav-lab');
    await lab.getByRole('radio', { name: 'Support' }).check();
    await expect(lab.locator('[data-site-nav] a')).toHaveText(['Account', 'Support', 'Products', 'Home']);
    await expect(lab.locator('output.lab-code')).toHaveText(
      'On Home the menu reads Home, Products, Support, Account. Here it reads Account, Support, Products, Home.',
    );
    await lab.getByRole('radio', { name: 'Same order on every page' }).check();
    await lab.getByRole('checkbox', { name: 'Support adds “Contact us”' }).check();
    await expect(lab.locator('[data-site-nav] a')).toHaveText([
      'Home',
      'Products',
      'Support',
      'Account',
      'Contact us',
    ]);
    await expect(lab.locator('.lab-verdict')).toHaveText('3.2.3 passes');
  });
});

for (const how of ['prefers-reduced-motion', 'data-motion="off"'] as const) {
  test(`a move between mock pages is instant under ${how}`, async ({ page }) => {
    if (how === 'prefers-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, '/criteria/3.2.3/');
    if (how === 'data-motion="off"') {
      await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'));
    }
    const stage = broken(page);
    await press(stage, 'Press Tab');
    await expect(stage.locator('.sim-ring')).toHaveCSS('transition-duration', '0s');
    await press(stage, 'Enter');
    await expect(lines(stage, 'Menu order')).toHaveCount(1);
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
  { url: '/criteria/2.4.5/', keys: ['Press Tab', 'Press Tab', 'Press Tab', 'Enter'], lab: ['Try the menu', 'Try search'] },
  { url: '/criteria/3.2.3/', keys: ['Press Tab', 'Press Tab', 'Enter'], lab: [] },
];

for (const { url, keys, lab } of PAGES) {
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
      for (const stage of [broken(page), fixed(page)]) {
        for (const name of keys) await key(stage, name).click();
      }
      for (const name of lab) await page.locator('.lab-slot').getByRole('button', { name }).click();
      await expect(lines(broken(page), url.includes('2.4.5') ? 'Mock site' : 'Menu order')).toHaveCount(2);
      await scan();
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  }
}
