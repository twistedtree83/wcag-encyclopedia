import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * The 4.1.2 flagship lab (#42) in the built page: the announcement log follows the mock's markup
 * as the reader edits role, name and state by keyboard, and the lab's state lives in the URL.
 * The shared lab bar (verdicts, Reset, axe, motion) is in `e2e/labs/`.
 */

const URL = '/criteria/4.1.2/';
const SHARED = '?el=switch&name=aria-label&state=aria-checked&on=1';

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const labOf = (page: Page) => page.locator('.lab-slot .nrv-lab');
const log = (lab: Locator) => lab.locator('.alog li');
const verdict = (lab: Locator) => lab.locator('.lab-verdict');
const live = (lab: Locator) => lab.locator('[aria-live="polite"]');
const radio = (lab: Locator, name: string) => lab.getByRole('radio', { name, exact: true });

async function arrow(page: Page, lab: Locator, from: string, times: number) {
  await radio(lab, from).focus();
  for (let i = 0; i < times; i++) await page.keyboard.press('ArrowDown');
}

test('the log follows role, name and state as the reader edits them', async ({ page }) => {
  await open(page, URL);
  const lab = labOf(page);
  await expect(log(lab)).toHaveText(['Email notifications']);
  await expect(verdict(lab)).toHaveText('4.1.2 fails');

  // Role: a div with role="switch". A role, but no name and no state.
  await arrow(page, lab, 'A plain div', 3);
  await expect(log(lab)).toHaveText(['switch', 'Email notifications']);
  await expect(verdict(lab)).toHaveText('4.1.2 fails');

  // Name: aria-labelledby the visible text.
  await arrow(page, lab, 'None: the text sits beside it', 3);
  await expect(log(lab)).toHaveText(['Email notifications, switch', 'Email notifications']);

  // State: aria-pressed is not a switch's state, so nothing changes; aria-checked is.
  await arrow(page, lab, 'None', 1);
  await expect(log(lab)).toHaveText(['Email notifications, switch', 'Email notifications']);
  await expect(verdict(lab)).toHaveText('4.1.2 fails');
  await page.keyboard.press('ArrowDown');
  await expect(log(lab)).toHaveText(['Email notifications, switch, on', 'Email notifications']);
  await expect(verdict(lab)).toHaveText('4.1.2 passes');

  // Value: switching it off is said, and still passes.
  await lab.getByRole('checkbox', { name: 'Switched on' }).focus();
  await page.keyboard.press('Space');
  await expect(log(lab)).toHaveText(['Email notifications, switch, off', 'Email notifications']);
  await expect(verdict(lab)).toHaveText('4.1.2 passes');
  await expect(live(lab)).toHaveText(
    'Screen reader says: Email notifications, switch, off; Email notifications. ' +
      'Role, name and state all exposed.',
  );
});

test('the mock is hidden from assistive technology and cannot be focused', async ({ page }) => {
  await open(page, URL + '?el=button&name=content&state=aria-pressed&on=1');
  const mock = labOf(page).locator('[data-lab-mock]');
  await expect(mock).toHaveAttribute('aria-hidden', 'true');
  await expect(mock).toHaveAttribute('inert', '');
  await expect(labOf(page).getByRole('button', { name: 'Email notifications' })).toHaveCount(0);
});

test('a shared link applies its state after load, unannounced', async ({ page }) => {
  await open(page, URL + SHARED);
  const lab = labOf(page);
  await expect(verdict(lab)).toHaveText('4.1.2 passes');
  await expect(log(lab)).toHaveText(['Email notifications, switch, on', 'Email notifications']);
  await expect(radio(lab, 'A div with role="switch"')).toBeChecked();
  await page.waitForTimeout(800);
  await expect(live(lab)).toHaveText('');
});

test('a bad link still opens the page at the start', async ({ page }) => {
  await open(page, URL + '?el=span&on=maybe');
  const lab = labOf(page);
  await expect(verdict(lab)).toHaveText('4.1.2 fails');
  await expect(log(lab)).toHaveText(['Email notifications']);
});

test('changes write back to the URL without adding history', async ({ page }) => {
  await open(page, URL);
  const lab = labOf(page);
  const length = await page.evaluate(() => history.length);

  await arrow(page, lab, 'A plain div', 3);
  await expect(page).toHaveURL(/\?el=switch&name=none&state=none&on=1$/);
  await arrow(page, lab, 'None: the text sits beside it', 2);
  await arrow(page, lab, 'None', 2);
  await expect(page).toHaveURL(new RegExp(`${SHARED.replace(/\?/g, '\\?')}$`));
  expect(await page.evaluate(() => history.length)).toBe(length);

  // Reset goes back to the start, and so does the URL.
  await lab.getByRole('button', { name: 'Reset' }).click();
  await expect(page).toHaveURL(new RegExp(`${URL.replace(/\./g, '\\.')}$`));
  expect(await page.evaluate(() => history.length)).toBe(length);
});
