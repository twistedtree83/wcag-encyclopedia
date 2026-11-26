import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Media alternatives on the mock player (#66): live examples and labs for 1.2.1, 1.2.3 and
 * 1.2.5. Each Broken stage's player is inert and operated only through the input bar (Tab to
 * Play, Enter); each Fixed stage's player takes real keys and the same bar. The "Heard and
 * captioned" instrument adds what is described wherever the picture says more than the
 * soundtrack. Description cues are drawn on screen: nothing plays sound. The labs' verdicts,
 * Reset and motion are covered by `e2e/labs/`.
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
/** Press a bar key by keyboard (focus it, Enter): a resting real mouse fires stray mouseovers. */
const bar = (stage: Locator, name: string) => key(stage, name).press('Enter');
const now = (stage: Locator) => stage.locator('.mplog__now');
const lines = (stage: Locator) => stage.locator('.mplog li');
const player = (stage: Locator) => stage.locator('.live__example');

async function expectInert(stage: Locator) {
  const example = player(stage);
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
}

/** Play the broken stage by the bar: Tab to Play, then Enter. */
async function playBroken(stage: Locator) {
  await bar(stage, 'Press Tab');
  await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
  await bar(stage, 'Enter');
  await expect(now(stage)).toHaveText(/^Playing at 0:0\d\.$/);
}

/** Scrub a real slider forward by whole seconds with the keyboard. */
async function scrub(page: Page, slider: Locator, seconds: number) {
  await slider.focus();
  for (let i = 0; i < seconds; i++) await page.keyboard.press('ArrowRight');
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [url, bad, good] of [
    ['/criteria/1.2.1/', 'Fifty minutes of speech with no transcript', 'the bottleneck was never the factory'],
    ['/criteria/1.2.3/', 'Then you just do this', 'Described transcript'],
    ['/criteria/1.2.5/', 'Enough for 1.2.3 at Level A', '[Description] She crosses out the second column.'],
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

test.describe('1.2.1 live examples', () => {
  test('the broken episode plays with nothing to read, by simulated input only', async ({ page }) => {
    await open(page, '/criteria/1.2.1/');
    const stage = broken(page);
    await expect(now(stage)).toHaveText(WAITING);
    await expect(lines(stage)).toHaveText(['0:00 Heard: Theme music plays. Captions: none.']);
    await expect(player(stage).locator('.mplayer__badge')).toHaveText('Audio');
    await expect(stage.locator('.transcript')).toHaveCount(0);

    // No captions, so no Captions button: Tab lands on Play.
    await playBroken(stage);
    await expect(lines(stage).last()).toHaveText(
      /Heard: Ama: “So the bottleneck was never the factory\.” Captions: none\.$/,
      { timeout: 15_000 },
    );
    await expectInert(stage);
    await expect(page.locator('video, audio')).toHaveCount(0);
  });

  test('the fixed episode has its transcript on the page, and takes real keys', async ({ page }) => {
    await open(page, '/criteria/1.2.1/');
    const stage = fixed(page);
    await expect(stage.locator('.transcript li')).toHaveText([
      'Theme music plays.',
      'Ama: “So the bottleneck was never the factory.”',
      'Ama: “It was the paperwork at the port.”',
      'Dele: “And that is where the three weeks went.”',
    ]);
    await scrub(page, player(stage).getByRole('slider', { name: 'Position in Episode 14 — Supply chains' }), 2);
    await expect(now(stage)).toHaveText('Paused at 0:02.');
    await expect(lines(stage).last()).toHaveText(
      '0:02 Heard: Ama: “So the bottleneck was never the factory.” Captions: none.',
    );
    // The bar's Shift+Tab moves real focus back from the slider to Play, and its Enter plays it.
    await bar(stage, 'Shift+Tab');
    await expect(player(stage).getByRole('button', { name: 'Play' })).toBeFocused();
    await bar(stage, 'Enter');
    await expect(now(stage)).toHaveText(/^Playing at 0:0\d\.$/);
  });
});

test.describe('1.2.3 live examples', () => {
  test('the broken demonstration is captioned, and nothing describes the gesture', async ({ page }) => {
    await open(page, '/criteria/1.2.3/');
    const stage = broken(page);
    await expect(lines(stage)).toHaveText([
      '0:00 Heard: Sam: “Here’s the corner we pinned earlier.” Captions: “[Sam] Here’s the corner we pinned earlier.”. Described: none.',
    ]);
    // Tab reaches Play first; the Captions button follows it.
    await playBroken(stage);
    await expect(lines(stage).last()).toHaveText(
      /Heard: Sam: “Then you just do this, and it’s ready\.” Captions: “\[Sam\] Then you just do this, and it’s ready\.”\. Described: none\.$/,
      { timeout: 15_000 },
    );
    await expectInert(stage);
  });

  test('the fixed demonstration has a described transcript beside it', async ({ page }) => {
    await open(page, '/criteria/1.2.3/');
    const stage = fixed(page);
    await expect(stage.locator('.transcript li').nth(1)).toHaveText(
      '[Sam folds the near corner under the seam allowance and presses it flat with a thumb.] Sam: “Then you just do this, and it’s ready.”',
    );
    await scrub(page, player(stage).getByRole('slider', { name: 'Position in Finishing a corner' }), 3);
    await expect(now(stage)).toHaveText('Paused at 0:03.');
    await expect(lines(stage).last()).toHaveText(
      '0:03 Heard: Sam: “Then you just do this, and it’s ready.” Captions: “[Sam] Then you just do this, and it’s ready.”. Described: none.',
    );
  });
});

test.describe('1.2.5 live examples', () => {
  test('the broken review has no description track, only a transcript to read', async ({ page }) => {
    await open(page, '/criteria/1.2.5/');
    const stage = broken(page);
    await expect(stage.locator('.transcript')).toContainText('[She crosses out the second column, Events.]');
    await playBroken(stage);
    await expect(lines(stage).last()).toHaveText(
      /Heard: A marker squeaks\. No one speaks\. Captions: “\[Marker squeaks\]”\. Described: none\.$/,
      { timeout: 15_000 },
    );
    await expect(player(stage).locator('[data-player-ad]')).toHaveCount(0);
    await expectInert(stage);
  });

  test('the fixed review shows description cues in the gaps, and they switch off', async ({ page }) => {
    await open(page, '/criteria/1.2.5/');
    const stage = fixed(page);
    const description = player(stage).getByRole('button', { name: 'Description' });
    await expect(description).toHaveAttribute('aria-pressed', 'true');
    await expect(player(stage).locator('[data-player-ad]')).toHaveCount(0);

    await scrub(page, player(stage).getByRole('slider', { name: 'Position in Budget review' }), 3);
    await expect(player(stage).locator('[data-player-ad]')).toHaveText('She crosses out the second column, Events.');
    await expect(lines(stage).last()).toHaveText(
      '0:03 Heard: A marker squeaks. No one speaks. Captions: “[Marker squeaks]”. Described: “She crosses out the second column, Events.”.',
    );

    await description.focus();
    await page.keyboard.press('Enter');
    await expect(description).toHaveAttribute('aria-pressed', 'false');
    await expect(lines(stage).last()).toHaveText(
      '0:03 Heard: A marker squeaks. No one speaks. Captions: “[Marker squeaks]”. Described: none.',
    );

    // The bar's Shift+Tab steps real focus back through Captions to Play; Enter plays it.
    await bar(stage, 'Shift+Tab');
    await bar(stage, 'Shift+Tab');
    await expect(player(stage).getByRole('button', { name: 'Play' })).toBeFocused();
    await bar(stage, 'Enter');
    await expect(now(stage)).toHaveText(/^Playing at 0:0\d\.$/);
  });
});

test.describe('labs', () => {
  test('1.2.1: each clip gets its own alternative, and both are needed', async ({ page }) => {
    await open(page, '/criteria/1.2.1/');
    const lab = page.locator('.lab-slot .media-only-lab');
    await scrub(page, lab.getByRole('slider', { name: 'Position in both clips' }), 3);
    await expect(lab.locator('output')).toHaveText([
      'Ama: “So the bottleneck was never the factory.”',
      'Two hands slot the side panels into the base.',
    ]);
    await expect(lab.locator('.transcript')).toHaveCount(2);
    await lab.getByRole('checkbox', { name: 'A text description for the silent clip' }).focus();
    await page.keyboard.press('Space');
    await expect(lab.locator('.transcript')).toHaveCount(1);
    await expect(lab.locator('.transcript')).toContainText('Episode transcript');
    await expect(lab.locator('.lab-verdict')).toHaveText('1.2.1 fails');
  });

  test('1.2.3: a description track carries the gesture the dialogue leaves out', async ({ page }) => {
    await open(page, '/criteria/1.2.3/');
    const lab = page.locator('.lab-slot .media-alt-lab');
    await scrub(page, lab.getByRole('slider', { name: 'Position in Finishing a corner' }), 3);
    const out = lab.locator('output');
    await expect(out.nth(2)).toHaveText('No description on screen');
    await lab.getByRole('radio', { name: 'Captions and an audio description track' }).focus();
    await page.keyboard.press('Space');
    await expect(out.nth(2)).toHaveText(
      'Sam folds the near corner under the seam allowance and presses it flat.',
    );
    await expect(lab.locator('.transcript')).toHaveCount(0);
    await expect(lab.locator('.lab-verdict')).toHaveText('1.2.3 passes');
    await lab.getByRole('radio', { name: 'Captions only' }).focus();
    await page.keyboard.press('Space');
    await expect(lab.locator('.lab-verdict')).toHaveText('1.2.3 fails');
  });

  test('1.2.5: description cues fill the gap where nothing is said', async ({ page }) => {
    await open(page, '/criteria/1.2.5/');
    const lab = page.locator('.lab-slot .media-alt-lab');
    await scrub(page, lab.getByRole('slider', { name: 'Position in Budget review' }), 3);
    const out = lab.locator('output');
    await expect(out).toHaveText([
      'She crosses out the second column, Events.',
      'A marker squeaks. No one speaks.',
      'She crosses out the second column, Events.',
    ]);
    await lab.getByRole('radio', { name: 'No description' }).focus();
    await page.keyboard.press('Space');
    await expect(out.nth(2)).toHaveText('No description on screen');
    await expect(lab.locator('.lab-verdict')).toHaveText('1.2.5 fails');
  });
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

type Drive = (lab: Locator, page: Page) => Promise<void>;
const pick =
  (role: 'radio' | 'checkbox', name: string): Drive =>
  async (lab, page) => {
    await lab.getByRole(role, { name, exact: true }).focus();
    await page.keyboard.press('Space');
  };

const PAGES: { url: string; lab: string; states: Drive[] }[] = [
  {
    url: '/criteria/1.2.1/',
    lab: '.lab-slot .media-only-lab',
    states: [pick('checkbox', 'A transcript for the episode'), pick('checkbox', 'A text description for the silent clip')],
  },
  {
    url: '/criteria/1.2.3/',
    lab: '.lab-slot .media-alt-lab',
    states: [pick('radio', 'Captions and an audio description track'), pick('radio', 'Captions only')],
  },
  {
    url: '/criteria/1.2.5/',
    lab: '.lab-slot .media-alt-lab',
    states: [pick('radio', 'A described transcript only'), pick('radio', 'No description')],
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
      // The broken stage playing; the fixed one and the lab at 0:03, where cues show.
      await bar(broken(page), 'Press Tab');
      await bar(broken(page), 'Enter');
      await scrub(page, player(fixed(page)).getByRole('slider'), 3);
      const lab = page.locator(p.lab);
      await scrub(page, lab.getByRole('slider'), 3);
      await scan('cues showing');
      for (const [i, state] of p.states.entries()) {
        await state(lab, page);
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
