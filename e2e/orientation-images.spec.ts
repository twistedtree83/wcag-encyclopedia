import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open } from './support/open';

/**
 * 1.3.4 Orientation and 1.4.5 Images of Text (#55), on the zoom frame.
 *
 *   1.3.4  Broken: an order page locked to portrait. "Rotate" turns the inert phone on its side
 *          and the page hides its content. Fixed: the same page adapts. Lab: turn the phone and
 *          lock the page.
 *   1.4.5  Broken: the sale heading is an image. "Zoom in" stretches its pixels and "Use my
 *          colours" can't reach them. Fixed: the heading is text. Lab: heading, zoom, colours.
 *
 * The shared lab bar (verdicts by keyboard, Reset, axe, motion) is each lab's `e2e/labs/<lab>.lab.spec.ts`.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const meter = (stage: Locator) => stage.locator('.stage__instruments .alog').first();
const said = (stage: Locator) => stage.locator('p.sr[aria-live="polite"]');
const frame = (where: Locator) => where.locator('.zframe');
const radio = (l: Locator, name: string) => l.getByRole('radio', { name, exact: true });
const verdict = (l: Locator) => l.locator('.lab-verdict');
const labSaid = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');

/** Whether the depicted page's rotate prompt is drawn, i.e. its content is hidden. */
const prompted = (where: Locator) =>
  where.locator('[data-rotate-prompt]').evaluateAll((els) => els.some((el) => el.getClientRects().length > 0));
const pageOverflows = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the stages are the static examples, with no input bar', async ({ page }) => {
    for (const url of ['/criteria/1.3.4/', '/criteria/1.4.5/']) {
      await page.goto(url);
      await expect(page.locator('.inbar')).toHaveCount(0);
      await expect(page.locator('figure.stage .zframe')).toHaveCount(0);
    }
    await page.goto('/criteria/1.3.4/');
    await expect(broken(page)).toContainText('Please rotate your device');
    await page.goto('/criteria/1.4.5/');
    await expect(broken(page).locator('.imgtext')).toHaveCount(1);
    await expect(fixed(page).locator('.realtext')).toHaveCount(1);
  });
});

test.describe('1.3.4', () => {
  const URL = '/criteria/1.3.4/';

  test('Broken: "Rotate" turns the inert phone, and on its side the page hides everything', async ({
    page,
  }) => {
    await open(page, URL);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('aria-hidden', 'true');
    await expect(example).toHaveAttribute('inert', '');
    await expect(meter(stage)).toHaveText('OrientationUpright: not turned yet.');
    await expect(frame(stage)).toHaveAttribute('data-orientation', 'portrait');
    expect(await prompted(stage)).toBe(false);

    await key(stage, 'Rotate').click();
    await expect(meter(stage).locator('li')).toHaveText([
      'Landscape: 640 by 360 CSS pixels',
      'Content hidden: the page asks to be turned back',
    ]);
    await expect(frame(stage)).toHaveAttribute('data-orientation', 'landscape');
    expect(await prompted(stage)).toBe(true);
    await expect(said(stage)).toHaveText(
      'Turned to landscape, 640 by 360 CSS pixels. The page hides its content and asks to be turned back.',
    );
    expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);

    await key(stage, 'Rotate').click();
    await expect(meter(stage).locator('li')).toHaveText(['Portrait: 360 by 640 CSS pixels', 'Content shown']);
  });

  test('Fixed: on its side the page adapts, and the keyboard reaches the window', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    await key(stage, 'Rotate').focus();
    await page.keyboard.press('Enter');
    await expect(meter(stage).locator('li')).toHaveText(['Landscape: 640 by 360 CSS pixels', 'Content shown']);
    expect(await prompted(stage)).toBe(false);
    await expect(said(stage)).toHaveText('Turned to landscape, 640 by 360 CSS pixels. The page shows its content.');
    const view = stage.getByRole('region', { name: /^Browser window at 100% zoom, 640 by 360/ });
    await view.focus();
    await expect(view).toBeFocused();
  });

  test('the lab: the frame follows the turn, and the verdict follows the lock', async ({ page }) => {
    await open(page, URL);
    const l = page.locator('.lab-slot .orient-lab');
    await expect(verdict(l)).toHaveText('1.3.4 passes');
    await expect(frame(l)).toHaveAttribute('data-orientation', 'portrait');

    await radio(l, 'Portrait').focus();
    await page.keyboard.press('ArrowDown');
    await expect(frame(l)).toHaveAttribute('data-orientation', 'landscape');
    await expect(verdict(l)).toHaveText('1.3.4 passes');
    expect(await prompted(l)).toBe(false);

    await radio(l, 'Adapts').focus();
    await page.keyboard.press('ArrowDown');
    await expect(verdict(l)).toHaveText('1.3.4 fails');
    expect(await prompted(l)).toBe(true);
    await expect(labSaid(l)).toHaveText('Landscape, 640 by 360 CSS pixels. Locked to portrait: the content is hidden.');

    // Locked, but held the way it allows: the content shows, and it still fails.
    await radio(l, 'Landscape').focus();
    await page.keyboard.press('ArrowUp');
    await expect(radio(l, 'Portrait')).toBeChecked();
    expect(await prompted(l)).toBe(false);
    await expect(verdict(l)).toHaveText('1.3.4 fails');
    await expect(l.locator('.lab-res li').last()).toContainText('Content shown, but only this way up');
  });
});

test.describe('1.4.5', () => {
  const URL = '/criteria/1.4.5/';

  test('Broken: zoomed, the image blurs; in the reader’s colours it keeps its own', async ({ page }) => {
    await open(page, URL);
    const stage = broken(page);
    const example = stage.locator('.live__example');
    await expect(example).toHaveAttribute('aria-hidden', 'true');
    await expect(example).toHaveAttribute('inert', '');
    await expect(meter(stage)).toHaveText('Zoom and your coloursAt 100%, in the page’s own colours.');
    await expect(example.locator('img[alt="Spring sale — 30% off"]')).toHaveCount(1);

    await key(stage, 'Zoom in').click();
    await key(stage, 'Zoom in').click();
    await expect(meter(stage).locator('li')).toHaveText([
      'Image pixels stretched 4 times: blurred',
      'Your colours: off',
    ]);
    await key(stage, 'Use my colours').click();
    await expect(meter(stage).locator('li').last()).toHaveText('Your colours: on, but the image keeps its own');
    await expect(said(stage)).toHaveText(
      'Image pixels stretched 4 times: blurred. Your colours: on, but the image keeps its own.',
    );
    expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
  });

  test('Fixed: the text stays sharp and takes the reader’s colours', async ({ page }) => {
    await open(page, URL);
    const stage = fixed(page);
    const heading = stage.getByRole('heading', { name: 'Spring sale — 30% off' });
    const look = () =>
      heading.evaluate((el) => {
        const s = getComputedStyle(el);
        return `${s.backgroundColor} ${s.fontFamily}`;
      });
    const before = await look();
    await key(stage, 'Zoom in').focus();
    await page.keyboard.press('Enter');
    await expect(meter(stage).locator('li').first()).toHaveText('Text redrawn at 200%: sharp');
    await key(stage, 'Use my colours').focus();
    await page.keyboard.press('Enter');
    await expect(meter(stage).locator('li')).toHaveText([
      'Text redrawn at 200%: sharp',
      'Your colours: on, and the text follows them',
    ]);
    // The reader's colours really reach the text.
    expect(await look()).not.toBe(before);
    expect(await look()).toContain('Verdana');
    await key(stage, 'Use my colours').click();
    await expect(meter(stage).locator('li').last()).toHaveText('Your colours: off');
  });

  test('the lab: the verdict follows the heading, and the readouts follow zoom and colours', async ({
    page,
  }) => {
    await open(page, URL);
    const l = page.locator('.lab-slot .itext-lab');
    await expect(verdict(l)).toHaveText('1.4.5 passes');
    await expect(l.locator('[data-lab-mock] img')).toHaveCount(0);

    await radio(l, 'Real text').focus();
    await page.keyboard.press('ArrowDown');
    await expect(verdict(l)).toHaveText('1.4.5 fails');
    await expect(l.locator('[data-lab-mock] img')).toHaveCount(1);

    await radio(l, '100%').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await radio(l, 'The page’s own').focus();
    await page.keyboard.press('ArrowDown');
    await expect(l.locator('.lab-res li')).toHaveText([
      'Image pixels stretched 4 times: blurred',
      'Your colours: on, but the image keeps its own',
    ]);
    await expect(labSaid(l)).toHaveText(
      'Image of text at 400%. Image pixels stretched 4 times: blurred. Your colours: on, but the image keeps its own.',
    );

    await radio(l, 'Image of text').focus();
    await page.keyboard.press('ArrowUp');
    await expect(verdict(l)).toHaveText('1.4.5 passes');
    await expect(l.locator('.lab-res li').last()).toHaveText('Your colours: on, and the text follows them');
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

async function scanner(page: Page) {
  return async (state: string) => {
    const results = await new AxeBuilder({ page }).withTags(TAGS).exclude('[data-depicts-failure]').analyze();
    expect(results.violations, `${state}: ${results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')}`).toEqual([]);
    expect(await pageOverflows(page), `${state}: the page scrolls sideways`).toBe(false);
  };
}

for (const mode of MODES) {
  test(`1.3.4 has no accessibility violations in any state (${mode.name})`, async ({ page }) => {
    // Seven full-page axe scans: close to the default 30s under load.
    test.slow();
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await open(page, '/criteria/1.3.4/');
    const scan = await scanner(page);
    await scan('start');
    for (const stage of [broken(page), fixed(page)]) await key(stage, 'Rotate').click();
    await expect(meter(fixed(page)).locator('li').first()).toHaveText(/^Landscape/);
    const l = page.locator('.lab-slot .orient-lab');
    for (const lock of ['Adapts', 'Locked to portrait', 'Locked to landscape']) {
      await radio(l, lock).check();
      for (const turn of ['Portrait', 'Landscape']) {
        await radio(l, turn).check();
        if (lock === 'Adapts' && turn === 'Portrait') continue;
        await scan(`lab ${lock}, ${turn}`);
      }
    }
  });

  test(`1.4.5 has no accessibility violations in any state (${mode.name})`, async ({ page }) => {
    // Nine full-page axe scans: over the default 30s under load.
    test.slow();
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await open(page, '/criteria/1.4.5/');
    const scan = await scanner(page);
    await scan('start');
    for (const stage of [broken(page), fixed(page)]) {
      await key(stage, 'Zoom in').click();
      await key(stage, 'Zoom in').click();
      await key(stage, 'Use my colours').click();
    }
    await expect(meter(fixed(page)).locator('li').last()).toHaveText(/on, and the text/);
    await scan('both stages at 400%, in the reader’s colours');
    const l = page.locator('.lab-slot .itext-lab');
    for (const heading of ['Real text', 'Image of text']) {
      await radio(l, heading).check();
      for (const colours of ['The page’s own', 'Mine']) {
        await radio(l, colours).check();
        for (const zoom of ['100%', '400%']) {
          await radio(l, zoom).check();
          if (heading === 'Real text' && colours === 'The page’s own' && zoom === '100%') continue;
          await scan(`lab ${heading}, ${colours}, ${zoom}`);
        }
      }
    }
  });
}
