import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 2.4.1, 2.4.3 and 2.4.11 (#46): live examples under the focus tracker, and the 2.4.3 flagship
 * lab's URL state. The shared lab bar (verdicts by keyboard, Reset, axe, motion) for all three
 * labs is in `labs.spec.ts`.
 *
 *   2.4.1   a shop page with an eight-link menu. Broken has no skip link; Fixed has one, and
 *           Enter on it puts focus on the article.
 *   2.4.3   a filters dialog. Broken leaves focus behind it; Fixed moves focus in and back out.
 *   2.4.11  a scrolling checkout with a sticky header. Broken lets a field scroll under it on the
 *           way back up; Fixed reserves room with scroll-padding-top.
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
const press = async (stage: Locator, name: string, times = 1) => {
  for (let i = 0; i < times; i++) await key(stage, name).click();
};
const now = (stage: Locator) => stage.locator('.ftrack__now');
const trail = (stage: Locator) => stage.locator('.ftrack__trail li');

/** The fail stage is inert, hidden from assistive technology, and never holds real focus. */
async function expectSimulated(stage: Locator) {
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, text] of [
    ['/criteria/2.4.1/', 'Sub-nav ×9'],
    ['/criteria/2.4.3/', 'Dialog, on top, ignored by the keyboard'],
    ['/criteria/2.4.11/', 'Focused field, underneath'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url);
      await expect(broken(page)).toContainText(text);
      await expect(page.locator('.inbar')).toHaveCount(0);
      await expect(page.locator('.ftrack')).toHaveCount(0);
    });
  }
});

test.describe('2.4.1', () => {
  const URL = '/criteria/2.4.1/';

  test('Broken: every menu link is a Tab press before the article', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await press(stage, 'Press Tab');
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 9: Home, link.');
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await press(stage, 'Press Tab', 8);
    await expect(now(stage)).toHaveText('Focus is on stop 9 of 9: Read the buying guide, link.');
    // Enter on a link that goes nowhere: the page stays put.
    await press(stage, 'Enter');
    await expect(page).toHaveURL(/\/criteria\/2\.4\.1\/$/);
    await expectSimulated(stage);
  });

  // Review finding 5: two presses that land before React re-renders must both move focus. Two
  // clicks in one task is the fastest a reader (or a loaded machine) can press.
  test('Broken: two Tab presses before a re-render move focus two stops', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await key(stage, 'Press Tab').evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    await expect(now(stage)).toHaveText('Focus is on stop 2 of 9: Women, link.');
  });

  test('Fixed: one Tab and Enter reach the article, by the bar and by real keys', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = fixed(page);
    const article = stage.getByRole('link', { name: 'Read the buying guide' });
    await press(stage, 'Press Tab');
    await expect(stage.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await press(stage, 'Enter');
    await expect(article).toBeFocused();
    await expect(now(stage)).toHaveText('Focus is on stop 10 of 10: Read the buying guide, link.');
    await expect(trail(stage)).toHaveText([
      '1 Skip to content, link',
      '10 Read the buying guide, link',
    ]);

    await stage.getByRole('link', { name: 'Skip to content' }).focus();
    await page.keyboard.press('Enter');
    await expect(article).toBeFocused();
    await expect(page).toHaveURL(/\/criteria\/2\.4\.1\/$/);
  });
});

test.describe('2.4.3', () => {
  const URL = '/criteria/2.4.3/';

  test('Broken: the dialog opens and simulated focus stays on the page behind it', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = broken(page);
    await press(stage, 'Press Tab');
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 4: Show filters, button.');
    await press(stage, 'Enter');
    await expect(stage.locator('.fd-dialog')).toBeVisible();
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 4: Show filters, button.');
    await press(stage, 'Press Tab');
    await expect(now(stage)).toHaveText('Focus is on stop 2 of 6: Boots, link.');
    // Boots is under the dialog: focus is on something the reader cannot see.
    const boots = (await stage.locator('.fd-page__list a').first().boundingBox())!;
    const dialog = (await stage.locator('.fd-dialog').boundingBox())!;
    expect(boots.y).toBeGreaterThanOrEqual(dialog.y);
    expect(boots.y + boots.height).toBeLessThanOrEqual(dialog.y + dialog.height);
    await expectSimulated(stage);
  });

  test('Fixed: focus goes into the dialog and comes back to the button that opened it', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = fixed(page);
    const opener = stage.getByRole('button', { name: 'Show filters' });
    await press(stage, 'Press Tab');
    await expect(opener).toBeFocused();
    await press(stage, 'Enter');
    const dialog = stage.getByRole('dialog', { name: 'Filters' });
    await expect(dialog.getByRole('button', { name: 'Apply' })).toBeFocused();
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 2: Apply, button.');
    await expect(stage.locator('.fd-page__body')).toHaveAttribute('inert', '');

    // Real keys: Tab stays in the dialog, Enter on Close returns focus to the opener.
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 4: Show filters, button.');
  });
});

test.describe('2.4.11', () => {
  const URL = '/criteria/2.4.11/';

  /** Whether the header covers the whole of the field. */
  const covered = (stage: Locator, name: string) =>
    stage.locator('.nob-box').evaluate((box, label) => {
      const bar = box.querySelector('.nob-box__bar')!.getBoundingClientRect();
      const field = Array.from(box.querySelectorAll('label'))
        .find((l) => l.textContent?.trim() === label)!
        .querySelector('input')!
        .getBoundingClientRect();
      return field.top >= bar.top && field.bottom <= bar.bottom;
    }, name);

  test('Broken: on the way back up, the focused field scrolls under the sticky header', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = broken(page);
    await press(stage, 'Press Tab', 5);
    await expect(now(stage)).toHaveText('Focus is on stop 5 of 5: Postcode, edit text.');
    await press(stage, 'Shift+Tab', 3);
    await expect(now(stage)).toHaveText('Focus is on stop 2 of 5: Email, edit text.');
    expect(await covered(stage, 'Email')).toBe(true);
    await expectSimulated(stage);
  });

  test('Fixed: scroll padding keeps the focused field clear of the header', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    await press(stage, 'Press Tab');
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    await expect(stage.getByRole('textbox', { name: 'Postcode' })).toBeFocused();
    for (let i = 0; i < 2; i++) await page.keyboard.press('Shift+Tab');
    await press(stage, 'Shift+Tab');
    await expect(stage.getByRole('textbox', { name: 'Email' })).toBeFocused();
    await expect(now(stage)).toHaveText('Focus is on stop 2 of 5: Email, edit text.');
    expect(await covered(stage, 'Email')).toBe(false);
  });

  test('the 2.4.11 demo is still on the page', async ({ page }) => {
    await open(page, URL);
    await expect(page.locator('figure.demo [id="obscured-2-4-11-caption"]')).toHaveCount(1);
  });
});

test.describe('the 2.4.3 lab', () => {
  const URL = '/criteria/2.4.3/';
  const lab = (page: Page) => page.locator('.lab-slot .fo-lab');
  const verdict = (l: Locator) => l.locator('.lab-verdict');
  const live = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');
  const numbers = (l: Locator) =>
    l.locator('.fo-part').evaluateAll((parts) =>
      Object.fromEntries(parts.map((p) => [p.textContent!.replace(/\d/g, '').trim(), p.getAttribute('data-focus')])),
    );

  test('the numbers on the mock follow the focus order, not the layout', async ({ page }) => {
    await open(page, URL);
    const l = lab(page);
    await l.getByRole('radio', { name: 'Row by row, as laid out' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(verdict(l)).toHaveText('2.4.3 fails');
    expect(await numbers(l)).toEqual({ Name: '1', Phone: '2', Email: '3', Postcode: '4', Send: '5' });
    await expect(l.locator('.fo-visits')).toHaveText('Name → Phone → Email → Postcode → Send');
    await expect(l.locator('.fo-part.is-off')).toHaveCount(2);
    // The grid keeps Email beside Name, above Phone, whatever the source says.
    // Measured in one go, so a page scroll can't land between the readings.
    const [name, email, phone] = await l.locator('.fo-mock').evaluate((mock) =>
      ['name', 'email', 'phone'].map((p) => {
        const r = mock.querySelector(`.fo-part--${p}`)!.getBoundingClientRect();
        return { x: r.x, top: r.top, bottom: r.bottom };
      }),
    );
    expect(email!.x).toBeGreaterThan(name!.x);
    expect(email!.bottom).toBeLessThanOrEqual(phone!.top);
  });

  test('state round-trips through the URL, and a preload is not announced', async ({ page }) => {
    await open(page, URL);
    const l = lab(page);
    const length = await page.evaluate(() => history.length);
    await l.getByRole('radio', { name: 'None' }).focus();
    await page.keyboard.press('ArrowUp');
    await expect(page).toHaveURL(/\?src=layout&ti=send$/);
    await l.getByRole('radio', { name: 'Row by row, as laid out' }).focus();
    await page.keyboard.press('ArrowUp');
    await expect(page).toHaveURL(/\?src=send-first&ti=send$/);
    expect(await page.evaluate(() => history.length)).toBe(length);

    await open(page, page.url());
    const shared = lab(page);
    await expect(shared.getByRole('radio', { name: 'Send button first' })).toBeChecked();
    await expect(shared.getByRole('radio', { name: 'tabindex="1" on Send' })).toBeChecked();
    await expect(verdict(shared)).toHaveText('2.4.3 fails');
    await page.waitForTimeout(800);
    await expect(live(shared)).toHaveText('');

    await shared.getByRole('button', { name: 'Reset' }).click();
    await expect(verdict(shared)).toHaveText('2.4.3 passes');
    await expect(page).toHaveURL(/\/criteria\/2\.4\.3\/$/);
  });

  test('a bad link still opens the lab at the start', async ({ page }) => {
    await open(page, URL + '?src=sideways&ti=9');
    await expect(verdict(lab(page))).toHaveText('2.4.3 passes');
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const url of ['/criteria/2.4.1/', '/criteria/2.4.3/', '/criteria/2.4.11/']) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations after operating both stages (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      for (const stage of [broken(page), fixed(page)]) {
        await press(stage, 'Press Tab');
        if (url.includes('2.4.3')) await press(stage, 'Enter');
        else await press(stage, 'Press Tab');
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
