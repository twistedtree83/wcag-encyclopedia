import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 3.3.1 and 3.3.2's live examples and labs (#52), in the built site. The Broken forms are
 * operated only through simulated input over inert, hidden markup (ADR 0002); the Fixed forms
 * take real keys and the same input bar. The announcement log under each stage says what a screen
 * reader heard. The labs' verdicts are covered by `labs.spec.ts`; this file checks what they show.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const ERRORS = '/criteria/3.3.1/';
const LABELS = '/criteria/3.3.2/';
const INVALID_EMAIL = 'Email, edit text, invalid entry, Enter an address that includes a domain';

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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 3.3.1 and 3.3.2 stages are the static examples, with no input bar', async ({
    page,
  }) => {
    await page.goto(ERRORS);
    await expect(broken(page)).toContainText('Invalid input');
    await expect(fixed(page)).toContainText('1 problem');
    await expect(page.locator('.inbar')).toHaveCount(0);
    await page.goto(LABELS);
    await expect(fixed(page)).toContainText('For example, 27 3 1995');
    await expect(page.locator('.inbar')).toHaveCount(0);
  });
});

test.describe('3.3.1', () => {
  test('the Broken form says nothing about the error, under simulated input', async ({ page }) => {
    await open(page, ERRORS);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('aria-hidden', 'true');
    await expect(example).toHaveAttribute('inert', '');
    await expect(example.locator('.lform__field--bad')).toHaveCount(1);

    await key(stage, 'Press Tab').click();
    // The rejected field sounds exactly like a field that was never wrong.
    await expect(log(stage)).toHaveText(['Email, edit text']);
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await key(stage, 'Press Tab').click();
    await key(stage, 'Press Tab').click();
    await expect(log(stage).last()).toHaveText('Continue, button');
    await key(stage, 'Enter').click();
    await expect(log(stage)).toHaveText([
      'Email, edit text',
      'Postcode, edit text',
      'Continue, button',
      'Continue, button',
    ]);
    expect(await focusInside(stage)).toBe(false);
    await expect(stage.locator('[aria-live="polite"]')).toHaveText(
      'Screen reader says: Continue, button',
    );
  });

  test('the Fixed form names the field, links to it, and sends focus back while wrong', async ({
    page,
  }) => {
    await open(page, ERRORS);
    const stage = fixed(page);
    const field = stage.getByRole('textbox', { name: 'Email' });

    await key(stage, 'Press Tab').click();
    await expect(stage.getByRole('link')).toBeFocused();
    await expect(log(stage)).toHaveText(['Email — enter an address that includes a domain, link']);

    // The summary's link takes focus to the field, which says what is wrong with it.
    await key(stage, 'Enter').click();
    await expect(field).toBeFocused();
    await expect(log(stage).last()).toHaveText(INVALID_EMAIL);

    // Submitting it still wrong, with real keys, sends focus straight back.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: 'Continue' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(field).toBeFocused();
    await expect(log(stage).last()).toHaveText(INVALID_EMAIL);

    // Fixed and submitted: the error goes.
    await page.keyboard.press('End');
    await page.keyboard.type('.com');
    await page.keyboard.press('Enter');
    await expect(field).not.toHaveAttribute('aria-invalid');
    await expect(stage.locator('.lform__err')).toHaveCount(0);
    await expect(stage.getByRole('link')).toHaveCount(0);
  });
});

test.describe('3.3.2', () => {
  test('the Broken fields are named by their placeholders alone, under simulated input', async ({
    page,
  }) => {
    await open(page, LABELS);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('inert', '');
    await expect(example.locator('label')).toHaveCount(0);

    await key(stage, 'Press Tab').click();
    await key(stage, 'Press Tab').click();
    await expect(log(stage)).toHaveText(['Date, edit text', 'Password, edit text']);
    await key(stage, 'Read it aloud').click();
    await expect(log(stage)).toHaveText([
      'Date, edit text',
      'Password, edit text',
      'Date, edit text',
      'Password, edit text',
    ]);
    expect(await focusInside(stage)).toBe(false);
  });

  test('the Fixed fields keep their labels and say their format, under real keys', async ({
    page,
  }) => {
    await open(page, LABELS);
    const stage = fixed(page);
    const dob = stage.getByRole('textbox', { name: 'Date of birth' });

    await key(stage, 'Press Tab').click();
    await expect(dob).toBeFocused();
    await expect(log(stage)).toHaveText(['Date of birth, edit text, For example, 27 3 1995']);

    // The label and the format stay on screen while typing.
    await page.keyboard.type('27 3 1995');
    await expect(stage.getByText('Date of birth', { exact: true })).toBeVisible();
    await expect(stage.getByText('For example, 27 3 1995', { exact: true })).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(log(stage).last()).toHaveText('Password, edit text, At least 12 characters');
  });

  test('in the lab, typing makes the placeholder label vanish from the screen', async ({ page }) => {
    await open(page, LABELS);
    const lab = page.locator('.lab-slot .flab');
    await expect(lab.locator('.flab__screen')).toHaveText(
      'On screen: “Date of birth”, as a placeholder in the field.',
    );
    await lab.getByLabel('Type into the field').fill('03/27/95');
    await expect(lab.locator('[data-lab-mock] input')).toHaveValue('03/27/95');
    await expect(lab.locator('.flab__screen')).toHaveText(
      'On screen: no label. The placeholder went when typing started.',
    );
    await expect(lab.locator('.lab-verdict')).toHaveText('3.3.2 fails');
  });
});

test('in the 3.3.1 lab, a red border leaves the log as it was before the submit', async ({
  page,
}) => {
  await open(page, ERRORS);
  const lab = page.locator('.lab-slot .flab');
  await expect(lab.locator('.alog li')).toHaveText(['Email', 'Email, edit text']);
  await lab.getByRole('button', { name: 'Submit the form' }).click();
  await expect(lab.locator('[data-lab-mock] .lform__field--bad')).toHaveCount(1);
  await expect(lab.locator('.alog li')).toHaveText(['Email', 'Email, edit text']);
  await expect(lab.locator('[aria-live="polite"]')).toHaveText(
    'Screen reader says: Email; Email, edit text. The field turned red, and nothing says so in text.',
  );
  await expect(lab.locator('.lab-verdict')).toHaveText('3.3.1 fails');
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const url of [ERRORS, LABELS]) {
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
      if (url === ERRORS) await key(fixed(page), 'Press Tab').click();
      // The lab in its passing state, so its own controls are scanned in both states.
      const lab = page.locator('.lab-slot .flab');
      await lab.getByRole('radio').nth(1).check();
      if (url === ERRORS) await lab.getByRole('button', { name: 'Submit the form' }).click();
      else await lab.getByLabel('Type into the field').fill('27 3 1995');
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
