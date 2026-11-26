import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 3.3.7 and 3.3.8's live examples and labs (#60), in the built site. The Broken checkout and
 * sign-in are operated only through simulated input over inert, hidden markup (ADR 0002); the
 * Fixed ones take real keys and the same input bar. The labs' verdicts are covered by
 * `e2e/labs/`; this file checks what the stages and the labs show.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const REENTRY = '/criteria/3.3.7/';
const AUTH = '/criteria/3.3.8/';
const OFFERED = 'Same as delivery: 12 Cotton Row, Leeds, checkbox';

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const log = (stage: Locator) => stage.locator('.alog li');
const focusInside = (stage: Locator) =>
  stage.locator('.live__example').evaluate((el) => el.contains(document.activeElement));
/** Whether the example cancels a paste into the field, as a page that blocks paste does. */
const pasteBlocked = (field: Locator) =>
  field.evaluate((el) => {
    const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    return !el.dispatchEvent(paste);
  });

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 3.3.7 and 3.3.8 stages are the static examples, with no input bar', async ({ page }) => {
    await page.goto(REENTRY);
    await expect(broken(page)).toContainText('Step 4 — Billing address');
    await expect(fixed(page)).toContainText('Same as delivery');
    await expect(page.locator('.inbar')).toHaveCount(0);
    await page.goto(AUTH);
    await expect(broken(page)).toContainText('paste disabled');
    await expect(fixed(page)).toContainText('sign in with a passkey');
    await expect(page.locator('.inbar')).toHaveCount(0);
  });
});

test.describe('3.3.7', () => {
  test('the Broken billing step asks for the address again, under simulated input', async ({ page }) => {
    await open(page, REENTRY);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('aria-hidden', 'true');
    await expect(example).toHaveAttribute('inert', '');

    await key(stage, 'Press Tab').click();
    await expect(log(stage)).toHaveText(['Billing address, edit text']);
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    // Space in a text field changes nothing a screen reader hears; the field stays empty.
    await key(stage, 'Space').click();
    await expect(log(stage)).toHaveText(['Billing address, edit text']);
    await key(stage, 'Press Tab').click();
    await expect(log(stage).last()).toHaveText('Pay now, button');
    expect(await focusInside(stage)).toBe(false);
    await expect(stage.locator('[aria-live="polite"]')).toHaveText('Screen reader says: Pay now, button');
  });

  test('the Fixed billing step offers the address back, and asks only when unticked', async ({ page }) => {
    await open(page, REENTRY);
    const stage = fixed(page);
    const same = stage.getByRole('checkbox', { name: /Same as delivery/ });
    await expect(stage.getByRole('textbox')).toHaveCount(0);

    await key(stage, 'Press Tab').click();
    await expect(same).toBeFocused();
    await expect(log(stage)).toHaveText([`${OFFERED}, checked`]);

    // A real Space unticks it; only then is a different address asked for.
    await page.keyboard.press('Space');
    await expect(log(stage).last()).toHaveText(`${OFFERED}, not checked`);
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('textbox', { name: 'Billing address' })).toBeFocused();
    await expect(log(stage).last()).toHaveText('Billing address, edit text');

    // The bar ticks it again, and the field goes.
    await key(stage, 'Shift+Tab').click();
    await key(stage, 'Space').click();
    await expect(same).toBeChecked();
    await expect(stage.getByRole('textbox')).toHaveCount(0);
  });

  test('in the lab, the billing step shows what the reader chose', async ({ page }) => {
    await open(page, REENTRY);
    const lab = page.locator('.lab-slot .re-lab');
    const next = lab.getByRole('button', { name: 'Next step' });
    await next.click();
    await next.click();
    await expect(lab.locator('.flab__screen')).toHaveText(
      'Step 3 of 3: Billing address, asked for again. 20 characters to type a second time.',
    );
    // At the last step Next stays focusable and does nothing.
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(next).toBeFocused();
    await expect(lab.locator('.flab__screen')).toContainText('Step 3 of 3');
    await lab.getByRole('radio', { name: 'Offered for reuse' }).check();
    await expect(lab.locator('[data-lab-mock]')).toContainText('☑ Same as delivery: 12 Cotton Row, Leeds');
    await expect(lab.locator('.lab-verdict')).toHaveText('3.3.7 passes');
  });
});

test.describe('3.3.8', () => {
  test('the Broken sign-in blocks paste and adds a puzzle, under simulated input', async ({ page }) => {
    await open(page, AUTH);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('inert', '');
    expect(await pasteBlocked(example.locator('input[type="password"]'))).toBe(true);

    await key(stage, 'Press Tab').click();
    await key(stage, 'Press Tab').click();
    await expect(log(stage)).toHaveText([
      'Password, edit text, Paste is turned off for your security.',
      'Letters, edit text',
    ]);
    await key(stage, 'Read it aloud').click();
    await expect(log(stage)).toContainText(['Security check, image']);
    expect(await focusInside(stage)).toBe(false);
  });

  test('the Fixed sign-in takes a pasted code, or a passkey that tests nothing', async ({ page }) => {
    await open(page, AUTH);
    const stage = fixed(page);
    const code = stage.getByRole('textbox', { name: 'Sign-in code' });
    expect(await pasteBlocked(code)).toBe(false);

    await key(stage, 'Press Tab').click();
    await expect(code).toBeFocused();
    await expect(log(stage)).toHaveText([
      'Sign-in code, edit text, We emailed you a code. Paste it, or let your browser fill it in.',
    ]);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: 'Use a passkey instead' })).toBeFocused();
    await key(stage, 'Enter').click();
    await expect(stage.getByRole('status')).toHaveText('This is a mock: no passkey is asked for.');
    await expect(log(stage).last()).toHaveText('This is a mock: no passkey is asked for.');
  });

  test('in the lab, a password manager fills only a field that allows paste', async ({ page }) => {
    await open(page, AUTH);
    const lab = page.locator('.lab-slot .auth-lab');
    const fill = lab.getByRole('button', { name: 'Fill from a password manager' });
    await fill.click();
    await expect(lab.locator('.flab__screen')).toHaveText('Paste blocked: the field is still empty.');
    await expect(lab.locator('[data-lab-mock]')).toContainText('✕ Paste blocked');
    await lab.getByRole('radio', { name: 'A password, paste allowed' }).check();
    await fill.click();
    await expect(lab.locator('.flab__screen')).toHaveText(
      'Filled from the password manager: 16 characters, none typed.',
    );
    await expect(lab.locator('[data-lab-mock]')).toContainText('•'.repeat(16));
    await expect(lab.locator('[data-lab-mock] input')).toHaveCount(0);
    await expect(lab.locator('.lab-verdict')).toHaveText('3.3.8 passes');
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const url of [REENTRY, AUTH]) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations after operating both stages and the lab (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      for (const stage of [broken(page), fixed(page)]) {
        await key(stage, 'Press Tab').click();
        await key(stage, 'Read it aloud').click();
      }
      const lab = page.locator('.lab-slot .flab');
      if (url === REENTRY) {
        // The fixed step unticked, so its billing field is scanned too; the lab at billing.
        await key(fixed(page), 'Space').click();
        await lab.getByRole('button', { name: 'Next step' }).click();
        await lab.getByRole('button', { name: 'Next step' }).click();
      } else {
        await lab.getByRole('button', { name: 'Fill from a password manager' }).click();
      }
      await lab.getByRole('radio').nth(2).check();
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
