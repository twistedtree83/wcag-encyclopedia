import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The shared lab bar (#41), in the built site. Every lab's `e2e/labs/<lab>.lab.spec.ts` passes
 * its cases to `labCases`, one case per place the lab is shown, and each case gets:
 *
 *   - both verdicts are reachable with the keyboard alone
 *   - axe passes in the failing state as well as the starting one
 *   - Reset returns to the starting state and is not announced
 *   - a verdict flip animates with the state-change token, and is instant under reduced motion
 *     and under `data-motion="off"`
 *
 * Most labs start passing and `toFail` breaks them. A lab that starts failing (the 4.1.2 toggle
 * starts as a bare div) sets `startsFailing` and gives `toPass` instead.
 *
 * A lab that keeps state in the URL passes its query URLs to `axeStates` in its own spec
 * (ADR 0004), so no shared list names them.
 */

export type Drive = (lab: Locator, page: Page) => Promise<void>;

export type LabCase = {
  name: string;
  url: string;
  /** A CSS selector for the lab's root element on that page. */
  lab: string;
  /** The verdict line when passing, and when failing. */
  passing: string;
  failing: string;
  /** What the live region says after the drive (`toFail` or `toPass`). */
  said: string;
} & (
  | {
      startsFailing?: false;
      /** Drive the lab from its passing start to the failing verdict, keyboard only. */
      toFail: Drive;
    }
  | {
      startsFailing: true;
      /** Drive the lab from its failing start to the passing verdict, keyboard only. */
      toPass: Drive;
    }
);

/** The verdict at the start, the one the drive reaches, and the drive. */
const plan = (c: LabCase) =>
  c.startsFailing
    ? { start: c.failing, end: c.passing, drive: c.toPass }
    : { start: c.passing, end: c.failing, drive: c.toFail };

export const radio = (lab: Locator, name: string) => lab.getByRole('radio', { name, exact: true });

export async function typeHex(lab: Locator, page: Page, label: string, hex: string) {
  await lab.getByLabel(label).focus();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(hex);
}

export const colourToFail = async (lab: Locator, page: Page) => {
  await typeHex(lab, page, 'Text colour hex code', '#999999');
  await typeHex(lab, page, 'Background hex code', '#FFFFFF');
};
export const COLOUR_SAID = '2.84 to 1. Fails for text and for controls.';

export async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const verdict = (lab: Locator) => lab.locator('.lab-verdict');
const live = (lab: Locator) => lab.locator('[aria-live="polite"]');

/*
 * The live region speaks ANNOUNCE_DELAY_MS (500 ms, LabShell.tsx) after the reader's last change.
 * Under a loaded machine a timer plus a render can take longer than expect's 5 s default, so
 * waiting for an announcement gets its own budget; and a check that Reset said nothing waits
 * past two delays, so a wrongly scheduled announcement would have landed.
 */
const ANNOUNCE_DELAY_MS = 500;
const HEARD_WITHIN_MS = 15_000;
const heard = (lab: Locator, text: string) =>
  expect(live(lab)).toHaveText(text, { timeout: HEARD_WITHIN_MS });

/** What the reader sees in a lab: its text, minus the live region, and every control's value. */
const snapshot = (lab: Locator) =>
  lab.evaluate((el) => {
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelector('[aria-live="polite"]')?.remove();
    const values = [...el.querySelectorAll('input')].map((i) =>
      i.type === 'checkbox' ? String(i.checked) : i.value,
    );
    return { text: copy.textContent, values };
  });

/** The shared lab bar for each case: one `describe` per case, named by it. */
export function labCases(cases: readonly LabCase[]) {
  for (const c of cases) {
    const { start, end, drive } = plan(c);
    test.describe(c.name, () => {
      test('has one verdict, a Reset button and one polite region', async ({ page }) => {
        await open(page, c.url);
        const lab = page.locator(c.lab);
        await expect(verdict(lab)).toHaveCount(1);
        await expect(verdict(lab)).toHaveText(start);
        await expect(lab.getByRole('button', { name: 'Reset' })).toHaveCount(1);
        await expect(live(lab)).toHaveCount(1);
        await expect(live(lab)).toHaveText('');
      });

      test('reaches both verdicts by keyboard, and passes axe when failing', async ({ page }) => {
        await open(page, c.url);
        const lab = page.locator(c.lab);
        await drive(lab, page);
        await expect(verdict(lab)).toHaveText(end);
        await heard(lab, c.said);

        // The whole lab passes axe in every state, mock included. Only content marked
        // `data-depicts-failure` is left out, and the test below holds those marks to the mock.
        const scan = () =>
          new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
            .include(c.lab)
            .exclude('[data-depicts-failure]')
            .analyze();
        const results = await scan();
        expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
        // A mark sits on the mock and nowhere else in the lab.
        const marks = lab.locator('[data-depicts-failure]');
        const outside = await marks.evaluateAll(
          (els) => els.filter((el) => !el.closest('[data-lab-mock]')).length,
        );
        expect(outside, 'a deliberate failure is marked outside the lab mock').toBe(0);

        // Back to the start with the keyboard: Reset is a button in the tab order.
        await lab.getByRole('button', { name: 'Reset' }).focus();
        await page.keyboard.press('Enter');
        await expect(verdict(lab)).toHaveText(start);
        // A passing start depicts no failure, so nothing in it is left out of the scan.
        if (!c.startsFailing) await expect(marks).toHaveCount(0);
        const again = await scan();
        expect(again.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      });

      test('Reset returns to the start, unannounced', async ({ page }) => {
        await open(page, c.url);
        const lab = page.locator(c.lab);
        const before = await snapshot(lab);
        await drive(lab, page);
        await heard(lab, c.said);
        expect(await snapshot(lab)).not.toEqual(before);

        await lab.getByRole('button', { name: 'Reset' }).click();
        await expect(verdict(lab)).toHaveText(start);
        expect(await snapshot(lab)).toEqual(before);
        // The live region still holds the reader's last change: Reset said nothing new.
        await page.waitForTimeout(ANNOUNCE_DELAY_MS * 2);
        await expect(live(lab)).toHaveText(c.said);
      });

      test('a verdict flip settles with the state-change token', async ({ page }) => {
        await open(page, c.url);
        const lab = page.locator(c.lab);
        const line = verdict(lab).locator('span');
        // Nothing moves on load.
        await expect(line).toHaveCSS('animation-name', 'none');
        await drive(lab, page);
        await expect(line).toHaveCSS('animation-name', 'lab-settle');
        await expect(line).toHaveCSS('animation-duration', '0.3s');
        await expect(verdict(lab)).toHaveCSS('transition-duration', '0.3s');
      });

      for (const how of ['prefers-reduced-motion', 'data-motion="off"'] as const) {
        test(`a verdict flip is instant under ${how}`, async ({ page }) => {
          if (how === 'prefers-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
          await open(page, c.url);
          if (how === 'data-motion="off"') {
            await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'));
          }
          const lab = page.locator(c.lab);
          await drive(lab, page);
          await expect(verdict(lab)).toHaveText(end);
          await expect(verdict(lab).locator('span')).toHaveCSS('animation-name', 'none');
          await expect(verdict(lab)).toHaveCSS('transition-duration', '0s');
          // Nothing anywhere in the lab or the live stages moves: instruments, ring, cursor, mock.
          const moving = await page
            .locator(`${c.lab}, .ex--live`)
            .evaluateAll((roots) =>
              roots
                .flatMap((root) => [root, ...root.querySelectorAll('*')])
                .flatMap((el) =>
                  [null, '::before', '::after'].map((pseudo) => ({
                    el,
                    pseudo,
                    css: getComputedStyle(el, pseudo),
                  })),
                )
                .filter(
                  ({ css }) =>
                    css.transitionDuration.split(',').some((d) => Number.parseFloat(d) > 0) ||
                    css.animationName.split(',').some((n) => n.trim() !== 'none'),
                )
                .map(({ el, pseudo }) => `${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}${pseudo ?? ''}`),
            );
          expect(moving, 'these still move').toEqual([]);
        });
      }
    });
  }
}

/* --- Axe scans of URL states --------------------------------------------------------------- */

/** The tags every pre-rendered page is held to (design guide §2). */
export const SITE_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'wcag22a',
  'best-practice',
];

/** Both themes, at 1280px and at 320px. */
export const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: 'light theme at 320px', colorScheme: 'light', width: 320 },
  { name: 'dark theme at 320px', colorScheme: 'dark', width: 320 },
] as const;

/**
 * Pages whose content changes after load: scan each state too, not only the first paint, in
 * every mode. A lab that keeps its state in the URL passes its query URLs from its own spec, so
 * no shared list names them (ADR 0004). A state can mark more than the page's start does (a
 * failing pair in a lab mock), so the marks are held to the Broken stage or a lab mock here.
 */
export function axeStates(urls: readonly string[]) {
  for (const url of urls) {
    for (const mode of MODES) {
      test(`${url} has no accessibility violations (${mode.name})`, async ({ page }) => {
        test.slow();
        await page.setViewportSize({ width: mode.width, height: 800 });
        await page.emulateMedia({ colorScheme: mode.colorScheme });
        await open(page, url);
        const results = await new AxeBuilder({ page })
          .withTags(SITE_TAGS)
          .exclude('[data-depicts-failure]')
          .analyze();
        expect(
          results.violations,
          results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
        ).toEqual([]);
      });
    }

    test(`${url} keeps every deliberate failure inside the Broken stage or a lab mock`, async ({
      page,
    }) => {
      await open(page, url);
      const marked = page.locator('[data-depicts-failure]');
      const count = await marked.count();
      for (let i = 0; i < count; i++) {
        const inside = await marked
          .nth(i)
          .evaluate((el) => !!el.closest('figure.bad') || !!el.closest('[data-lab-mock]'));
        expect(inside, `excluded element ${i} is outside the Broken stage and every lab mock`).toBe(
          true,
        );
      }
    });
  }
}
