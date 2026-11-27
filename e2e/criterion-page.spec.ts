import { test, expect, type Page } from '@playwright/test';
import { EXPECTED } from '../src/criteria/manifest';
import { open as openPage } from './support/open';

/**
 * The pre-rendered criterion page (ADR 0001), proven on 1.4.3, and the Swatch shell around it.
 */

const PAGE = '/criteria/1.4.3/';
const record = EXPECTED.find((c) => c.num === '1.4.3')!;

const open = (page: Page) => openPage(page, PAGE);

test.describe('before any script runs', () => {
  test.use({ javaScriptEnabled: false });

  test('the restatement and both examples are in the markup', async ({ page }) => {
    const response = await page.goto(PAGE);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(record.name);
    await expect(page.locator('main .plain')).toContainText('4.5:1');

    const broken = page.getByRole('figure', { name: /broken/i });
    const fixed = page.getByRole('figure', { name: /fixed/i });
    await expect(broken).toContainText('Hierarchy built by fading text out.');
    await expect(broken).toContainText('4242 4242 4242 4242');
    await expect(fixed).toContainText('Hierarchy moved from lightness to weight and scale.');
    await expect(fixed).toContainText('4242 4242 4242 4242');
  });

  test('the measured ratio shows for the theme in effect, without JavaScript', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(PAGE);
    const visible = page.locator('figure .measured:visible');
    // One badge per example, never both themes' values at once.
    await expect(visible).toHaveCount(2);
  });
});

test('hydrates, and the measured ratios follow the theme toggle', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await open(page);

  const badge = page.locator('figure.bad .measured:visible');
  const lightText = await badge.innerText();

  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(badge).not.toHaveText(lightText);
});

test('logs no hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await open(page);
  }
  expect(errors).toEqual([]);
});

test.describe('the shell', () => {
  test('has a header with the logo and the main nav, current page marked', async ({ page }) => {
    await open(page);
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'WCAG Encyclopedia' })).toBeVisible();

    const nav = header.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveText(['Home', 'Criteria', 'Colour check', 'About']);
    await expect(nav.getByRole('link', { name: 'Criteria' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('links between pages relatively, so it works under any path prefix', async ({ page }) => {
    await open(page);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href')!));
    const absolute = hrefs.filter((h) => h.startsWith('/'));
    expect(absolute).toEqual([]);
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Colour check' })).toHaveAttribute(
      'href',
      '../../colour-check/',
    );
  });

  test('puts a working skip link first in the tab order', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveText('Skip to content');
    await expect(focused).toHaveAttribute('href', '#main');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('has a footer with Principles, Tools and About columns', async ({ page }) => {
    await open(page);
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('heading', { level: 2 })).toHaveText([
      'Principles',
      'Tools',
      'About',
    ]);
    await expect(footer.getByRole('link', { name: 'Perceivable' })).toHaveAttribute(
      'href',
      '../?p=1',
    );
  });

  test('has one h1 and landmarks for header, nav, main and footer', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveAttribute('id', 'main');
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
  });

  test('keeps the nav beside the logo at 1440px and wraps it under at 390px', async ({ page }) => {
    const box = async () => {
      const brand = await page.getByRole('banner').getByRole('link', { name: 'WCAG Encyclopedia' }).boundingBox();
      const nav = await page.getByRole('navigation', { name: 'Main' }).boundingBox();
      return { brand: brand!, nav: nav! };
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    const wide = await box();
    expect(wide.nav.y).toBeLessThan(wide.brand.y + wide.brand.height);

    await page.setViewportSize({ width: 390, height: 844 });
    const narrow = await box();
    expect(narrow.nav.y).toBeGreaterThanOrEqual(narrow.brand.y + narrow.brand.height);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test('gives every nav link a target of at least 44px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
    for (const link of await links.all()) {
      const b = (await link.boundingBox())!;
      expect(b.height, await link.innerText()).toBeGreaterThanOrEqual(44);
      expect(b.width, await link.innerText()).toBeGreaterThanOrEqual(44);
    }
  });
});

test('loads only Figtree and Onest, from the site itself', async ({ page }) => {
  await open(page);
  const external = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLLinkElement>('link[href]')]
      .map((l) => new URL(l.href))
      .filter((u) => u.origin !== location.origin)
      .map((u) => u.href),
  );
  expect(external).toEqual([]);

  // The page's own CSS names no other web font.
  const faces = await page.evaluate(() =>
    [...document.styleSheets].flatMap((s) =>
      [...s.cssRules]
        .filter((r) => r instanceof CSSFontFaceRule)
        .map((r) => (r as CSSFontFaceRule).style.getPropertyValue('font-family').replace(/['"]/g, '')),
    ),
  );
  expect([...new Set(faces)].sort()).toEqual(['Figtree', 'Onest']);

  // And the faces the page shows above the fold have loaded.
  for (const font of ['800 16px Figtree', '400 16px Onest']) {
    const loaded = await page.evaluate(async (f) => (await document.fonts.load(f)).length, font);
    expect(loaded, font).toBeGreaterThan(0);
  }
});
