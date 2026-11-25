import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Language and status messages (#51): the live examples and labs for 3.1.1, 3.1.2 and 4.1.3.
 * Each Broken stage is operated only through its input bar over inert, hidden markup; each Fixed
 * stage takes real input and the same bar. The announcement log under each stage names the
 * voice each line is read in (3.1.x), or shows the status message announced while focus stays
 * on the button (4.1.3). The labs' verdicts, Reset and motion are covered by `labs.spec.ts`.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const DEFAULT = '(German voice, the reader’s default)';

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const log = (scope: Locator) => scope.locator('.alog li');

async function expectInert(stage: Locator) {
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, bad, good] of [
    ['/criteria/3.1.1/', '<html>', '<html lang="en">'],
    ['/criteria/3.1.2/', 'Défense d’afficher', 'Défense d’afficher'],
    ['/criteria/4.1.3/', '— nothing —', '"Added. 4 items in basket."'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url);
      await expect(broken(page)).toContainText(bad);
      await expect(fixed(page)).toContainText(good);
      await expect(page.locator('.inbar')).toHaveCount(0);
    });
  }
});

test.describe('3.1.1 live examples', () => {
  test('the page with no lang is read in the reader’s default voice, by simulated input', async ({
    page,
  }) => {
    await open(page, '/criteria/3.1.1/');
    const stage = broken(page);
    await key(stage, 'Read it aloud').click();
    await expect(log(stage)).toHaveText([
      `Opening hours ${DEFAULT}`,
      `Monday to Friday, nine till five. ${DEFAULT}`,
    ]);
    await expectInert(stage);
    await expect(stage.locator('[aria-live="polite"]')).toHaveText(
      'Screen reader says: Opening hours; Monday to Friday, nine till five.',
    );
  });

  test('the page with lang="en" is read in an English voice, from the keyboard', async ({
    page,
  }) => {
    await open(page, '/criteria/3.1.1/');
    const stage = fixed(page);
    await key(stage, 'Read it aloud').focus();
    await page.keyboard.press('Enter');
    await expect(log(stage)).toHaveText([
      'Opening hours (English voice)',
      'Monday to Friday, nine till five. (English voice)',
    ]);
    // The real page's own language is never touched.
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
  });
});

test.describe('3.1.2 live examples', () => {
  test('the unmarked phrase stays in the English voice', async ({ page }) => {
    await open(page, '/criteria/3.1.2/');
    const stage = broken(page);
    await key(stage, 'Read it aloud').click();
    await expect(log(stage)).toHaveText([
      'The sign on the door still read Défense d’afficher , which nobody obeyed. (English voice)',
    ]);
    await expectInert(stage);
  });

  test('the marked phrase switches to a French voice and back', async ({ page }) => {
    await open(page, '/criteria/3.1.2/');
    const stage = fixed(page);
    await key(stage, 'Read it aloud').focus();
    await page.keyboard.press('Space');
    await expect(log(stage)).toHaveText([
      'The sign on the door still read (English voice)',
      'Défense d’afficher (French voice)',
      ', which nobody obeyed. (English voice)',
    ]);
  });
});

test.describe('4.1.3 live examples', () => {
  test('the silent basket updates, and nothing is announced', async ({ page }) => {
    await open(page, '/criteria/4.1.3/');
    const stage = broken(page);
    await key(stage, 'Press Tab').click();
    await expect(log(stage)).toHaveText(['Add to basket, button']);
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');

    await key(stage, 'Enter').click();
    await expect(stage.locator('.live__example')).toContainText('Basket (4)');
    // The count changed, and the log heard nothing: no status message.
    await page.waitForTimeout(300);
    await expect(log(stage)).toHaveText(['Add to basket, button']);
    await expectInert(stage);
  });

  test('the announced basket says the message while focus stays on the button', async ({
    page,
  }) => {
    await open(page, '/criteria/4.1.3/');
    const stage = fixed(page);
    const add = stage.locator('.live__example').getByRole('button', { name: 'Add to basket' });

    await key(stage, 'Press Tab').click();
    await expect(add).toBeFocused();
    await expect(log(stage)).toHaveText(['Add to basket, button']);

    // A real Enter: the status region speaks, and focus never moves.
    await page.keyboard.press('Enter');
    await expect(log(stage)).toHaveText(['Add to basket, button', 'Added. 4 items in basket.']);
    await expect(add).toBeFocused();

    // The bar's Enter does the same for a touch reader.
    await key(stage, 'Enter').click();
    await expect(log(stage).last()).toHaveText('Added. 5 items in basket.');
    await expect(stage.getByRole('status')).toHaveText('Added. 5 items in basket.');
  });
});

test.describe('labs', () => {
  test('3.1.1: the log names the voice for each lang', async ({ page }) => {
    await open(page, '/criteria/3.1.1/');
    const lab = page.locator('.lab-slot .lang-lab');
    await expect(log(lab).first()).toHaveText(`Opening hours, heading, level 4 ${DEFAULT}`);
    await lab.getByRole('radio', { name: 'None', exact: true }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(log(lab).first()).toHaveText('Opening hours, heading, level 4 (English voice)');
    await page.keyboard.press('ArrowDown');
    await expect(log(lab).first()).toHaveText('Opening hours, heading, level 4 (French voice)');
    await expect(lab.locator('.lab-verdict')).toHaveText('3.1.1 fails');
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
  });

  test('3.1.2: the log switches voices for the marked phrase', async ({ page }) => {
    await open(page, '/criteria/3.1.2/');
    const lab = page.locator('.lab-slot .lang-lab');
    await expect(log(lab)).toHaveCount(1);
    await lab.getByRole('checkbox', { name: 'Mark the phrase lang="fr"' }).focus();
    await page.keyboard.press('Space');
    await expect(log(lab)).toHaveText([
      'The sign on the door still read (English voice)',
      'Défense d’afficher (French voice)',
      ', which nobody obeyed. (English voice)',
    ]);
  });

  test('4.1.3: plain text is not announced; a status region is', async ({ page }) => {
    await open(page, '/criteria/4.1.3/');
    const lab = page.locator('.lab-slot .status-lab');
    const press = lab.getByRole('button', { name: 'Press Add to basket' });
    await press.focus();
    await page.keyboard.press('Enter');
    await expect(lab.locator('[aria-live="polite"]')).toHaveText(
      'Screen reader says nothing. Focus stayed on Add to basket.',
    );
    await expect(lab.locator('.alog__empty')).toHaveText('Nothing announced yet.');
    await expect(press).toBeFocused();

    await lab.getByRole('checkbox', { name: 'Put the message in a status region' }).check();
    await press.click();
    await expect(log(lab)).toHaveText(['Added. 5 items in basket.']);
    await expect(lab.locator('.lab-verdict')).toHaveText('4.1.3 passes');
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

/** Each page, how to operate both live stages, and each lab state to scan. */
const PAGES: {
  url: string;
  keys: string[];
  states: ((lab: Locator, page: Page) => Promise<void>)[];
  lab: string;
}[] = [
  {
    url: '/criteria/3.1.1/',
    keys: ['Read it aloud'],
    lab: '.lab-slot .lang-lab',
    states: [
      async (lab) => lab.getByRole('radio', { name: 'lang="en"' }).check(),
      async (lab) => lab.getByRole('radio', { name: 'lang="fr"' }).check(),
    ],
  },
  {
    url: '/criteria/3.1.2/',
    keys: ['Read it aloud'],
    lab: '.lab-slot .lang-lab',
    states: [async (lab) => lab.getByRole('checkbox', { name: 'Mark the phrase lang="fr"' }).check()],
  },
  {
    url: '/criteria/4.1.3/',
    keys: ['Press Tab', 'Enter', 'Read it aloud'],
    lab: '.lab-slot .status-lab',
    states: [
      async (lab) => lab.getByRole('button', { name: 'Press Add to basket' }).click(),
      async (lab) => {
        await lab.getByRole('checkbox', { name: 'Put the message in a status region' }).check();
        await lab.getByRole('button', { name: 'Press Add to basket' }).click();
      },
    ],
  },
];

for (const p of PAGES) {
  for (const mode of MODES) {
    test(`${p.url} has no violations in every live and lab state (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, p.url);
      const scan = async (when: string) => {
        const results = await new AxeBuilder({ page })
          .withTags(TAGS)
          .exclude('[data-depicts-failure]')
          .analyze();
        expect(results.violations.map((v) => `${when}: ${v.id}: ${v.help}`)).toEqual([]);
      };
      await scan('start');
      for (const stage of [broken(page), fixed(page)]) {
        for (const k of p.keys) await key(stage, k).click();
      }
      const lab = page.locator(p.lab);
      for (const [i, state] of p.states.entries()) {
        await state(lab, page);
        await scan(`lab state ${i + 1}`);
      }
      if (mode.width === 320) {
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflows).toBe(false);
      }
    });
  }
}
