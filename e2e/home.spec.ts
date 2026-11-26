import { test, expect, type Page } from '@playwright/test';

/**
 * Home (R-08, design guide §9.1): eight sections in order, each part working where it was
 * built for the other pages, and the layout at 1440px and 390px in both themes.
 */

const SECTIONS = [
  'Check a colour pair',
  'Done well, done badly',
  'Four principles',
  'The index',
  'Try it: fade the text',
  'Three contrast thresholds',
  'New in 2.2',
  'This site meets the criteria it explains.',
];

async function open(page: Page, url = '/') {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const overflows = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('before any script runs', () => {
  test.use({ javaScriptEnabled: false });

  test('the eight sections are in the markup, in order', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Every WCAG criterion, shown.');
    await expect(page.locator('main h2')).toHaveText(SECTIONS);
  });
});

test('logs no hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await open(page);
  expect(errors).toEqual([]);
});

test('skips no heading levels', async ({ page }) => {
  await open(page);
  const levels = await page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i]! - levels[i - 1]!, `heading ${i} skips a level`).toBeLessThanOrEqual(1);
  }
});

test('no element id appears twice, with two labs on the page', async ({ page }) => {
  await open(page);
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(duplicates).toEqual([]);
});

test('the hero stats come from the corpus', async ({ page }) => {
  await open(page);
  const stats = page.getByRole('list', { name: 'The encyclopedia in numbers' }).locator('li');
  await expect(stats).toHaveText(['55criteria', '31at Level A', '24at Level AA', '6new in 2.2']);
});

test('the hero colour check works', async ({ page }) => {
  await open(page);
  const check = page.locator('#hc');
  await expect(check.locator('.score')).toContainText('11.74');
  await check.getByLabel('Text colour hex code').fill('#FFFFFF');
  await expect(check.locator('.score')).not.toContainText('11.74');
});

test('Try it in the checker loads the bad pair into the hero check and focuses it', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('button', { name: /^Try it in the checker\s*: White on yellow$/ }).click();
  await expect(page.locator('#hc-fg')).toBeFocused();
  await expect(page.locator('#hc-fg')).toHaveValue('#FFFFFF');
});

test('each principle card is one link to All criteria filtered to that principle', async ({
  page,
}) => {
  await open(page);
  const cards = page.locator('.princ a');
  await expect(cards).toHaveCount(4);
  await expect(cards.locator('.mark')).toHaveText(['1', '2', '3', '4']);
  await expect(cards.locator('.shape')).toHaveCount(0);
  await cards.nth(1).click();
  await expect(page).toHaveURL(/\/criteria\/\?p=2$/);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
  await expect(page.getByRole('button', { name: 'Operable' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.count')).toHaveText('Showing 20 of 55 criteria.');
});

test('the index shows six cards, then every match once a filter is set', async ({ page }) => {
  await open(page);
  const index = page.locator('#index');
  await expect(index.locator('.grid > li')).toHaveCount(6);
  await expect(index.locator('.count')).toHaveText('Showing 6 of 55 criteria.');
  await expect(index.getByRole('link', { name: 'See all 55 criteria' })).toHaveAttribute(
    'href',
    'criteria/',
  );

  await index.getByRole('button', { name: 'Understandable' }).click();
  await expect(index.locator('.grid > li')).toHaveCount(13);
  await expect(index.locator('.count')).toHaveText('Showing 13 of 55 criteria.');
  await expect(index.getByRole('link', { name: 'See all 55 criteria' })).toHaveAttribute(
    'href',
    'criteria/?p=3',
  );

  await index.getByLabel('Search criteria').fill('zzzz');
  await expect(index.locator('.empty')).toBeVisible();
});

test('the fade lab works on Home', async ({ page }) => {
  await open(page);
  const lab = page.locator('#lab');
  const ratio = lab.locator('output');
  const before = await ratio.textContent();
  await lab.getByRole('slider', { name: 'Fade the text' }).fill('80');
  await expect(ratio).not.toHaveText(before!);
});

test('the contrast section says thresholds, not rules', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('heading', { name: 'Three contrast thresholds' })).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/contrast rules/i);
});

test('New in 2.2 links each of the six new criteria to its page', async ({ page }) => {
  await open(page);
  const cards = page.locator('.news a');
  await expect(cards).toHaveCount(6);
  await expect(cards.locator('.num')).toHaveText([
    '2.4.11',
    '2.5.7',
    '2.5.8',
    '3.2.6',
    '3.3.7',
    '3.3.8',
  ]);
  await cards.first().click();
  await expect(page).toHaveURL(/\/criteria\/2\.4\.11\/$/);
});

test.describe('layout, per the design guide', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`at 1440px in the ${theme} theme the check sits beside the hero text, principles four up`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await open(page);
      const text = (await page.locator('.hero .txt').boundingBox())!;
      const check = (await page.locator('#hc').boundingBox())!;
      expect(check.x).toBeGreaterThan(text.x + text.width - 1);
      const cards = page.locator('.princ li');
      const tops = await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
      expect(new Set(tops).size).toBe(1);
      const news = page.locator('.news li');
      const newsTops = await news.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().top)),
      );
      expect(new Set(newsTops).size).toBe(2);
      expect(await overflows(page)).toBe(false);
    });

    test(`at 390px in the ${theme} theme everything stacks with no sideways scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ colorScheme: theme });
      await open(page);
      const text = (await page.locator('.hero .txt').boundingBox())!;
      const check = (await page.locator('#hc').boundingBox())!;
      expect(check.y).toBeGreaterThan(text.y + text.height - 1);
      for (const list of ['.princ', '.thresholds', '.news', '.pairs']) {
        const lefts = await page
          .locator(`${list} > li`)
          .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)));
        expect(new Set(lefts).size, `${list} is not one column`).toBe(1);
      }
      await expect(page.locator('.loop')).toBeHidden();
      expect(await overflows(page)).toBe(false);
    });
  }

  test('keeps working at 200% zoom', async ({ page }) => {
    // 200% zoom on a 1280px screen presents as a 640px viewport.
    await page.setViewportSize({ width: 640, height: 512 });
    await open(page);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#hc')).toBeVisible();
    expect(await overflows(page)).toBe(false);
  });
});
