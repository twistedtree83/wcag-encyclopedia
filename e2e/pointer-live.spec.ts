import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 2.5.1, 2.5.2, 2.5.4 and 2.5.7 (#58): the gesture pad under both live stages, driven through
 * the input bar, and each criterion's lab.
 *
 *   2.5.1  a map: both pinch; only Fixed has + and −, so a single tap does something
 *   2.5.2  Delete draft: Broken acts on pointer down, so sliding off still deletes
 *   2.5.4  shake to undo: Fixed adds an Undo button and a switch that turns shaking off
 *   2.5.7  delivery options: both drag; only Fixed has move up and move down
 *
 * The shared lab bar (verdicts by keyboard, Reset, axe when failing, motion) is in `labs.spec.ts`.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

async function open(page: Page, num: string) {
  const url = `/criteria/${num}/`;
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const pad = (stage: Locator) => stage.locator('.gpad li');
const said = (stage: Locator) => stage.locator('.stage__instruments [aria-live="polite"]');
const example = (stage: Locator) => stage.locator('.live__example');

async function expectInert(stage: Locator) {
  await expect(example(stage)).toHaveAttribute('aria-hidden', 'true');
  await expect(example(stage)).toHaveAttribute('inert', '');
  expect(await example(stage).evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the four pages show the static examples, with no input bar', async ({ page }) => {
    for (const [num, sel] of [
      ['2.5.1', '.gesture'],
      ['2.5.2', '.press'],
      ['2.5.4', '.notice'],
      ['2.5.7', '.dragdemo'],
    ] as const) {
      await page.goto(`/criteria/${num}/`);
      await expect(broken(page).locator(sel)).toHaveCount(1);
      await expect(fixed(page).locator(sel)).toHaveCount(1);
      await expect(page.locator('.inbar')).toHaveCount(0);
      await expect(page.locator('.gpad')).toHaveCount(0);
    }
  });
});

test('2.5.1 Broken: a pinch zooms, and one finger has nothing to press', async ({ page }) => {
  await open(page, '2.5.1');
  const stage = broken(page);
  await expectInert(stage);
  await key(stage, 'Pinch').click();
  await expect(pad(stage)).toHaveText(['Two fingers spread apart', 'Zoomed the map to 2×']);
  await expect(example(stage)).toContainText('At 2×.');
  await expect(said(stage)).toHaveText('Two fingers spread apart. Zoomed the map to 2×.');
  await expect(stage.locator('.gpad__path')).toHaveCount(2);

  await key(stage, 'Tap').click();
  await expect(pad(stage)).toHaveText(['Pointer down on nothing', 'Pointer up on nothing', 'Nothing happened']);
  await expect(said(stage)).toHaveText('Tap landed on nothing. Nothing happened.');
  await expectInert(stage);
});

test('2.5.1 Fixed: a tap on + or − zooms, as a pinch does', async ({ page }) => {
  await open(page, '2.5.1');
  const stage = fixed(page);
  await key(stage, 'Tap').click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Zoom in',
    'Pointer down on Zoom in',
    'Pointer up on Zoom in',
    'Zoomed the map to 2×',
  ]);
  await expect(said(stage)).toHaveText('Tap aimed at Zoom in, landed on Zoom in. Zoomed the map to 2×.');
  await key(stage, 'Pinch').click();
  await expect(pad(stage)).toHaveText(['Two fingers spread apart', 'Zoomed the map to 3×']);
  await key(stage, 'Pinch').click();
  await expect(pad(stage)).toHaveText(['Two fingers pinched together', 'Zoomed the map to 2×']);

  // Real keys and a real pointer work too.
  await stage.getByRole('button', { name: 'Zoom out' }).focus();
  await page.keyboard.press('Enter');
  await expect(example(stage)).toContainText('At 1×.');
  await stage.getByRole('button', { name: 'Zoom in' }).click();
  await expect(pad(stage)).toHaveText(['Pointer down on Zoom in', 'Pointer up on Zoom in', 'Zoomed the map to 2×']);
});

test('2.5.2 Broken: sliding off does not save the draft, which went on pointer down', async ({
  page,
}) => {
  await open(page, '2.5.2');
  const stage = broken(page);
  await expectInert(stage);
  await key(stage, 'Press and slide off').click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Delete draft',
    'Pointer down on Delete draft',
    'Deleted the draft',
    'Pointer up on nothing',
  ]);
  await expect(example(stage)).toContainText('Deleted the draft.');
  await expect(said(stage)).toHaveText('Pressed Delete draft and slid off onto nothing. Deleted the draft.');
  await expect(stage.locator('.gpad__path')).toHaveCount(1);
  await expectInert(stage);
});

test('2.5.2 Fixed: sliding off cancels, and a tap deletes on the way up', async ({ page }) => {
  await open(page, '2.5.2');
  const stage = fixed(page);
  await key(stage, 'Press and slide off').click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Delete draft',
    'Pointer down on Delete draft',
    'Pointer up on nothing',
    'Nothing happened',
  ]);
  await expect(example(stage)).toContainText('Nothing deleted yet.');
  await expect(said(stage)).toHaveText('Pressed Delete draft and slid off onto nothing. Nothing happened.');

  await key(stage, 'Tap').click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Delete draft',
    'Pointer down on Delete draft',
    'Pointer up on Delete draft',
    'Deleted the draft',
  ]);
});

test('2.5.2 Fixed: a real press that slides off deletes nothing, and is not announced', async ({
  page,
}) => {
  await open(page, '2.5.2');
  const stage = fixed(page);
  const button = stage.getByRole('button', { name: 'Delete draft' });
  await button.scrollIntoViewIfNeeded();
  const b = (await button.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width + 40, b.y + b.height + 40, { steps: 4 });
  await page.mouse.up();
  await expect(pad(stage)).toHaveText(['Pointer down on Delete draft', 'Pointer up on nothing', 'Nothing happened']);
  await expect(example(stage)).toContainText('Nothing deleted yet.');
  await page.waitForTimeout(300);
  await expect(said(stage)).toHaveText('');
});

test('2.5.4 Broken: a shake undoes, and nothing else can', async ({ page }) => {
  await open(page, '2.5.4');
  const stage = broken(page);
  await expectInert(stage);
  await key(stage, 'Tap').click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Archive',
    'Pointer down on Archive',
    'Pointer up on Archive',
    'Archived “Lunch on Friday”',
  ]);
  await key(stage, 'Shake the phone').click();
  await expect(pad(stage)).toHaveText(['Shook the phone', 'Undid the archive']);
  await expect(said(stage)).toHaveText('Shook the phone. Undid the archive.');
  await expect(stage.locator('.gpad__tilt')).toHaveCount(1);
  await expect(example(stage)).toContainText('“Lunch on Friday” is in the inbox.');
  // Only Archive is there to tap.
  await expect(example(stage).getByRole('button', { includeHidden: true })).toHaveCount(1);
});

test('2.5.4 Fixed: Undo does it without a shake, and shaking can be turned off', async ({ page }) => {
  await open(page, '2.5.4');
  const stage = fixed(page);
  await key(stage, 'Tap').click(); // Archive
  await key(stage, 'Tap').click(); // Undo
  await expect(pad(stage)).toHaveText([
    'Aimed at Undo',
    'Pointer down on Undo',
    'Pointer up on Undo',
    'Undid the archive',
  ]);
  await key(stage, 'Tap').click(); // the switch
  await expect(pad(stage)).toHaveText([
    'Aimed at Shake to undo',
    'Pointer down on Shake to undo',
    'Pointer up on Shake to undo',
    'Turned shake to undo off',
  ]);
  await expect(stage.getByRole('switch', { name: 'Shake to undo' })).toHaveAttribute('aria-checked', 'false');
  await key(stage, 'Tap').click(); // Archive again
  await key(stage, 'Shake the phone').click();
  await expect(pad(stage)).toHaveText(['Shook the phone', 'Nothing happened']);
  await expect(example(stage)).toContainText('Archived “Lunch on Friday”.');

  // Real keys: Undo is a button like any other.
  await stage.getByRole('button', { name: 'Undo' }).focus();
  await page.keyboard.press('Enter');
  await expect(example(stage)).toContainText('“Lunch on Friday” is in the inbox.');
});

test('2.5.7 Broken: the drag reorders, and there is nothing to tap', async ({ page }) => {
  await open(page, '2.5.7');
  const stage = broken(page);
  await expectInert(stage);
  await key(stage, 'Drag the top row down').click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Collect from store',
    'Pointer down on Collect from store',
    'Pointer up on Standard delivery',
    'Moved Collect from store down',
  ]);
  await expect(said(stage)).toHaveText(
    'Dragged Collect from store onto Standard delivery. Moved Collect from store down.',
  );
  await expect(example(stage).locator('.sortl__name')).toHaveText(['Standard delivery', 'Collect from store', 'Next day']);
  await key(stage, 'Tap').click();
  await expect(pad(stage)).toHaveText(['Pointer down on nothing', 'Pointer up on nothing', 'Nothing happened']);
});

test('2.5.7 Fixed: one tap moves a row, and a real drag works too', async ({ page }) => {
  await open(page, '2.5.7');
  const stage = fixed(page);
  const names = example(stage).locator('.sortl__name');
  await key(stage, 'Tap').click();
  await expect(pad(stage)).toHaveText([
    'Aimed at Move Collect from store down',
    'Pointer down on Move Collect from store down',
    'Pointer up on Move Collect from store down',
    'Moved Collect from store down',
  ]);
  await expect(names).toHaveText(['Standard delivery', 'Collect from store', 'Next day']);

  // By keyboard.
  await stage.getByRole('button', { name: 'Move Next day up' }).focus();
  await page.keyboard.press('Enter');
  await expect(names).toHaveText(['Standard delivery', 'Next day', 'Collect from store']);

  // A real drag of the top row's handle onto the second row.
  const handle = example(stage).locator('.sortl__handle').first();
  await handle.scrollIntoViewIfNeeded();
  const h = (await handle.boundingBox())!;
  const second = (await example(stage).locator('.sortl__row').nth(1).boundingBox())!;
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(h.x + h.width / 2, second.y + second.height * 0.75, { steps: 5 });
  await page.mouse.up();
  await expect(names).toHaveText(['Next day', 'Standard delivery', 'Collect from store']);
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

/** Each page: its bar keys to press on both stages, and its lab's passing choice. */
const PAGES = [
  { num: '2.5.1', keys: ['Pinch', 'Tap'], lab: '.pg-lab', pass: ['Pinch, or the + and − buttons'] },
  { num: '2.5.2', keys: ['Press and slide off', 'Tap'], lab: '.pc-lab', pass: ['Pointer up'] },
  {
    num: '2.5.4',
    keys: ['Tap', 'Shake the phone'],
    lab: '.ma-lab',
    pass: ['An Undo button', 'On, with a setting to turn it off'],
  },
  {
    num: '2.5.7',
    keys: ['Drag the top row down', 'Tap'],
    lab: '.dm-lab',
    pass: ['Dragging, or move up and move down buttons'],
  },
] as const;

for (const mode of MODES) {
  for (const p of PAGES) {
    test(`${p.num} has no accessibility violations after operating both stages and the lab (${mode.name})`, async ({
      page,
    }) => {
      // Two full-page scans on a loaded machine: allow them the time of two tests.
      test.slow();
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, p.num);
      for (const stage of [broken(page), fixed(page)]) {
        for (const k of p.keys) await key(stage, k).click();
      }
      const scan = async () => {
        const results = await new AxeBuilder({ page }).withTags(TAGS).exclude('[data-depicts-failure]').analyze();
        expect(results.violations, results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([]);
      };
      await scan();
      // And with the lab passing (it starts failing).
      const lab = page.locator(`.lab-slot ${p.lab}`);
      for (const choice of p.pass) await lab.getByRole('radio', { name: choice, exact: true }).check();
      await expect(lab.locator('.lab-verdict')).toHaveText(`${p.num} passes`);
      await scan();
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  }
}

test('the 2.5.2 lab: sliding off deletes only when it acts on pointer down', async ({ page }) => {
  await open(page, '2.5.2');
  const lab = page.locator('.lab-slot .pc-lab');
  await lab.getByRole('button', { name: 'Press and slide off' }).click();
  await expect(lab.locator('output')).toHaveText('Deleted on the way down');
  await expect(lab.locator('.lab-foot ~ [aria-live="polite"]')).toHaveText(
    'Pressed Delete draft and slid off. It was deleted the moment the pointer went down.',
  );
  await lab.getByRole('radio', { name: 'Pointer up' }).check();
  await expect(lab.locator('.lab-verdict')).toHaveText('2.5.2 passes');
  await lab.getByRole('button', { name: 'Press and slide off' }).click();
  await expect(lab.locator('output')).toHaveText('Slid off: nothing deleted');
});

test('the 2.5.4 lab: the shake is ignored once it is turned off, and both halves are needed', async ({
  page,
}) => {
  await open(page, '2.5.4');
  const lab = page.locator('.lab-slot .ma-lab');
  const verdict = lab.locator('.lab-verdict');
  await lab.getByRole('button', { name: 'Shake the phone' }).click();
  await expect(lab.locator('.ptr-try output')).toHaveText('Undid the archive');
  await lab.getByRole('radio', { name: 'An Undo button' }).check();
  await expect(verdict).toHaveText('2.5.4 fails');
  await lab.getByRole('radio', { name: 'Turned off in settings' }).check();
  await expect(verdict).toHaveText('2.5.4 passes');
  await lab.getByRole('button', { name: 'Shake the phone' }).click();
  await expect(lab.locator('.ptr-try output')).toHaveText('Ignored the shake');
  await expect(lab.locator('.lab-foot ~ [aria-live="polite"]')).toHaveText(
    'Shook the phone. Shake to undo is off, so nothing happened.',
  );
});
