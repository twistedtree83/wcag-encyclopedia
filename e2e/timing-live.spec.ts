import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 2.2.1 (#61): the clock under both live stages, and the flagship session lab.
 *
 *   Broken  a two-minute session that ends without a word. Inert; the bar's "Wait 20 seconds"
 *           and "Run the clock" move its mock clock, and at 2:00 the answer is gone.
 *   Fixed   the same session, real. At 1:40 an alert offers more time; one press extends it.
 *   Lab     the reader sets the limit and what the site offers, then runs the clock on Sam.
 *
 * The clock never runs on load. The shared lab bar (verdicts by keyboard, Reset, axe, motion)
 * is the lab's `e2e/labs/<lab>.lab.spec.ts`.
 */

const URL = '/criteria/2.2.1/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

async function open(page: Page, url = URL) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const clockNow = (stage: Locator) => stage.locator('.clock-log__now');
const clockLines = (stage: Locator) => stage.locator('.clock-log li');
const live = (stage: Locator) => stage.locator('.stage__instruments p.sr[aria-live="polite"]');
const focusInside = (stage: Locator) =>
  stage.locator('.live__example').evaluate((el) => el.contains(document.activeElement));

async function wait(stage: Locator, times: number) {
  for (let i = 0; i < times; i += 1) await key(stage, 'Wait 20 seconds').click();
}

const NOT_STARTED = 'Not started. The clock runs only when you start it.';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 2.2.1 stages are the static examples, with no input bar', async ({ page }) => {
    await page.goto(URL);
    await expect(broken(page)).toContainText('Session expired');
    await expect(fixed(page)).toContainText('Give me more time');
    await expect(page.locator('.inbar')).toHaveCount(0);
  });
});

for (const how of ['default motion', 'prefers-reduced-motion'] as const) {
  test(`nothing runs on load (${how})`, async ({ page }) => {
    if (how === 'prefers-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.waitForTimeout(1200);
    for (const stage of [broken(page), fixed(page)]) {
      await expect(clockNow(stage)).toHaveText(NOT_STARTED);
      await expect(key(stage, 'Run the clock')).toHaveCount(1);
      await expect(stage.locator('.live__example [data-timer]')).toHaveAttribute('data-timer', 'Form open');
    }
    const lab = page.locator('.lab-slot .sess-lab');
    await expect(lab.locator('.sess-clock__now')).toHaveText('Mock time 0:00');
    await expect(lab.locator('.sess-beats li')).toHaveText(['0:00 Sam starts the form']);
  });
}

test('Broken: the mock clock reaches 2:00 and the session ends without warning', async ({ page }) => {
  await open(page);
  const stage = broken(page);
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');

  await key(stage, 'Press Tab').click();
  await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
  await wait(stage, 5);
  // 1:40, 20 seconds before the end: no warning.
  await expect(clockNow(stage)).toHaveText('Mock time 1:40, paused.');
  await expect(clockLines(stage)).toHaveCount(0);
  await expect(live(stage)).toHaveText('Waited 20 seconds: 1:40 has passed.');

  await wait(stage, 1);
  await expect(clockLines(stage)).toHaveText(['2:00 Session expired, answer lost']);
  await expect(live(stage)).toHaveText(
    'Waited 20 seconds: 2:00 has passed. Session expired, answer lost.',
  );
  await expect(example).toContainText('Your answers have been cleared.');
  await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'false');
  expect(await focusInside(stage)).toBe(false);
});

test('Fixed: a warning at 1:40, and real Enter on "Give me more time" extends it', async ({ page }) => {
  await open(page);
  const stage = fixed(page);
  await wait(stage, 5);
  await expect(clockLines(stage)).toHaveText(['1:40 Warning: Still there?']);
  await expect(stage.getByRole('alert')).toContainText('Your session ends in 20 seconds.');
  await expect(stage.locator('.alog:not(.clock-log) li').last()).toContainText('Still there?');

  await stage.getByRole('button', { name: 'Give me more time' }).focus();
  await page.keyboard.press('Enter');
  await expect(stage.getByLabel('Full name')).toBeFocused();
  await expect(clockLines(stage)).toHaveText([
    '1:40 Warning: Still there?',
    '1:40 Form open, time extended',
  ]);
  // To the clock's end at 3:00: the new limit is 3:40, so no warning yet.
  await wait(stage, 4);
  await expect(clockNow(stage)).toHaveText('Mock time 3:00, paused.');
  await expect(clockLines(stage)).toHaveCount(2);
  await expect(stage.getByLabel('Full name')).toHaveValue('Sam Okafor');
});

test('Fixed: the bar alone reaches the warning and extends the session', async ({ page }) => {
  await open(page);
  const stage = fixed(page);
  await wait(stage, 5);
  await key(stage, 'Press Tab').click();
  await expect(stage.getByRole('button', { name: 'Give me more time' })).toBeFocused();
  await key(stage, 'Enter').click();
  await expect(clockLines(stage).last()).toHaveText('1:40 Form open, time extended');
});

test('Fixed: left alone, the session ends and keeps the answer', async ({ page }) => {
  await open(page);
  const stage = fixed(page);
  await wait(stage, 6);
  await expect(clockLines(stage)).toHaveText([
    '1:40 Warning: Still there?',
    '2:00 Session ended, answer saved',
  ]);
  await expect(stage.locator('.live__example')).toContainText('Your answers are saved.');
});

test('"Run the clock" runs only until paused', async ({ page }) => {
  await open(page);
  const stage = broken(page);
  await key(stage, 'Run the clock').click();
  await expect(live(stage)).toHaveText('The clock is running.');
  await expect(clockNow(stage)).not.toHaveText('Mock time 0:00, running.');
  await key(stage, 'Pause the clock').click();
  await expect(clockNow(stage)).toHaveText(/^Mock time \d:\d\d, paused\.$/);
  const paused = await clockNow(stage).textContent();
  await page.waitForTimeout(800);
  await expect(clockNow(stage)).toHaveText(paused!);
  await expect(live(stage)).toHaveText(paused!.replace('Mock time ', 'The clock is paused at ').replace(', paused', ''));
});

const lab = (page: Page) => page.locator('.lab-slot .sess-lab');
const radio = (l: Locator, name: string) => l.getByRole('radio', { name, exact: true });
const labSaid = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');
const beats = (l: Locator) => l.locator('.sess-beats li');

test('the lab: with no warning Sam loses the form at 2:00', async ({ page }) => {
  await open(page);
  const l = lab(page);
  for (let i = 0; i < 6; i += 1) await l.getByRole('button', { name: 'Wait 20 seconds' }).click();
  await expect(beats(l)).toHaveText([
    '0:00 Sam starts the form',
    '2:00 The session ends. Sam’s answers are lost',
  ]);
  await expect(l.locator('.sess-clock__now')).toHaveText('Mock time 2:00, stopped');
  await expect(labSaid(l)).toHaveText('2:00. The session ends. Sam’s answers are lost.');
  await expect(l.locator('[data-lab-mock]')).toContainText('Session expired');
});

test('the lab: a 20 second warning lets Sam finish, and a change of choice restarts the clock', async ({
  page,
}) => {
  await open(page);
  const l = lab(page);
  await radio(l, 'Warn 20 seconds ahead').check();
  for (let i = 0; i < 5; i += 1) await l.getByRole('button', { name: 'Wait 20 seconds' }).click();
  await expect(l.locator('[data-lab-mock]')).toContainText('Still there?');
  for (let i = 0; i < 7; i += 1) await l.getByRole('button', { name: 'Wait 20 seconds' }).click();
  await expect(beats(l).last()).toHaveText('4:00 Sam sends the form');
  await expect(l.locator('.lab-verdict')).toHaveText('2.2.1 passes');

  await radio(l, '5 minutes').check();
  await expect(l.locator('.sess-clock__now')).toHaveText('Mock time 0:00');
  await expect(beats(l)).toHaveText(['0:00 Sam starts the form']);
});

test('the lab state round-trips through the URL, and a preload is not announced', async ({ page }) => {
  await open(page, `${URL}?limit=60&help=extend`);
  const l = lab(page);
  await expect(l.locator('.lab-verdict')).toHaveText('2.2.1 passes');
  await expect(radio(l, '1 minute')).toBeChecked();
  await expect(radio(l, 'Warn 20 seconds ahead')).toBeChecked();
  await page.waitForTimeout(800);
  await expect(labSaid(l)).toHaveText('');

  await radio(l, 'Warn 5 seconds ahead').check();
  await expect(page).toHaveURL(/\?limit=60&help=late$/);
  await expect(l.locator('.lab-verdict')).toHaveText('2.2.1 fails');
  await l.getByRole('button', { name: 'Reset' }).click();
  await expect(page).toHaveURL(new RegExp(`${URL.replace(/\./g, '\\.')}$`));
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const mode of MODES) {
  test(`2.2.1 has no accessibility violations in every state (${mode.name})`, async ({ page }) => {
    // Four full-page axe sweeps (start, warning, ended, lab) run close to the 30s limit.
    test.slow();
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await open(page);
    const scan = async (when: string) => {
      const results = await new AxeBuilder({ page })
        .withTags(TAGS)
        .exclude('[data-depicts-failure]')
        .analyze();
      expect(results.violations, `${when}: ${results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')}`).toEqual([]);
    };
    await scan('at the start');
    for (const stage of [broken(page), fixed(page)]) await wait(stage, 5);
    const l = lab(page);
    await radio(l, 'Warn 20 seconds ahead').check();
    for (let i = 0; i < 5; i += 1) await l.getByRole('button', { name: 'Wait 20 seconds' }).click();
    await scan('at the warning');
    for (const stage of [broken(page), fixed(page)]) await wait(stage, 1);
    await radio(l, 'No warning').check();
    for (let i = 0; i < 6; i += 1) await l.getByRole('button', { name: 'Wait 20 seconds' }).click();
    await scan('after the session ended');
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}
