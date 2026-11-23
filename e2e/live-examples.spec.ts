import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Live examples (#43, ADR 0002), piloted on 4.1.2. The Broken stage is operated only through
 * simulated input over inert, hidden markup; the Fixed stage takes real focus, from real keys and
 * from the same input bar. Each stage's announcement log sits directly beneath it.
 *
 * Later live examples copy this file's shape: open, drive each stage through its bar (and real
 * keys on Fixed), assert the instrument output, then axe after interacting.
 */

const URL = '/criteria/4.1.2/';
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
const log = (stage: Locator) => stage.locator('.alog li');

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 4.1.2 stages are the static examples, with no input bar', async ({ page }) => {
    await page.goto(URL);
    await expect(broken(page)).toContainText('announced as');
    await expect(broken(page)).toContainText('"" — group');
    await expect(fixed(page)).toContainText('"Email notifications, switch, on"');
    await expect(page.locator('.inbar')).toHaveCount(0);
  });
});

test('the Broken stage is operated by simulated input over inert, hidden markup', async ({
  page,
}) => {
  await open(page);
  const stage = broken(page);
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'false');

  await key(stage, 'Press Tab').click();
  // Focus lands on the toggle: no name, no role, so the screen reader says "blank".
  await expect(log(stage)).toHaveText(['blank']);
  const ring = stage.locator('.sim-ring');
  await expect(ring).toHaveAttribute('data-on', 'true');
  // The ring settles over the toggle once its move has finished.
  const toggle = (await example.locator('.toggle').boundingBox())!;
  await expect
    .poll(async () => {
      const drawn = (await ring.boundingBox())!;
      return Math.max(Math.abs(drawn.x - toggle.x), Math.abs(drawn.width - toggle.width));
    })
    .toBeLessThan(2);

  // Read it aloud: only the text beside it. The control itself is never said.
  await key(stage, 'Read it aloud').click();
  await expect(log(stage)).toHaveText(['blank', 'Email notifications']);

  // Space on a div does nothing, and real focus never entered the example.
  await key(stage, 'Space').click();
  await expect(log(stage)).toHaveText(['blank', 'Email notifications']);
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
  await expect(stage.locator('[aria-live="polite"]')).toHaveText(
    'Screen reader says: Email notifications',
  );
});

test('the Fixed stage takes real focus, from a real Tab and from the bar', async ({ page }) => {
  await open(page);
  const stage = fixed(page);
  const control = stage.getByRole('switch', { name: 'Email notifications' });

  await key(stage, 'Press Tab').click();
  await expect(control).toBeFocused();
  await expect(log(stage)).toHaveText(['Email notifications, switch, on']);

  // A real key toggles it, and the log hears the new state.
  await page.keyboard.press('Space');
  await expect(log(stage)).toHaveText([
    'Email notifications, switch, on',
    'Email notifications, switch, off',
  ]);

  // A real Shift+Tab from the bar's first button lands back on the switch.
  await key(stage, 'Press Tab').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(control).toBeFocused();
  await expect(log(stage).last()).toHaveText('Email notifications, switch, off');

  // The bar's Space works too.
  await key(stage, 'Space').click();
  await expect(control).toBeChecked();
  await expect(log(stage).last()).toHaveText('Email notifications, switch, on');
});

test('the two logs line up beneath their stages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page);
  await key(broken(page), 'Press Tab').click();
  await key(fixed(page), 'Read it aloud').click();
  const a = await broken(page).locator('.stage__instruments').boundingBox();
  const b = await fixed(page).locator('.stage__instruments').boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(1);
  expect(Math.abs(a!.height - b!.height)).toBeLessThan(1);
});

test('at 320px the stages stack in one column without scrolling sideways', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await open(page);
  await key(broken(page), 'Press Tab').click();
  await key(fixed(page), 'Press Tab').click();
  const a = await broken(page).boundingBox();
  const b = await fixed(page).boundingBox();
  expect(b!.y).toBeGreaterThan(a!.y + a!.height - 1);
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test('the drawn ring moves with a transition, and instantly under reduced motion', async ({
  page,
}) => {
  const duration = (p: Page) =>
    broken(p)
      .locator('.sim-ring')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
  await open(page);
  expect(await duration(page)).not.toMatch(/^0s(, 0s)*$/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  expect(await duration(page)).toMatch(/^0s(, 0s)*$/);
});

test('criteria without live examples keep their static stages', async ({ page }) => {
  await open(page, '/criteria/2.4.11/');
  await expect(page.locator('.inbar')).toHaveCount(0);
  await expect(page.locator('.ex--live')).toHaveCount(0);
  await expect(page.locator('figure.stage .stage__example')).toHaveCount(2);
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const mode of MODES) {
  test(`4.1.2 has no accessibility violations after operating both stages (${mode.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await open(page);
    for (const stage of [broken(page), fixed(page)]) {
      await key(stage, 'Press Tab').click();
      await key(stage, 'Space').click();
      await key(stage, 'Read it aloud').click();
    }
    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      .exclude('[data-depicts-failure]')
      .analyze();
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([]);
  });
}
