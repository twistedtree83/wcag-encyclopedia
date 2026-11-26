import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Keyboard (#45): live examples and labs for 2.1.1, 2.1.2 and 2.1.4, in the shape of
 * `live-examples.spec.ts`. Each Broken stage is driven only through its input bar over inert,
 * hidden markup; each Fixed stage takes real keys as well as the bar. Instruments: the focus
 * tracker, the announcement log (2.1.1) and the key log (2.1.2, 2.1.4).
 *
 * The shared lab bar (verdicts by keyboard, Reset, axe, motion) is in `e2e/labs/`; this file
 * drives the labs' simulated keys and checks real focus is never trapped by the 2.1.2 lab.
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
const now = (stage: Locator) => stage.locator('.ftrack__now');
const trail = (stage: Locator) => stage.locator('.ftrack__trail li');
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
    ['/criteria/2.1.1/', '<div class="btn" onclick="…">'],
    ['/criteria/2.1.2/', 'Tab ⟲ cycles between these two, forever'],
    ['/criteria/2.1.4/', 'Bound at the document level'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('figure.stage')).toHaveCount(2);
      await expect(page.locator('main')).toContainText(text);
      await expect(page.locator('.inbar')).toHaveCount(0);
    });
  }
});

test.describe('2.1.1 Keyboard', () => {
  const URL = '/criteria/2.1.1/';

  test('Broken: Tab never reaches the div, so Enter adds nothing', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await key(stage, 'Press Tab').click();
    await key(stage, 'Press Tab').click();
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 1: Quantity, edit text, 1.');
    await expect(stage.locator('.ftrack__num text')).toHaveText(['1']);
    await key(stage, 'Enter').click();
    await key(stage, 'Space').click();
    await expect(stage.locator('.kb-count')).toHaveText('Basket: 0 items');
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await key(stage, 'Shift+Tab').click();
    await expect(lines(stage, 'Screen reader says')).toHaveText([
      'Quantity, edit text, 1',
      'Quantity, edit text, 1',
      'Quantity, edit text, 1',
    ]);
    await expectInertBroken(stage);
  });

  test('Fixed: real Tab and the bar reach the button, and Enter and Space press it', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Press Tab').click();
    await expect(stage.getByRole('textbox', { name: 'Quantity' })).toBeFocused();
    await page.keyboard.press('Tab');
    const add = stage.getByRole('button', { name: 'Add to basket' });
    await expect(add).toBeFocused();
    await expect(now(stage)).toHaveText('Focus is on stop 2 of 2: Add to basket, button.');
    await key(stage, 'Enter').click();
    await expect(stage.getByRole('status')).toHaveText('Basket: 1 item');
    await add.focus();
    await page.keyboard.press('Space');
    await expect(stage.getByRole('status')).toHaveText('Basket: 2 items');
  });
});

test.describe('2.1.2 No Keyboard Trap', () => {
  const URL = '/criteria/2.1.2/';

  test('Broken: Tab cycles Email and Subscribe, and Escape does nothing', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    for (let i = 0; i < 3; i++) await key(stage, 'Press Tab').click();
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 2: Email, edit text.');
    await expect(trail(stage)).toHaveText([
      '1 Email, edit text',
      '2 Subscribe, button',
      '1 Email, edit text',
    ]);
    await key(stage, 'Escape').click();
    await expect(lines(stage, 'Keys')).toHaveText([
      'Pressed Escape',
      'Focus: Email, edit text',
      'Nothing happened',
    ]);
    await expect(polite(stage)).toHaveText(
      'Pressed Escape on Email, edit text. Nothing happened.',
    );
    await expect(now(stage)).toHaveText('Focus is on stop 1 of 2: Email, edit text.');
    await key(stage, 'Enter').click();
    await expect(stage.locator('.trap')).toBeVisible();
    await expectInertBroken(stage);
  });

  test('Fixed: real Tab loops, and Escape lets focus out to the trigger', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    const email = stage.getByRole('textbox', { name: 'Email' });
    await key(stage, 'Press Tab').click();
    await expect(email).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(email).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(stage.getByRole('button', { name: 'Close' })).toBeFocused();

    await page.keyboard.press('Escape');
    const trigger = stage.getByRole('button', { name: 'Sign up for the newsletter' });
    await expect(trigger).toBeFocused();
    await expect(now(stage)).toHaveText(
      'Focus is on stop 1 of 1: Sign up for the newsletter, button.',
    );
    await expect(trail(stage)).toHaveText(['1 Sign up for the newsletter, button']);
    await expect(lines(stage, 'Keys')).toHaveText([
      'Pressed Escape',
      'Focus: Close, button',
      'Closed the newsletter',
    ]);

    // The bar does the same for a touch reader: Enter reopens it, Escape closes it again.
    await key(stage, 'Enter').click();
    await expect(email).toBeFocused();
    await key(stage, 'Escape').click();
    await expect(trigger).toBeFocused();
    await expect(polite(stage)).toHaveText(
      'Pressed Escape on Email, edit text. Closed the newsletter.',
    );
  });

  test('the lab traps only its drawing: real Tab always leaves it', async ({ page }) => {
    await open(page, URL);
    const lab = page.locator('.lab-slot .trap-lab');
    const hatch = lab.getByRole('button', { name: 'Take focus out of the widget' });
    for (const mode of ['Trap focus, no way out', 'Trap focus, Escape lets it out', 'No trap: Tab moves on']) {
      await lab.getByRole('radio', { name: mode }).check();
      await expect(hatch).toBeVisible();
      await lab.getByRole('radio', { name: mode }).focus();
      let left = false;
      for (let i = 0; i < 20 && !left; i++) {
        await page.keyboard.press('Tab');
        left = await lab.evaluate((el) => !el.contains(document.activeElement));
      }
      expect(left, `real focus left the lab (${mode})`).toBe(true);
    }
  });

  test('the lab: Tab loops the drawn trap, Escape and the hatch get out', async ({ page }) => {
    await open(page, URL);
    const lab = page.locator('.lab-slot .trap-lab');
    const press = (name: string) => lab.getByRole('button', { name, exact: true }).click();
    const where = lab.locator('.kb-last');
    for (let i = 0; i < 3; i++) await press('Press Tab');
    await expect(where).toHaveText('Simulated focus: Email field, inside the widget.');
    await press('Press Escape');
    await expect(where).toHaveText('Simulated focus: Email field, inside the widget.');
    await expect(lab.locator('.trap-mock .is-focus')).toHaveText('you@example.com');
    await press('Take focus out of the widget');
    await expect(where).toHaveText('Simulated focus: before the widget.');
    await expect(lab.locator('.lab-foot ~ [aria-live="polite"]')).toHaveText(
      'Simulated focus is back before the widget.',
    );

    await lab.getByRole('radio', { name: 'Trap focus, Escape lets it out' }).check();
    await press('Press Tab');
    await press('Press Escape');
    await expect(where).toHaveText('Simulated focus: the next link, after the widget.');
  });
});

test.describe('2.1.4 Character Key Shortcuts', () => {
  const URL = '/criteria/2.1.4/';

  test('Broken: dictation sets off the single-key shortcuts', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await key(stage, 'Dictate “send this”').click();
    await expect(lines(stage, 'Keys')).toHaveText([
      'Dictated “send this”',
      'Focus: no control',
      'Starred the message',
      'Archived the message',
      'Unstarred the message',
    ]);
    await expect(stage.locator('.sc-state')).toHaveText('Archived');
    // The message's status region changed last, so that is what the stage speaks (L-11's status
    // events); the key log above keeps every shortcut the phrase set off.
    await expect(polite(stage)).toHaveText('Screen reader says: Archived');
    await expectInertBroken(stage);
  });

  test('Broken: even typed into the reply box, s and e are eaten', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    await key(stage, 'Press Tab').click();
    await key(stage, 'Press Tab').click();
    await expect(now(stage)).toHaveText('Focus is on stop 2 of 2: Reply, edit text.');
    await key(stage, 'Dictate “send this”').click();
    await expect(stage.locator('input')).toHaveValue('nd thi');
    await expect(lines(stage, 'Keys').nth(1)).toHaveText('Focus: Reply, edit text');
  });

  test('Fixed: dictation types into the box; e archives only on the focused message', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Dictate “send this”').click();
    await expect(lines(stage, 'Keys')).toHaveText([
      'Dictated “send this”',
      'Focus: no control',
      'Nothing happened',
    ]);
    await key(stage, 'Press Tab').click();
    await key(stage, 'Press Tab').click();
    const reply = stage.getByRole('textbox', { name: 'Reply' });
    await expect(reply).toBeFocused();
    await key(stage, 'Dictate “send this”').click();
    await expect(reply).toHaveValue('send this');
    await expect(stage.getByRole('status')).toHaveText('In the inbox');

    await stage.getByRole('button', { name: 'Quarterly report' }).focus();
    await page.keyboard.press('e');
    await expect(stage.getByRole('status')).toHaveText('Archived');
    await expect(lines(stage, 'Keys')).toHaveText([
      'Pressed e',
      'Focus: Quarterly report, button',
      'Archived the message',
    ]);
  });

  test('the lab: dictation eats the e only while the shortcut is always on', async ({ page }) => {
    await open(page, URL);
    const lab = page.locator('.lab-slot .sc-lab');
    const dictate = lab.getByRole('button', { name: 'Dictate “see you there”' });
    await dictate.click();
    await expect(lab.locator('.sc-mock__reply')).toHaveText('s you thr');
    await expect(lab.locator('.kb-last')).toHaveText('Fired 4 times. The reply box got “s you thr”.');
    await lab.getByRole('radio', { name: 'e, only while the message has focus' }).check();
    await dictate.click();
    await expect(lab.locator('.sc-mock__reply')).toHaveText('see you there');
    await expect(lab.locator('.lab-foot ~ [aria-live="polite"]')).toHaveText(
      'Dictated “see you there”. The reply box got all of it. No shortcut fired.',
    );
  });
});

test('2.1.1 lab: Tab skips the div; the button is reached and pressed', async ({ page }) => {
  await open(page, '/criteria/2.1.1/');
  const lab = page.locator('.lab-slot .kb-lab');
  const press = (name: string) => lab.getByRole('button', { name, exact: true }).click();
  await press('Press Tab');
  await expect(lab.locator('.kb-last')).toHaveText('Tab: focus skipped it. It is not a Tab stop.');
  await expect(lab.locator('.alog li')).toHaveText(['Add to basket']);
  await lab.getByRole('radio', { name: 'A real button' }).check();
  await press('Press Tab');
  await expect(lab.locator('.kb-mock .is-focus')).toHaveText('Add to basket');
  await press('Press Enter');
  await expect(lab.locator('.kb-last')).toHaveText('Enter: added. Basket: 1 item.');
  await expect(lab.locator('.alog li')).toHaveText(['Add to basket, button']);
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

const PAGES = [
  { url: '/criteria/2.1.1/', keys: ['Press Tab', 'Press Tab', 'Enter'], lab: '.kb-lab' },
  { url: '/criteria/2.1.2/', keys: ['Press Tab', 'Escape'], lab: '.trap-lab' },
  { url: '/criteria/2.1.4/', keys: ['Press Tab', 'Dictate “send this”'], lab: '.sc-lab' },
] as const;

for (const { url, keys, lab } of PAGES) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations in every lab state (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      for (const stage of [broken(page), fixed(page)]) {
        for (const name of keys) await key(stage, name).click();
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
      const l = page.locator(`.lab-slot ${lab}`);
      for (const radio of await l.getByRole('radio').all()) {
        await radio.check();
        await scan();
      }
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  }
}
