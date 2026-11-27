import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open } from './support/open';

/**
 * 2.2.2, 1.4.2 and 2.3.1 (#62): the clock under both live stages, and each criterion's lab.
 *
 *   2.2.2  a carousel that moves a slide every 4 mock seconds; Fixed has a real Pause first
 *   1.4.2  a track drawn as a level meter (the site is silent); Fixed has a real Pause audio first
 *   2.3.1  a banner set to flash, depicted as still frames, with the flash-rate meter. The page
 *          never flashes: the luminance check below samples every element while clocks run
 *
 * The clock never runs on load. The shared lab bar (verdicts by keyboard, Reset, axe, motion)
 * is in `e2e/labs/`.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];
const NOT_STARTED = 'Not started. The clock runs only when you start it.';

const broken = (page: Page) => page.locator('figure.stage.bad');
const fixed = (page: Page) => page.locator('figure.stage.good');
const key = (stage: Locator, name: string) =>
  stage.locator('.inbar').getByRole('button', { name, exact: true });
const clockNow = (stage: Locator) => stage.locator('.clock-log__now');
const clockLines = (stage: Locator) => stage.locator('.clock-log li');
const live = (stage: Locator) => stage.locator('.stage__instruments p.sr[aria-live="polite"]');
const timer = (stage: Locator) => stage.locator('.live__example [data-timer]');

async function wait(stage: Locator, times: number) {
  for (let i = 0; i < times; i += 1) await key(stage, 'Wait 20 seconds').click();
}

const radio = (l: Locator, name: string) => l.getByRole('radio', { name, exact: true });
const labSaid = (l: Locator) => l.locator('.lab-foot ~ [aria-live="polite"]');
const beats = (l: Locator) => l.locator('.sess-beats li');
async function labWait(l: Locator, times: number) {
  for (let i = 0; i < times; i += 1) await l.getByRole('button', { name: 'Wait 2 seconds' }).click();
}

const PAGES = [
  { num: '2.2.2', start: ['Moving on its own', 'Moving, with Pause'], lab: '.carousel-lab' },
  { num: '1.4.2', start: ['Playing', 'Playing, with Pause audio'], lab: '.audio-lab' },
  { num: '2.3.1', start: ['Nothing counted yet', 'Nothing counted yet'], lab: '.flash-lab' },
] as const;

const url = (num: string) => `/criteria/${num}/`;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const p of PAGES) {
    test(`the ${p.num} stages are the static examples, with no input bar`, async ({ page }) => {
      await page.goto(url(p.num));
      await expect(broken(page).locator('.example-note')).toHaveCount(1);
      await expect(fixed(page).locator('.example-note')).toHaveCount(1);
      await expect(page.locator('.inbar')).toHaveCount(0);
    });
  }
});

for (const p of PAGES) {
  test(`${p.num}: nothing runs on load, under reduced motion either`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, url(p.num));
    await page.waitForTimeout(1000);
    for (const [i, stage] of [broken(page), fixed(page)].entries()) {
      await expect(clockNow(stage)).toHaveText(NOT_STARTED);
      await expect(timer(stage)).toHaveAttribute('data-timer', p.start[i]!);
    }
    await expect(page.locator(`.lab-slot ${p.lab}`)).toHaveCount(1);
  });
}

test('2.2.2 keeps its demo beside the new lab', async ({ page }) => {
  await open(page, url('2.2.2'));
  await expect(page.locator('.demos')).toContainText(
    'An autoplaying carousel versus one with a pause control',
  );
  await expect(page.locator('.lab-slot .carousel-lab')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Try it: stop the carousel' })).toHaveCount(1);
});

test('2.2.2 Broken: the carousel moves past 5 seconds with nothing to stop it', async ({ page }) => {
  await open(page, url('2.2.2'));
  const stage = broken(page);
  const example = stage.locator('.live__example');
  await expect(example).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveAttribute('inert', '');
  await key(stage, 'Press Tab').click();
  await expect(stage.locator('.sim-ring')).toHaveAttribute('data-on', 'true');
  await wait(stage, 1);
  await expect(clockLines(stage)).toHaveText(['0:20 Still moving after 5 seconds, no control']);
  await expect(live(stage)).toHaveText(
    'Waited 20 seconds: 0:20 has passed. Still moving after 5 seconds, no control.',
  );
  // 20 seconds is five slides on: slide 3.
  await expect(example).toContainText('Slide 3 of 3');
  expect(await example.evaluate((el) => el.contains(document.activeElement))).toBe(false);
});

test('2.2.2 Fixed: real Enter on Pause holds the slide still', async ({ page }) => {
  await open(page, url('2.2.2'));
  const stage = fixed(page);
  await wait(stage, 1);
  await expect(clockLines(stage)).toHaveText(['0:20 Moving after 5 seconds, with Pause']);
  await stage.getByRole('button', { name: 'Pause', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(timer(stage)).toHaveAttribute('data-timer', 'Paused by the reader');
  await expect(clockLines(stage).last()).toHaveText('0:20 Paused by the reader');
  await expect(stage.getByRole('button', { name: 'Play', exact: true })).toBeFocused();
  await wait(stage, 1);
  await expect(stage.locator('.live__example')).toContainText('Slide 3 of 3');
});

test('2.2.2 Fixed: the bar alone reaches Pause first', async ({ page }) => {
  await open(page, url('2.2.2'));
  const stage = fixed(page);
  await key(stage, 'Press Tab').click();
  await expect(stage.getByRole('button', { name: 'Pause', exact: true })).toBeFocused();
  await key(stage, 'Enter').click();
  await expect(timer(stage)).toHaveAttribute('data-timer', 'Paused by the reader');
});

test('1.4.2 Broken: the track plays past 3 seconds with no control', async ({ page }) => {
  await open(page, url('1.4.2'));
  const stage = broken(page);
  await expect(stage.locator('.live__example')).toHaveAttribute('inert', '');
  await expect(stage.locator('.live__example')).toContainText('Sound playing');
  await wait(stage, 1);
  await expect(clockLines(stage)).toHaveText(['0:20 Still playing after 3 seconds, no control']);
  await expect(live(stage)).toHaveText(
    'Waited 20 seconds: 0:20 has passed. Still playing after 3 seconds, no control.',
  );
});

test('1.4.2 Fixed: the first Tab reaches Pause audio, and it silences the meter', async ({ page }) => {
  await open(page, url('1.4.2'));
  const stage = fixed(page);
  await wait(stage, 1);
  await expect(clockLines(stage)).toHaveText(['0:20 Playing after 3 seconds, with Pause audio']);
  await key(stage, 'Press Tab').click();
  await expect(stage.getByRole('button', { name: 'Pause audio' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(stage.locator('.live__example .tlevel__text')).toHaveText('Silent');
  await expect(clockLines(stage).last()).toHaveText('0:20 Paused by the reader');
});

test('2.3.1: the meter counts 8 a second on Broken and none on Fixed', async ({ page }) => {
  await open(page, url('2.3.1'));
  const b = broken(page);
  const f = fixed(page);
  await expect(b.locator('.live__example')).toHaveAttribute('inert', '');
  await wait(b, 1);
  await expect(clockLines(b)).toHaveText(['0:20 8 flashes a second, over the limit of 3']);
  await expect(b.locator('.fmeter__text')).toHaveText('Flash rate: 8 flashes a second, over the limit of 3');
  await expect(b.locator('.live__example')).toContainText('Counted: 160 flashes in 0:20.');
  await wait(f, 1);
  await expect(clockLines(f)).toHaveText(['0:20 No flashes, within the limit of 3']);
  await expect(f.locator('.fmeter__text')).toHaveText('Flash rate: no flashes, within the limit of 3');
  await key(f, 'Press Tab').click();
  await expect(f.getByRole('link', { name: 'Order now' })).toBeFocused();
});

test('the 2.2.2 lab: with no control Ana never finishes a slide; Pause saves her', async ({ page }) => {
  await open(page, url('2.2.2'));
  const l = page.locator('.lab-slot .carousel-lab');
  await expect(l.locator('.lab-verdict')).toHaveText('2.2.2 fails');
  await labWait(l, 6);
  await expect(beats(l).last()).toHaveText('0:12 Slide 1 again. Ana never finishes a slide');
  await expect(l.locator('.sess-clock__now')).toHaveText('Mock time 0:12, stopped');
  await expect(labSaid(l)).toHaveText('0:12. Slide 1 again. Ana never finishes a slide.');

  await radio(l, 'A Pause button').check();
  await expect(l.locator('.sess-clock__now')).toHaveText('Mock time 0:00');
  await labWait(l, 1);
  await expect(beats(l).last()).toHaveText(
    '0:02 Ana presses Pause, the first thing in the carousel. The slides hold still',
  );
  await expect(l.locator('.lab-verdict')).toHaveText('2.2.2 passes');
});

test('the 1.4.2 lab: a short track ends by itself inside 3 seconds', async ({ page }) => {
  await open(page, url('1.4.2'));
  const l = page.locator('.lab-slot .audio-lab');
  await labWait(l, 2);
  await expect(beats(l).last()).toHaveText(
    '0:03 Three seconds in, the track is still playing over Jo’s screen reader',
  );
  await radio(l, 'Plays for 2 seconds').check();
  await expect(l.locator('.lab-verdict')).toHaveText('1.4.2 passes');
  await labWait(l, 1);
  await expect(l.locator('[data-lab-mock]')).toContainText('Silent');
});

test('the 2.3.1 lab: the meter crosses the limit at 4 a second', async ({ page }) => {
  await open(page, url('2.3.1'));
  const l = page.locator('.lab-slot .flash-lab');
  await expect(l.locator('.fmeter__text')).toHaveText('Flash rate: 2 flashes a second, within the limit of 3');
  await radio(l, '8 flashes a second').check();
  await expect(l.locator('.fmeter__text')).toHaveText('Flash rate: 8 flashes a second, over the limit of 3');
  await expect(l.locator('.tstrip__f--dark')).toHaveCount(8);
});

/**
 * Samples every element's luminance (background, text, border and fill colour, times opacity)
 * every 50 ms for `ms`, and returns the most changes any one element made in any one second. A
 * change is a run in one direction, so a transition counts once however many frames it spans.
 */
async function worstFlashing(page: Page, ms: number) {
  return page.evaluate(async (ms) => {
    const channel = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: string) => {
      const m = c.match(/[\d.]+/g);
      if (!m || m.length < 3) return 0;
      const [r, g, b, a = 1] = m.map(Number) as [number, number, number, number?];
      return (0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)) * (a ?? 1);
    };
    const sig = (el: Element) => {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return -1;
      const sum = lum(s.backgroundColor) + lum(s.color) + lum(s.borderTopColor) + lum(s.fill);
      return Math.round(sum * Number(s.opacity) * 1000) / 1000;
    };
    type Track = { last: number; dir: number; starts: number[] };
    const tracks = new Map<Element, Track>();
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      const t = performance.now();
      for (const el of document.querySelectorAll('body *')) {
        const v = sig(el);
        const tr = tracks.get(el);
        if (!tr) {
          tracks.set(el, { last: v, dir: 0, starts: [] });
          continue;
        }
        if (v === tr.last) continue;
        const dir = Math.sign(v - tr.last);
        if (dir !== tr.dir) tr.starts.push(t);
        tr.dir = dir;
        tr.last = v;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    let worst = { changes: 0, el: '' };
    for (const [el, tr] of tracks) {
      for (let i = 0; i < tr.starts.length; i += 1) {
        const inSecond = tr.starts.filter((s) => s >= tr.starts[i]! && s < tr.starts[i]! + 1000).length;
        if (inSecond > worst.changes) worst = { changes: inSecond, el: el.outerHTML.slice(0, 120) };
      }
    }
    const looping = document
      .getAnimations()
      .filter((a) => a.effect?.getTiming().iterations === Infinity).length;
    return { ...worst, looping };
  }, ms);
}

test('2.3.1: no element changes luminance more than three times in any one second, in any state', async ({
  page,
}) => {
  // Four 1.5 s luminance samplings of every element on the page, on a loaded machine.
  test.slow();
  await open(page, url('2.3.1'));
  const check = async (when: string) => {
    const w = await worstFlashing(page, 1500);
    expect(w.changes, `${when}: ${w.el}`).toBeLessThanOrEqual(3);
    expect(w.looping, `${when}: a looping animation`).toBe(0);
  };
  await check('at load');
  for (const stage of [broken(page), fixed(page)]) await key(stage, 'Run the clock').click();
  await expect(clockNow(broken(page))).not.toHaveText(NOT_STARTED);
  await check('with both clocks running');
  const l = page.locator('.lab-slot .flash-lab');
  await radio(l, '8 flashes a second').check();
  await check('with the lab at 8 flashes a second');
  for (const stage of [broken(page), fixed(page)]) await wait(stage, 3);
  await check('with both clocks stopped at the end');
});

const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

for (const p of PAGES) {
  for (const mode of MODES) {
    test(`${p.num} has no accessibility violations in every state (${mode.name})`, async ({ page }) => {
      // Three full-page axe sweeps (start, moved, lab changed) run close to the 30s limit.
      test.slow();
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await open(page, url(p.num));
      const scan = async (when: string) => {
        const results = await new AxeBuilder({ page })
          .withTags(TAGS)
          .exclude('[data-depicts-failure]')
          .analyze();
        expect(
          results.violations,
          `${when}: ${results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')}`,
        ).toEqual([]);
      };
      await scan('at the start');
      for (const stage of [broken(page), fixed(page)]) await wait(stage, 1);
      await scan('after the clock moved');
      const l = page.locator(`.lab-slot ${p.lab}`);
      const first = l.getByRole('radio').nth(1);
      await first.check();
      if (p.num !== '2.3.1') await labWait(l, 3);
      else await radio(l, '8 flashes a second').check();
      await scan('after the lab changed');
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  }
}
