import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 3.2.2, 3.3.3 and 3.3.4's live examples and labs (#59), in the built site. The Broken stages are
 * operated only through simulated input over inert, hidden markup (ADR 0002); the Fixed stages
 * take real keys and the same input bar. Every page change happens inside an example or a lab's
 * mock. The labs' verdicts are covered by `labs.spec.ts`; this file checks what they show.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const ON_INPUT = '/criteria/3.2.2/';
const SUGGESTION = '/criteria/3.3.3/';
const PREVENTION = '/criteria/3.3.4/';

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
const press = async (stage: Locator, name: string, times = 1) => {
  for (let i = 0; i < times; i++) await key(stage, name).click();
};

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 3.2.2, 3.3.3 and 3.3.4 stages are the static examples, with no input bar', async ({
    page,
  }) => {
    await page.goto(ON_INPUT);
    await expect(broken(page)).toContainText('reloads on change');
    await expect(page.locator('.inbar')).toHaveCount(0);
    await page.goto(SUGGESTION);
    await expect(broken(page)).toContainText('Invalid date');
    await expect(page.locator('.inbar')).toHaveCount(0);
    await page.goto(PREVENTION);
    await expect(broken(page)).toContainText('Delete all records');
    await expect(page.locator('.inbar')).toHaveCount(0);
  });
});

test.describe('3.2.2', () => {
  test('in the Broken form, choosing a country reloads the page and loses the name', async ({
    page,
  }) => {
    await open(page, ON_INPUT);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('aria-hidden', 'true');
    await expect(example).toHaveAttribute('inert', '');
    await expect(example.locator('.addrbar')).toHaveText('shop.example/uk/checkout');

    await press(stage, 'Press Tab', 3);
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await expect(log(stage).last()).toHaveText('France, radio button, not checked');
    await press(stage, 'Space');
    // The page changed under the reader: a new address, and the name they typed is gone.
    await expect(example.locator('.addrbar')).toHaveText('shop.example/fr/checkout');
    await expect(example.getByRole('textbox', { includeHidden: true })).toHaveValue('');
    await expect(log(stage).last()).toHaveText('France, radio button, checked');
    expect(await focusInside(stage)).toBe(false);
  });

  test('in the Fixed form, choosing only chooses; the button updates the format in place', async ({
    page,
  }) => {
    await open(page, ON_INPUT);
    const stage = fixed(page);
    const name = stage.getByRole('textbox', { name: 'Name' });
    const france = stage.getByRole('radio', { name: 'France' });

    // Real keys: Tab to the group, then an arrow chooses France.
    await name.focus();
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('radio', { name: 'United Kingdom' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(france).toBeChecked();
    await expect(stage.locator('.addrbar')).toHaveText('shop.example/uk/checkout');
    await expect(name).toHaveValue('Ada Lovelace');
    await expect(stage.getByRole('textbox', { name: 'Postcode' })).toBeVisible();

    // The bar: Tab on to the button, Enter applies the choice in place.
    await press(stage, 'Press Tab');
    await expect(stage.getByRole('button', { name: 'Update address format' })).toBeFocused();
    await press(stage, 'Enter');
    await expect(stage.getByRole('textbox', { name: 'Code postal, 5 digits' })).toBeVisible();
    await expect(stage.locator('.addrbar')).toHaveText('shop.example/uk/checkout');
    await expect(name).toHaveValue('Ada Lovelace');
  });

  test('in the lab, a change goes to its page by itself until it waits for Go', async ({
    page,
  }) => {
    await open(page, ON_INPUT);
    const lab = page.locator('.lab-slot .olab');
    const mock = lab.locator('[data-lab-mock]');
    await lab.getByRole('radio', { name: 'France' }).check();
    await expect(mock.locator('.addrbar')).toHaveText('shop.example/fr/checkout');
    await expect(lab.locator('.olab__out')).toHaveText(
      'On the page: shop.example/fr/checkout. Name: empty. Country: France.',
    );
    await expect(lab.locator('.lab-verdict')).toHaveText('3.2.2 fails');

    await lab.getByRole('button', { name: 'Reset' }).click();
    await lab.getByRole('radio', { name: 'Waits for the Go button' }).check();
    await lab.getByRole('radio', { name: 'France' }).check();
    await expect(mock.locator('.addrbar')).toHaveText('shop.example/uk/checkout');
    await lab.getByRole('button', { name: 'Press Go' }).click();
    await expect(lab.locator('.olab__out')).toHaveText(
      'On the page: shop.example/fr/checkout. Name: Ada Lovelace. Country: France.',
    );
    await expect(lab.locator('[aria-live="polite"]')).toHaveText(
      'You pressed Go. The page changed to shop.example/fr/checkout, as you asked.',
    );
    await expect(lab.locator('.lab-verdict')).toHaveText('3.2.2 passes');
  });
});

test.describe('3.3.3', () => {
  test('the Broken error says the date is invalid and nothing more, under simulated input', async ({
    page,
  }) => {
    await open(page, SUGGESTION);
    const stage = broken(page);
    await expect(stage.locator('.live__example')).toHaveAttribute('inert', '');
    await press(stage, 'Press Tab');
    await expect(log(stage)).toHaveText([
      'Date of birth, edit text, invalid entry, 03/27/1995, Invalid date',
    ]);
    await press(stage, 'Press Tab');
    await press(stage, 'Enter');
    await expect(stage.locator('.lform__err')).toHaveText('✕ Invalid date');
    expect(await focusInside(stage)).toBe(false);
  });

  test('the Fixed error says how to write the date, and clears once it is right', async ({
    page,
  }) => {
    await open(page, SUGGESTION);
    const stage = fixed(page);
    const field = stage.getByRole('textbox', { name: 'Date of birth' });
    const SAYS =
      'Date of birth, edit text, invalid entry, 03/27/1995, Enter the date as day, month, year — for example 27 3 1995';

    await press(stage, 'Press Tab');
    await expect(field).toBeFocused();
    await expect(log(stage)).toHaveText([SAYS]);

    // Submitting it still wrong sends focus back to the field.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(field).toBeFocused();

    // Following the suggestion clears the error.
    await field.fill('27 3 1995');
    await page.keyboard.press('Enter');
    await expect(field).not.toHaveAttribute('aria-invalid');
    await expect(stage.locator('.lform__err')).toHaveCount(0);
  });

  test('in the lab, the suggestion is said with the field', async ({ page }) => {
    await open(page, SUGGESTION);
    const lab = page.locator('.lab-slot .eslab');
    await lab.getByRole('radio', { name: 'The format, with an example' }).check();
    await lab.getByRole('button', { name: 'Submit the form' }).click();
    await expect(lab.locator('.alog li')).toHaveText([
      'Date',
      'Date, edit text, invalid entry, 05/03/26, Use DD/MM/YYYY, for example 05/03/2026',
      'Use DD/MM/YYYY, for example 05/03/2026',
    ]);
    await expect(lab.locator('.lab-verdict')).toHaveText('3.3.3 passes');
  });
});

test.describe('3.3.4', () => {
  test('the Broken button deletes everything at once, with no way back', async ({ page }) => {
    await open(page, PREVENTION);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('inert', '');
    await press(stage, 'Press Tab');
    await expect(log(stage)).toHaveText(['Delete all records, button']);
    await press(stage, 'Enter');
    await expect(example).toContainText('Records: 0');
    await expect(log(stage).last()).toHaveText('Deleted 1,240 records. This can’t be undone.');
    expect(await focusInside(stage)).toBe(false);
  });

  test('the Fixed button asks first, and the deletion can be undone', async ({ page }) => {
    await open(page, PREVENTION);
    const stage = fixed(page);

    // The bar: the review step, then Cancel.
    await press(stage, 'Press Tab');
    await press(stage, 'Enter');
    await expect(stage.getByText('Delete all 1,240 records? You can restore them for 30 days.')).toBeVisible();
    await expect(stage.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await expect(stage).toContainText('Records: 1,240');

    // Real keys: confirm, then undo.
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: 'Yes, delete 1,240 records' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(stage).toContainText('Records: 0');
    await expect(log(stage).last()).toHaveText('Deleted 1,240 records. You can undo this for 30 days.');
    await expect(stage.getByRole('button', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(stage).toContainText('Records: 1,240');
    await expect(log(stage).last()).toHaveText('Restored 1,240 records.');
  });

  test('in the lab, a review step lets the reader go back and correct the amount', async ({
    page,
  }) => {
    await open(page, PREVENTION);
    const lab = page.locator('.lab-slot .plab');
    const mock = lab.locator('[data-lab-mock]');
    // Loading the page moves no focus into the lab.
    await expect(lab.getByRole('button', { name: 'Pay £2,500.00' })).not.toBeFocused();
    await lab.getByRole('radio', { name: 'A review step, with a way back' }).check();
    await lab.getByRole('button', { name: 'Pay £2,500.00' }).click();
    await expect(mock).toContainText('Check your payment: £2,500.00 to Sam Lee');
    await lab.getByRole('button', { name: 'Go back and correct it' }).click();
    await expect(mock.getByRole('textbox', { includeHidden: true })).toHaveValue('£250.00');
    await expect(lab.getByRole('button', { name: 'Pay £250.00' })).toBeFocused();
    await expect(lab.locator('.lab-verdict')).toHaveText('3.3.4 passes');
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

/** Puts each page's lab in a state other than its start, so its later controls are scanned. */
const LAB_DRIVES: Record<string, (page: Page) => Promise<void>> = {
  [ON_INPUT]: async (page) => {
    const lab = page.locator('.lab-slot .olab');
    await lab.getByRole('radio', { name: 'Waits for the Go button' }).check();
    await lab.getByRole('radio', { name: 'France' }).check();
  },
  [SUGGESTION]: async (page) => {
    const lab = page.locator('.lab-slot .eslab');
    await lab.getByRole('radio', { name: 'The format, with an example' }).check();
    await lab.getByRole('button', { name: 'Submit the form' }).click();
  },
  [PREVENTION]: async (page) => {
    const lab = page.locator('.lab-slot .plab');
    await lab.getByRole('radio', { name: 'A review step, with a way back' }).check();
    await lab.getByRole('button', { name: 'Pay £2,500.00' }).click();
  },
};

for (const url of [ON_INPUT, SUGGESTION, PREVENTION]) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations after operating both stages and the lab (${mode.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url);
      for (const stage of [broken(page), fixed(page)]) {
        await press(stage, 'Press Tab');
        await press(stage, url === ON_INPUT ? 'Read it aloud' : 'Enter');
      }
      await LAB_DRIVES[url]!(page);
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
