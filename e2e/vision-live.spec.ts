import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open } from './support/open';

/**
 * The vision filter (#56) on 1.4.1, 1.4.11, 1.4.3 and 1.3.3's live examples and labs, in the
 * built site. The Broken stages are operated only through simulated input over inert, hidden
 * markup (ADR 0002); the Fixed stages take real keys and the same bar. Expected ratios are from
 * a real run in the light theme; the unit tests check them against hand-worked values.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const PAGES = ['/criteria/1.4.1/', '/criteria/1.4.11/', '/criteria/1.4.3/', '/criteria/1.3.3/'];

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const cues = (stage: Locator) => stage.locator('.vis-log li');
const seenIn = (stage: Locator) => stage.locator('.vis-log__now');
const example = (stage: Locator) => stage.locator('.live__example');

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the four pages show their static examples, with no input bar', async ({ page }) => {
    await page.goto('/criteria/1.4.1/');
    await expect(broken(page)).toContainText('Links are blue text and nothing else.');
    await page.goto('/criteria/1.4.3/');
    await expect(broken(page)).toContainText('4242 4242 4242 4242');
    for (const url of PAGES) {
      await page.goto(url);
      await expect(page.locator('.inbar'), url).toHaveCount(0);
    }
  });
});

test.describe('1.4.1', () => {
  test('the Broken links are lost through the filters, under simulated input', async ({ page }) => {
    await open(page, '/criteria/1.4.1/');
    const stage = broken(page);
    await expect(example(stage)).toHaveAttribute('aria-hidden', 'true');
    await expect(example(stage)).toHaveAttribute('inert', '');
    await expect(seenIn(stage)).toHaveText('Seen in: Full colour');

    await key(stage, 'Vision filter').click();
    await expect(example(stage)).toHaveCSS('filter', 'grayscale(1)');
    await expect(seenIn(stage)).toHaveText('Seen in: Greyscale');
    await expect(cues(stage)).toHaveText([
      '✕ The link “delivery schedule”: 1.32 : 1 against the text around it, needs 3 : 1. Lost.',
      '✕ The link “returns policy”: 1.32 : 1 against the text around it, needs 3 : 1. Lost.',
    ]);
    await expect(stage.locator('[aria-live="polite"]')).toHaveText(
      'Vision filter: greyscale. The link “delivery schedule”: 1.32 : 1 against the text around ' +
        'it, needs 3 : 1. Lost. The link “returns policy”: 1.32 : 1 against the text around it, ' +
        'needs 3 : 1. Lost.',
    );

    await key(stage, 'Vision filter').click();
    await expect(seenIn(stage)).toHaveText('Seen in: No red cones (protanopia)');
    await expect(example(stage)).toHaveAttribute('style', /url\("?#vis.*-protanopia"?\)/);
    await expect(cues(stage).first()).toContainText('1.79 : 1');

    // Hue is the whole difference: the broken links are not even links to a screen reader.
    expect(await example(stage).locator('a').count()).toBe(0);
  });

  test('the Fixed links stand out by their underline, and take real focus', async ({
    page,
  }) => {
    await open(page, '/criteria/1.4.1/');
    const stage = fixed(page);
    await key(stage, 'Vision filter').click();
    await expect(cues(stage)).toHaveText([
      '✓ The link “delivery schedule”: 1.32 : 1 against the text around it, and underlined. Stands out.',
      '✓ The link “returns policy”: 1.32 : 1 against the text around it, and underlined. Stands out.',
    ]);
    // Real links: the reader's own Tab reaches them.
    await stage.getByRole('link', { name: 'delivery schedule' }).focus();
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('link', { name: 'returns policy' })).toBeFocused();
  });

  // Design guide §7: only opacity, transform and colour animate, so the filter switches at once.
  test('the filter switches instantly, in every motion mode', async ({ page }) => {
    await open(page, '/criteria/1.4.1/');
    await expect(example(broken(page))).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('.lab-slot .vis-lab [data-lab-mock]')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'));
    await expect(example(broken(page))).toHaveCSS('transition-duration', '0s');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, '/criteria/1.4.1/');
    await expect(example(fixed(page))).toHaveCSS('transition-duration', '0s');
    const lab = page.locator('.lab-slot .vis-lab [data-lab-mock]');
    await expect(lab).toHaveCSS('transition-duration', '0s');
  });

  test('in the lab, greyscale goes on the mock and the error is still lost', async ({ page }) => {
    await open(page, '/criteria/1.4.1/');
    const lab = page.locator('.lab-slot .vis-lab');
    await lab.getByRole('radio', { name: 'Greyscale', exact: true }).check();
    await expect(lab.locator('[data-lab-mock]')).toHaveCSS('filter', 'grayscale(1)');
    await expect(lab.locator('.vis-cues li').nth(1)).toContainText(
      'The field in error: 2.28 : 1 against the field beside it, needs 3 : 1. Lost.',
    );
  });
});

test.describe('1.4.11', () => {
  test('the Broken edges are lost and the Fixed ones stand out', async ({ page }) => {
    await open(page, '/criteria/1.4.11/');
    await key(broken(page), 'Vision filter').click();
    await expect(cues(broken(page))).toHaveText([
      '✕ The field’s edge: 1.19 : 1 against the background, needs 3 : 1. Lost.',
      '✕ The checkbox’s edge: 1.19 : 1 against the background, needs 3 : 1. Lost.',
    ]);
    const stage = fixed(page);
    await key(stage, 'Vision filter').click();
    await expect(cues(stage)).toHaveText([
      '✓ The field’s edge: 5.40 : 1 against the background. Stands out.',
      '✓ The checkbox’s edge: 5.40 : 1 against the background. Stands out.',
    ]);
    // The fixed checkbox is real: Tab to it and Space ticks it.
    await key(stage, 'Press Tab').click();
    await page.keyboard.press('Tab');
    const box = stage.getByRole('checkbox', { name: 'Email me order updates' });
    await expect(box).toBeFocused();
    await page.keyboard.press('Space');
    await expect(box).toBeChecked();
  });
});

test.describe('1.4.3', () => {
  test('the faded text is lost under every filter; the solid text stands out', async ({ page }) => {
    await open(page, '/criteria/1.4.3/');
    await key(broken(page), 'Vision filter').click();
    await expect(cues(broken(page)).first()).toHaveText(
      '✕ The card number: 2.74 : 1 against the background, needs 4.5 : 1. Lost.',
    );
    await key(fixed(page), 'Vision filter').click();
    await expect(cues(fixed(page)).first()).toHaveText(
      '✓ The card number: 7.81 : 1 against the background. Stands out.',
    );
  });
});

test.describe('1.3.3', () => {
  test('the Broken instruction loses its green button under the filter and read aloud', async ({
    page,
  }) => {
    await open(page, '/criteria/1.3.3/');
    const stage = broken(page);
    await key(stage, 'Vision filter').click();
    await expect(cues(stage)).toHaveText([
      '✕ The green button: 1.56 : 1 against the red button, needs 3 : 1. Lost.',
    ]);
    await key(stage, 'Read it aloud').click();
    // Read aloud, nothing on the page is round or green, and "on the left" has no meaning.
    await expect(stage.locator('.alog:not(.vis-log) li')).toHaveText([
      'Fill in the panel on the left, then press the round green button below it to continue.',
      'Delivery details 12 Acacia Avenue, Leeds',
      'Save for later, button',
      'Continue to payment, button',
    ]);
  });

  test('the Fixed instruction names the button, which survives the filter', async ({ page }) => {
    await open(page, '/criteria/1.3.3/');
    const stage = fixed(page);
    await key(stage, 'Vision filter').click();
    await expect(cues(stage)).toHaveText([
      '✓ The green button: 1.56 : 1 against the red button, and named in the instruction. Stands out.',
    ]);
    await key(stage, 'Press Tab').click();
    await expect(stage.getByRole('button', { name: 'Save for later' })).toBeFocused();
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const url of PAGES) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations with the vision filter on (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      for (const stage of [broken(page), fixed(page)]) {
        await key(stage, 'Vision filter').click();
        await expect(seenIn(stage)).toHaveText('Seen in: Greyscale');
      }
      const lab = page.locator('.lab-slot .vis-lab');
      if ((await lab.count()) > 0) {
        await lab.getByRole('radio', { name: 'Greyscale', exact: true }).check();
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
