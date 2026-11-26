import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The mock player (#65): live examples and labs for 1.2.2 and 1.2.4. Each Broken stage's player
 * is inert and operated only through the input bar (Tab to Play, Enter); each Fixed stage's
 * player takes real keys and the same bar. The "Heard and captioned" instrument under each stage
 * lists what a hearing viewer heard and the caption shown with it. Nothing plays until the
 * reader starts it, in any motion mode. The labs' verdicts, Reset and motion are covered by
 * `e2e/labs/`.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const WAITING = 'Paused at 0:00. The clip plays only when you start it.';

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const now = (stage: Locator) => stage.locator('.mplog__now');
const lines = (stage: Locator) => stage.locator('.mplog li');
const player = (stage: Locator) => stage.locator('.live__example');

async function expectInert(stage: Locator) {
  const example = player(stage);
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, bad, good] of [
    ['/criteria/1.2.2/', 'were going to deploy the pack age on fry day', "[Priya] We're going to deploy"],
    ['/criteria/1.2.4/', 'transcript will follow', '[CEO] …and the hiring freeze lifts in March.'],
  ] as const) {
    test(`${url} shows the static examples, with no input bar and no media`, async ({ page }) => {
      await page.goto(url);
      await expect(broken(page)).toContainText(bad);
      await expect(fixed(page)).toContainText(good);
      await expect(page.locator('.inbar')).toHaveCount(0);
      await expect(page.locator('video, audio')).toHaveCount(0);
    });
  }
});

test.describe('1.2.2 live examples', () => {
  test('the broken clip plays garbled captions, by simulated input only', async ({ page }) => {
    await open(page, '/criteria/1.2.2/');
    const stage = broken(page);
    await expect(now(stage)).toHaveText(WAITING);
    await expect(lines(stage)).toHaveText(['0:00 Heard: A notification chimes. Captions: none.']);

    await key(stage, 'Press Tab').click();
    await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
    await key(stage, 'Enter').click();
    await expect(now(stage)).toHaveText(/^Playing at 0:0\d\.$/);
    await expect(lines(stage).last()).toHaveText(
      /Heard: Priya: “We’re going to deploy the package on Friday\.” Captions: “were going to deploy the pack age on fry day”\.$/,
      { timeout: 15_000 },
    );
    // Enter again: the drawn focus is still on the button, now Pause.
    await key(stage, 'Enter').click();
    await expect(now(stage)).toHaveText(/^Paused at 0:0\d\.$/);
    await expectInert(stage);
    await expect(page.locator('video, audio')).toHaveCount(0);
  });

  test('the fixed clip takes real keys: scrub, captions off, and the bar plays it', async ({ page }) => {
    await open(page, '/criteria/1.2.2/');
    const stage = fixed(page);
    await expect(now(stage)).toHaveText(WAITING);
    await expect(lines(stage)).toHaveText(['0:00 Heard: A notification chimes. Captions: “[Notification chime]”.']);

    await player(stage).getByRole('slider', { name: 'Position in Release briefing' }).focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await expect(now(stage)).toHaveText('Paused at 0:03.');
    // A line each time what is heard or captioned changes: the speech started at 0:02.
    await expect(lines(stage).last()).toHaveText(
      '0:02 Heard: Priya: “We’re going to deploy the package on Friday.” Captions: “[Priya] We’re going to deploy the package on Friday.”.',
    );

    // The viewer may turn captions off; they are there to turn on.
    const cc = player(stage).getByRole('button', { name: 'Captions' });
    await cc.focus();
    await page.keyboard.press('Enter');
    await expect(cc).toHaveAttribute('aria-pressed', 'false');
    await expect(lines(stage).last()).toHaveText(
      '0:03 Heard: Priya: “We’re going to deploy the package on Friday.” Captions: none.',
    );

    // The bar's Shift+Tab moves real focus back from Captions to Play, and its Enter plays it.
    await key(stage, 'Shift+Tab').click();
    await expect(player(stage).getByRole('button', { name: 'Play' })).toBeFocused();
    await key(stage, 'Enter').click();
    await expect(now(stage)).toHaveText(/^Playing at 0:0\d\.$/);
  });
});

test.describe('1.2.4 live examples', () => {
  test('the broken stream runs live with no captions at all', async ({ page }) => {
    await open(page, '/criteria/1.2.4/');
    const stage = broken(page);
    await expect(now(stage)).toHaveText(WAITING);
    // No captions, so no Captions button: Tab lands on Play.
    await key(stage, 'Press Tab').click();
    await key(stage, 'Enter').click();
    await expect(now(stage)).toHaveText(/^Live, 0:0\d in\.$/);
    await expect(lines(stage).last()).toHaveText(
      /Heard: CEO: “Thanks for joining, everyone\.” Captions: none\.$/,
      { timeout: 15_000 },
    );
    await expectInert(stage);
  });

  test('the fixed stream is captioned as the speaker talks', async ({ page }) => {
    await open(page, '/criteria/1.2.4/');
    const stage = fixed(page);
    await key(stage, 'Press Tab').click();
    await expect(player(stage).getByRole('button', { name: 'Play' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(lines(stage).last()).toHaveText(
      /Heard: CEO: “Thanks for joining, everyone\.” Captions: “\[CEO\] Thanks for joining, everyone\.”\.$/,
      { timeout: 15_000 },
    );
    // A live stream has no position to scrub.
    await expect(player(stage).getByRole('slider')).toHaveCount(0);
  });
});

test.describe('nothing plays until the reader starts it', () => {
  for (const how of ['prefers-reduced-motion', 'full motion'] as const) {
    test(`under ${how}`, async ({ page }) => {
      if (how === 'prefers-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, '/criteria/1.2.2/');
      await page.waitForTimeout(1500);
      for (const stage of [broken(page), fixed(page)]) await expect(now(stage)).toHaveText(WAITING);
      await expect(page.locator('.captions-lab .mplayer__time')).toHaveText('0:00 / 0:15');

      // Started, it plays, under reduced motion too.
      await key(fixed(page), 'Press Tab').click();
      await key(fixed(page), 'Enter').click();
      await expect(now(fixed(page))).toHaveText(/^Playing at/);
    });
  }
});

test.describe('labs', () => {
  test('1.2.2: the readouts put what is heard beside the caption, garbled or accurate', async ({
    page,
  }) => {
    await open(page, '/criteria/1.2.2/');
    const lab = page.locator('.lab-slot .captions-lab');
    await lab.getByRole('slider', { name: 'Position in Release briefing' }).focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
    const out = lab.locator('output');
    await expect(out).toHaveText([
      'Priya: “It goes to five per cent of users first.”',
      '[Priya] It goes to 5% of users first.',
    ]);
    await lab.getByRole('radio', { name: 'Automatic, never checked' }).check();
    await expect(out.nth(1)).toHaveText('it goes to five purse ant of users fast');
    await expect(lab.locator('.lab-verdict')).toHaveText('1.2.2 fails');
    await lab.getByRole('radio', { name: 'None', exact: true }).check();
    await expect(out.nth(1)).toHaveText('No caption on screen');
  });

  test('1.2.4: lagging captions trail the speaker', async ({ page }) => {
    await open(page, '/criteria/1.2.4/');
    const lab = page.locator('.lab-slot .captions-lab');
    await lab.getByRole('radio', { name: 'Lagging 6 seconds behind' }).check();
    await expect(lab.locator('.lab-verdict')).toHaveText('1.2.4 fails');
    await lab.getByRole('button', { name: 'Go live' }).click();
    const out = lab.locator('output');
    await expect(out.first()).toHaveText('CEO: “The hiring freeze lifts in March.”', { timeout: 15_000 });
    await lab.getByRole('button', { name: 'Pause' }).click();
    // The speaker has moved on; the caption is still on an earlier line.
    await expect(out.nth(1)).not.toHaveText('[CEO] The hiring freeze lifts in March.');
    await expect(lab.locator('[aria-live="polite"]')).toHaveText(/^Paused at 0:\d\d in\.$/);
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

const PAGES: { url: string; lab: string; states: ((lab: Locator) => Promise<void>)[] }[] = [
  {
    url: '/criteria/1.2.2/',
    lab: '.lab-slot .captions-lab',
    states: [
      async (lab) => lab.getByRole('radio', { name: 'Automatic, never checked' }).check(),
      async (lab) => lab.getByRole('radio', { name: 'None', exact: true }).check(),
    ],
  },
  {
    url: '/criteria/1.2.4/',
    lab: '.lab-slot .captions-lab',
    states: [
      async (lab) => lab.getByRole('radio', { name: 'Lagging 6 seconds behind' }).check(),
      async (lab) => lab.getByRole('radio', { name: 'Missing' }).check(),
    ],
  },
];

for (const p of PAGES) {
  for (const mode of MODES) {
    test(`${p.url} has no violations in every live and lab state (${mode.name})`, async ({ page }) => {
      // Three full-page axe scans per test: slow under load.
      test.slow();
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, p.url);
      const scan = async (when: string) => {
        const results = await new AxeBuilder({ page })
          .withTags(TAGS)
          .exclude('[data-depicts-failure]')
          .analyze();
        expect(results.violations.map((v) => `${when}: ${v.id}: ${v.help}`)).toEqual([]);
      };
      // Both stages playing, with captions showing on the fixed one.
      for (const stage of [broken(page), fixed(page)]) {
        await key(stage, 'Press Tab').click();
        await key(stage, 'Enter').click();
      }
      await scan('playing');
      const lab = page.locator(p.lab);
      for (const [i, state] of p.states.entries()) {
        await state(lab);
        await scan(`lab state ${i + 1}`);
      }
      if (mode.width === 320) {
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflows).toBe(false);
      }
    });
  }
}
