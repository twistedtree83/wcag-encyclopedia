import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 1.4.10 (#53): the zoom frame under both live stages, and the flagship reflow lab.
 *
 *   Broken  a fixed-width catalogue in a zoom frame. Inert; "Zoom in" on the bar zooms it, and
 *           from 200% it scrolls sideways as well as down.
 *   Fixed   the same catalogue reflowing. Real: its window is a scroll box the keyboard scrolls.
 *   Lab     the reader zooms the frame and switches the layout; the verdict follows.
 *
 * The shared lab bar (verdicts by keyboard, Reset, axe, motion) is the `labs.spec.ts` entry.
 */

const URL = '/criteria/1.4.10/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

async function open(page: Page, url = URL) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const zoomIn = (stage: Locator) =>
  stage.locator('.inbar').getByRole('button', { name: 'Zoom in', exact: true });
const meter = (stage: Locator) => stage.locator('.stage__instruments .alog').first();
const frame = (where: Locator) => where.locator('.zframe');
const live = (stage: Locator) => stage.locator('p.sr[aria-live="polite"]');

/** Whether the real page scrolls sideways. */
const pageOverflows = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 1.4.10 stages are the static examples, with no input bar', async ({ page }) => {
    await page.goto(URL);
    await expect(broken(page).locator('.mini__row--fixed')).toHaveCount(1);
    await expect(fixed(page).locator('.mini__col')).toHaveCount(1);
    await expect(page.locator('.inbar')).toHaveCount(0);
    await expect(page.locator('figure.stage .zframe')).toHaveCount(0);
  });
});

test('Broken: "Zoom in" zooms the inert frame, and from 200% it scrolls two ways', async ({
  page,
}) => {
  await open(page);
  const stage = broken(page);
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  await expect(meter(stage)).toHaveText('Zoom and scrollingAt 100%: not zoomed yet.');
  await expect(frame(stage)).toHaveAttribute('data-scrolls', 'down');

  await zoomIn(stage).click();
  await expect(meter(stage).locator('li')).toHaveText([
    'Zoom 200%: 640 by 512 CSS pixels',
    'Scrolls down and sideways: two directions',
  ]);
  await zoomIn(stage).click();
  await expect(meter(stage).locator('li')).toHaveText([
    'Zoom 400%: 320 by 256 CSS pixels',
    'Scrolls down and sideways: two directions',
  ]);
  await expect(frame(stage)).toHaveAttribute('data-scrolls', 'down sideways');
  await expect(live(stage)).toHaveText(
    'Zoomed to 400%, 320 CSS pixels wide. Scrolls down and sideways: two directions.',
  );
  // The window is 320 CSS px wide inside, whatever the frame's size on screen.
  const width = await stage.locator('.zframe__view').evaluate((el) => (el as HTMLElement).clientWidth);
  expect(width).toBeLessThanOrEqual(320);
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);

  // A third press goes back to 100%.
  await zoomIn(stage).click();
  await expect(meter(stage).locator('li').first()).toHaveText('Zoom 100%: 1280 by 1024 CSS pixels');
  await expect(meter(stage).locator('li').last()).toHaveText('Scrolls down only');
});

test('Fixed: zoomed to 400% it still scrolls only down, and the keyboard scrolls it', async ({
  page,
}) => {
  await open(page);
  const stage = fixed(page);
  await zoomIn(stage).click();
  await zoomIn(stage).click();
  await expect(meter(stage).locator('li')).toHaveText([
    'Zoom 400%: 320 by 256 CSS pixels',
    'Scrolls down only',
  ]);
  await expect(frame(stage)).toHaveAttribute('data-scrolls', 'down');

  const view = stage.getByRole('region', {
    name: 'Browser window at 400% zoom, 320 by 256 CSS pixels',
  });
  await view.focus();
  await expect(view).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect.poll(() => view.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await view.evaluate((el) => el.scrollLeft)).toBe(0);
});

const lab = (page: Page) => page.locator('.lab-slot .reflow-lab');
const verdict = (l: Locator) => l.locator('.lab-verdict');
const labSaid = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');
const radio = (l: Locator, name: string) => l.getByRole('radio', { name, exact: true });

test('the lab verdict follows the zoom and the layout, and the frame measures the same', async ({
  page,
}) => {
  await open(page);
  const l = lab(page);
  await expect(verdict(l)).toHaveText('1.4.10 passes');
  await expect(frame(l)).toHaveAttribute('data-scrolls', 'down');
  await expect(l.locator('.reflow-res li').first()).toHaveText('1280 by 1024CSS pixels in the window');

  await radio(l, '100%').focus();
  await page.keyboard.press('ArrowDown');
  await expect(verdict(l)).toHaveText('1.4.10 fails');
  await expect(frame(l)).toHaveAttribute('data-scrolls', 'down sideways');
  await page.keyboard.press('ArrowDown');
  await expect(radio(l, '400%')).toBeChecked();
  await expect(l.locator('.reflow-res li').first()).toHaveText('320 by 256CSS pixels in the window');

  await radio(l, 'Fixed width').focus();
  await page.keyboard.press('ArrowDown');
  await expect(radio(l, 'Reflows')).toBeChecked();
  await expect(verdict(l)).toHaveText('1.4.10 passes');
  await expect(frame(l)).toHaveAttribute('data-scrolls', 'down');
  await expect(labSaid(l)).toHaveText('400% zoom, 320 CSS pixels wide. Reflows: scrolls down only.');
});

test('the lab state round-trips through the URL, and a preload is not announced', async ({
  page,
}) => {
  await open(page);
  const l = lab(page);
  const length = await page.evaluate(() => history.length);
  await radio(l, '100%').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page).toHaveURL(/\?zoom=400&layout=fixed$/);
  await radio(l, 'Fixed width').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page).toHaveURL(/\?zoom=400&layout=reflow$/);
  expect(await page.evaluate(() => history.length)).toBe(length);

  await open(page, URL + '?zoom=400&layout=fixed');
  const shared = lab(page);
  await expect(radio(shared, '400%')).toBeChecked();
  await expect(radio(shared, 'Fixed width')).toBeChecked();
  await expect(verdict(shared)).toHaveText('1.4.10 fails');
  await page.waitForTimeout(800);
  await expect(labSaid(shared)).toHaveText('');

  await shared.getByRole('button', { name: 'Reset' }).click();
  await expect(verdict(shared)).toHaveText('1.4.10 passes');
  await expect(page).toHaveURL(/\/criteria\/1\.4\.10\/$/);
});

test('a bad link still opens the lab at the start', async ({ page }) => {
  await open(page, URL + '?zoom=300&layout=wide');
  await expect(verdict(lab(page))).toHaveText('1.4.10 passes');
});

test('the lab mock is hidden from assistive technology and cannot be focused', async ({ page }) => {
  await open(page);
  const mock = lab(page).locator('[data-lab-mock]');
  await expect(mock).toHaveAttribute('aria-hidden', 'true');
  await expect(mock).toHaveAttribute('inert', '');
});

test('the 1.4.10 demo is still there, unchanged', async ({ page }) => {
  await open(page);
  await expect(page.locator('.reflow__viewport')).toHaveCount(1);
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const mode of MODES) {
  test(`1.4.10 has no accessibility violations and never scrolls sideways in any state (${mode.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await open(page);
    const scan = async (state: string) => {
      const results = await new AxeBuilder({ page })
        .withTags(TAGS)
        .exclude('[data-depicts-failure]')
        .analyze();
      expect(results.violations, `${state}: ${results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')}`).toEqual([]);
      expect(await pageOverflows(page), `${state}: the page scrolls sideways`).toBe(false);
    };
    await scan('start');
    // Both stages at 400%.
    for (const stage of [broken(page), fixed(page)]) {
      await zoomIn(stage).click();
      await zoomIn(stage).click();
    }
    await expect(meter(fixed(page)).locator('li').first()).toHaveText(/^Zoom 400%/);
    // Every lab state: three zooms, two layouts.
    const l = lab(page);
    for (const layout of ['Fixed width', 'Reflows']) {
      await radio(l, layout).check();
      for (const zoom of ['100%', '200%', '400%']) {
        await radio(l, zoom).check();
        await scan(`lab at ${zoom}, ${layout}`);
      }
    }
  });
}
