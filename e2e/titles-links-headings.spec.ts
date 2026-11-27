import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open } from './support/open';

/**
 * 2.4.2, 2.4.4 and 2.4.6 (#50): live examples and labs. The Broken stages are operated only
 * through the input bar over inert, hidden markup; the Fixed stages take real keys and the same
 * bar. The announcement log under each stage says the tab switch, links list or headings list.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const log = (stage: Locator) => stage.locator('.alog li');
const said = (stage: Locator) => stage.locator('[aria-live="polite"]');

async function expectInert(stage: Locator) {
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, bad, good] of [
    ['/criteria/2.4.2/', 'Acme', 'Basket (3) — Acme'],
    ['/criteria/2.4.4/', 'read more', 'Read the annual report 2025'],
    ['/criteria/2.4.6/', 'Information', 'Returns and refunds'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url);
      await expect(broken(page)).toContainText(bad);
      await expect(fixed(page)).toContainText(good);
      await expect(page.locator('.inbar')).toHaveCount(0);
    });
  }
});

test.describe('2.4.2', () => {
  test('Switch tab says each title, and draws its cursor on the tab', async ({ page }) => {
    await open(page, '/criteria/2.4.2/');
    const bad = broken(page);
    await key(bad, 'Switch tab').click();
    await key(bad, 'Switch tab').click();
    await expect(log(bad)).toHaveText(['Acme', 'Acme']);
    await expect(bad.locator('[data-sim-on]')).toHaveCount(1);
    await expect(bad.locator('.tabs__tab').nth(1)).toHaveAttribute('data-sim-on', '');
    await expect(said(bad)).toHaveText('Screen reader says: Acme');
    await expectInert(bad);

    const good = fixed(page);
    for (let i = 0; i < 3; i++) await key(good, 'Switch tab').click();
    await expect(log(good)).toHaveText(['Basket (3) — Acme', 'Delivery — Acme', 'Order confirmed — Acme']);
    // It wraps back to the first tab.
    await key(good, 'Switch tab').click();
    await expect(log(good).last()).toHaveText('Basket (3) — Acme');
  });
});

test.describe('2.4.4', () => {
  test('the Broken links are reached by simulated Tab and listed out of context', async ({ page }) => {
    await open(page, '/criteria/2.4.4/');
    const stage = broken(page);
    await key(stage, 'Press Tab').click();
    await expect(log(stage)).toHaveText(['read more, link']);
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await key(stage, 'List the links').click();
    await expect(log(stage)).toHaveText([
      'read more, link',
      'read more, link',
      'read more, link',
      'read more, link',
    ]);
    await expectInert(stage);
  });

  test('the Fixed links take real focus and stay on the page', async ({ page }) => {
    await open(page, '/criteria/2.4.4/');
    const stage = fixed(page);
    await key(stage, 'Press Tab').click();
    const first = stage.getByRole('link', { name: 'Read the annual report 2025' });
    await expect(first).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('link', { name: 'Read the board minutes for March' })).toBeFocused();
    await expect(log(stage)).toHaveText([
      'Read the annual report 2025, link',
      'Read the board minutes for March, link',
    ]);
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).pathname).toBe('/criteria/2.4.4/');
    await key(stage, 'List the links').click();
    await expect(log(stage)).toHaveText([
      'Read the board minutes for March, link',
      'Read the annual report 2025, link',
      'Read the board minutes for March, link',
      'Read the sustainability update, link',
    ]);
  });
});

test.describe('2.4.6', () => {
  test('the Broken headings are listed, and its field is reached by simulated Tab', async ({
    page,
  }) => {
    await open(page, '/criteria/2.4.6/');
    const stage = broken(page);
    await key(stage, 'List the headings').click();
    await expect(log(stage)).toHaveText([
      'More, heading, level 3',
      'Information, heading, level 4',
      'Details, heading, level 4',
    ]);
    await key(stage, 'Press Tab').click();
    await expect(log(stage).last()).toHaveText('Enter your details here, edit text');
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await expectInert(stage);
  });

  test('the Fixed field takes real focus and is said by its label', async ({ page }) => {
    await open(page, '/criteria/2.4.6/');
    const stage = fixed(page);
    await key(stage, 'Press Tab').click();
    await expect(stage.getByRole('textbox', { name: 'Order number' })).toBeFocused();
    await key(stage, 'List the headings').click();
    await expect(log(stage)).toHaveText([
      'Order number, edit text',
      'Returns and refunds, heading, level 3',
      'How long you have, heading, level 4',
      'What it costs, heading, level 4',
    ]);
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

/** Each page, the bar keys to press on both stages, and how to bring its lab to passing. */
const PAGES: { url: string; keys: string[]; lab: string; toPass: (lab: Locator, page: Page) => Promise<void> }[] = [
  {
    url: '/criteria/2.4.2/',
    keys: ['Switch tab'],
    lab: '.title-lab',
    toPass: async (lab, page) => {
      await lab.getByRole('radio', { name: 'Generic: “Acme”' }).focus();
      await page.keyboard.press('ArrowDown');
    },
  },
  {
    url: '/criteria/2.4.4/',
    keys: ['Press Tab', 'List the links'],
    lab: '.link-lab',
    toPass: async (lab, page) => {
      await lab.getByRole('radio', { name: 'None: the link stands alone' }).focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
  },
  {
    url: '/criteria/2.4.6/',
    keys: ['Press Tab', 'List the headings'],
    lab: '.headings-lab',
    toPass: async (lab, page) => {
      await lab.getByRole('radio', { name: '“More”, “Information”, “Details”' }).focus();
      await page.keyboard.press('ArrowDown');
      await lab.getByRole('radio', { name: '“Enter your details here”' }).focus();
      await page.keyboard.press('ArrowDown');
    },
  },
];

for (const p of PAGES) {
  for (const mode of MODES) {
    test(`${p.url} has no accessibility violations after operating it (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, p.url);
      for (const stage of [broken(page), fixed(page)]) {
        for (const name of p.keys) await key(stage, name).click();
      }
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
      const lab = page.locator(`.lab-slot ${p.lab}`);
      await p.toPass(lab, page);
      await scan();
      if (mode.width === 320) {
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflows).toBe(false);
      }
    });
  }
}

test('Switch tab is instant under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/criteria/2.4.2/');
  const tab = broken(page).locator('.tabs__tab').first();
  expect(await tab.evaluate((el) => getComputedStyle(el).transitionDuration)).toMatch(/^0s(, 0s)*$/);
});
