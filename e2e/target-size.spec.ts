import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 2.5.8 (#57): the gesture pad under both live stages, and the flagship target-size lab.
 *
 *   Broken  Like, Retweet and Delete at 16px, touching. Operated only by the bar's "Tap": a
 *           fingertip that lands 10px off its aim presses the wrong icon, or none.
 *   Fixed   the same at 24px. The bar's tap presses the icon it aimed at; a real pointer works.
 *   Lab     the reader sizes and spaces the targets; the verdict follows the 24px rule.
 *
 * The shared lab bar (verdicts by keyboard, Reset, axe, motion) is the lab's `e2e/labs/<lab>.lab.spec.ts`.
 */

const URL = '/criteria/2.5.8/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

async function open(page: Page, url = URL) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const tap = (stage: Locator) => stage.locator('.inbar').getByRole('button', { name: 'Tap', exact: true });
const pad = (stage: Locator) => stage.locator('.gpad li');
const said = (stage: Locator) => stage.locator('.stage__instruments [aria-live="polite"]');

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the 2.5.8 stages are the static examples, with no input bar', async ({ page }) => {
    await page.goto(URL);
    await expect(broken(page).locator('.target--small')).toHaveCount(3);
    await expect(fixed(page).locator('.target')).toHaveCount(3);
    await expect(page.locator('.inbar')).toHaveCount(0);
    await expect(page.locator('.gpad')).toHaveCount(0);
  });
});

test('Broken: a simulated tap on packed 16px icons presses the wrong one, or none', async ({
  page,
}) => {
  await open(page);
  const stage = broken(page);
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  await expect(stage.locator('.gpad')).toContainText('No gestures yet.');
  await expect(example.locator('button').first()).toHaveCSS('width', '16px');

  await tap(stage).click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Like',
    'Pointer down on Retweet',
    'Pointer up on Retweet',
    'Retweeted the post',
  ]);
  await expect(example).toContainText('Retweeted the post.');
  await expect(said(stage)).toHaveText('Tap aimed at Like, landed on Retweet. Retweeted the post.');

  // The drawn fingertip sits on Retweet, not Like.
  const retweet = (await example.getByRole('button', { name: 'Retweet', includeHidden: true }).boundingBox())!;
  const mark = stage.locator('.sim-tap');
  await expect(mark).toHaveAttribute('data-on', 'true');
  await expect
    .poll(async () => {
      const b = (await mark.boundingBox())!;
      const x = b.x + b.width / 2;
      return x > retweet.x && x < retweet.x + retweet.width;
    })
    .toBe(true);

  await tap(stage).click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Retweet',
    'Pointer down on Like',
    'Pointer up on Like',
    'Liked the post',
  ]);

  await tap(stage).click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Delete',
    'Pointer down on nothing',
    'Pointer up on nothing',
    'Nothing happened',
  ]);
  await expect(said(stage)).toHaveText('Tap aimed at Delete, landed on nothing. Nothing happened.');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
});

test('Fixed: the same tap on 24px icons presses the one it aimed at', async ({ page }) => {
  await open(page);
  const stage = fixed(page);
  await expect(stage.getByRole('button', { name: 'Like' })).toHaveCSS('width', '24px');
  for (const [name, did] of [
    ['Like', 'Liked the post'],
    ['Retweet', 'Retweeted the post'],
    ['Delete', 'Deleted the post'],
  ]) {
    await tap(stage).click();
    await expect(pad(stage)).toHaveText([
      `Aimed at ${name}`,
      `Pointer down on ${name}`,
      `Pointer up on ${name}`,
      did!,
    ]);
    await expect(said(stage)).toHaveText(`Tap aimed at ${name}, landed on ${name}. ${did}.`);
  }
});

test('Fixed: a real pointer press is drawn on the pad, and the reader’s own press is not announced', async ({
  page,
}) => {
  await open(page);
  const stage = fixed(page);
  await stage.getByRole('button', { name: 'Retweet' }).scrollIntoViewIfNeeded();
  const retweet = (await stage.getByRole('button', { name: 'Retweet' }).boundingBox())!;
  await page.mouse.click(retweet.x + retweet.width / 2, retweet.y + retweet.height / 2);
  await expect(pad(stage)).toHaveText([
    'Pointer down on Retweet',
    'Pointer up on Retweet',
    'Retweeted the post',
  ]);
  await expect(stage.locator('.gpad__down')).toHaveCount(1);
  await page.waitForTimeout(300);
  await expect(said(stage)).toHaveText('');

  // Real keys work too, as on any button.
  await stage.getByRole('button', { name: 'Delete' }).focus();
  await page.keyboard.press('Enter');
  await expect(stage.locator('.live__example')).toContainText('Deleted the post.');
});

const lab = (page: Page) => page.locator('.lab-slot .ts-lab');
const verdict = (l: Locator) => l.locator('.lab-verdict');
const live = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');

test('the lab verdict follows size and spacing, by keyboard', async ({ page }) => {
  await open(page);
  const l = lab(page);
  await expect(verdict(l)).toHaveText('2.5.8 passes');
  await expect(l.locator('.ts-res li')).toHaveText([
    /16 by 16px.*Under 24 by 24/,
    /Centres 24px apart.*24px circles clear each other/,
  ]);
  await expect(l.locator('.ts-circle')).toHaveCount(3);

  // One pixel closer and the circles overlap.
  await l.getByRole('slider', { name: 'Space between targets' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(verdict(l)).toHaveText('2.5.8 fails');
  await expect(l.locator('.ts-circle.is-clash')).toHaveCount(3);
  await expect(live(l)).toHaveText(
    '16 pixel targets, 7 pixels apart. Under 24 by 24, and their 24 pixel circles overlap by 1 pixel. Fails.',
  );

  // Grow the targets to 24 by 24: they pass on size, and the circles give way to squares.
  await l.getByRole('slider', { name: 'Target size' }).focus();
  for (let i = 0; i < 8; i += 1) await page.keyboard.press('ArrowRight');
  await expect(verdict(l)).toHaveText('2.5.8 passes');
  await expect(l.locator('.ts-circle')).toHaveCount(0);
  await expect(l.locator('.ts-guide')).toHaveCount(3);
  await expect(l.locator('.ts-res li')).toHaveCount(1);
});

test('the lab state round-trips through the URL, and a preload is not announced', async ({
  page,
}) => {
  await open(page);
  const l = lab(page);
  const length = await page.evaluate(() => history.length);
  await l.getByRole('slider', { name: 'Target size' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/\?size=15&gap=8$/);
  await l.getByRole('slider', { name: 'Space between targets' }).focus();
  await page.keyboard.press('Home');
  await expect(page).toHaveURL(/\?size=15&gap=0$/);
  expect(await page.evaluate(() => history.length)).toBe(length);

  await open(page, page.url());
  const shared = lab(page);
  await expect(shared.getByRole('slider', { name: 'Target size' })).toHaveValue('15');
  await expect(shared.getByRole('slider', { name: 'Space between targets' })).toHaveValue('0');
  await expect(verdict(shared)).toHaveText('2.5.8 fails');
  await page.waitForTimeout(800);
  await expect(live(shared)).toHaveText('');

  await shared.getByRole('button', { name: 'Reset' }).click();
  await expect(verdict(shared)).toHaveText('2.5.8 passes');
  await expect(page).toHaveURL(/\/criteria\/2\.5\.8\/$/);
});

test('a bad link still opens the lab at the start', async ({ page }) => {
  await open(page, URL + '?size=99&gap=x');
  await expect(verdict(lab(page))).toHaveText('2.5.8 passes');
});

test('the lab mock is hidden from assistive technology and cannot be focused', async ({ page }) => {
  await open(page);
  const mock = lab(page).locator('[data-lab-mock]');
  await expect(mock).toHaveAttribute('aria-hidden', 'true');
  await expect(mock).toHaveAttribute('inert', '');
});

test('the 2.5.8 demo is still there', async ({ page }) => {
  await open(page);
  await expect(page.locator('.demo__button')).toHaveCount(1);
  await expect(page.locator('.demo__button')).toHaveAccessibleName(
    /Tap targets at 18px versus 24px with a fingertip overlay/,
  );
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const mode of MODES) {
  test(`2.5.8 has no accessibility violations after operating both stages and the lab (${mode.name})`, async ({
    page,
  }) => {
    // Two full-page scans: allow them the time of two tests.
    test.slow();
    await page.setViewportSize({ width: mode.width, height: 800 });
    await page.emulateMedia({ colorScheme: mode.colorScheme });
    await open(page);
    for (const stage of [broken(page), fixed(page)]) {
      await tap(stage).click();
      await tap(stage).click();
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
    await scan();
    // And with the lab failing.
    await lab(page).getByRole('slider', { name: 'Space between targets' }).focus();
    await page.keyboard.press('Home');
    await expect(verdict(lab(page))).toHaveText('2.5.8 fails');
    await scan();
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}
