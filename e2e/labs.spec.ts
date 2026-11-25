import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The lab shell (#41), in the built site. Every lab gets the same bar, and a new lab adds one
 * entry to `LABS` below:
 *
 *   - both verdicts are reachable with the keyboard alone
 *   - axe passes in the failing state as well as the starting one
 *   - Reset returns to the starting state and is not announced
 *   - a verdict flip animates with the state-change token, and is instant under reduced motion
 *     and under `data-motion="off"`
 *
 * Most labs start passing and `toFail` breaks them. A lab that starts failing (the 4.1.2 toggle
 * starts as a bare div) sets `startsFailing` and gives `toPass` instead.
 */

type Drive = (lab: Locator, page: Page) => Promise<void>;

type LabCase = {
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

const radio = (lab: Locator, name: string) => lab.getByRole('radio', { name, exact: true });

async function typeHex(lab: Locator, page: Page, label: string, hex: string) {
  await lab.getByLabel(label).focus();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(hex);
}

const colourToFail = async (lab: Locator, page: Page) => {
  await typeHex(lab, page, 'Text colour hex code', '#999999');
  await typeHex(lab, page, 'Background hex code', '#FFFFFF');
};
const COLOUR_SAID = '2.84 to 1. Fails for text and for controls.';

const LABS: LabCase[] = [
  {
    name: 'fade-the-text on 1.4.3',
    url: '/criteria/1.4.3/',
    lab: '.lab-slot .fade-lab',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the text' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. Contrast ratio 1.29 : 1. Fails body text AA, fails large text AA, fails body text AAA.',
  },
  {
    name: 'the colour check on 1.4.3',
    url: '/criteria/1.4.3/',
    lab: '.lab-slot form.chk',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the colour check on 1.4.11',
    url: '/criteria/1.4.11/',
    lab: '.lab-slot form.chk',
    passing: '1.4.11 passes',
    failing: '1.4.11 fails',
    toFail: async (lab, page) => {
      await typeHex(lab, page, 'Text colour hex code', '#BBBBBB');
      await typeHex(lab, page, 'Background hex code', '#FFFFFF');
    },
    said: '1.91 to 1. Fails for text and for controls.',
  },
  {
    name: 'the colour check on 1.4.1',
    url: '/criteria/1.4.1/',
    lab: '.lab-slot form.chk',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the wide colour check',
    url: '/colour-check/',
    lab: '#cc',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the hero colour check on Home',
    url: '/',
    lab: '#hc',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'fade-the-text on Home',
    url: '/',
    lab: '#lab .fade-lab',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the text' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. Contrast ratio 1.29 : 1. Fails body text AA, fails large text AA, fails body text AAA.',
  },
  {
    name: 'the name, role and value lab on 4.1.2',
    url: '/criteria/4.1.2/',
    lab: '.lab-slot .nrv-lab',
    passing: '4.1.2 passes',
    failing: '4.1.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A plain div').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'None: the text sits beside it').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Screen reader says: Email notifications, switch, on; Email notifications. ' +
      'Role, name and state all exposed.',
  },
  {
    name: 'the reorder-the-steps lab on 1.3.2',
    url: '/criteria/1.3.2/',
    lab: '.lab-slot .seq-lab',
    passing: '1.3.2 passes',
    failing: '1.3.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Confirm, Basket, Address').focus();
      await page.keyboard.press('ArrowUp');
    },
    said: 'Screen reader reads: 1. Basket; 2. Address; 3. Confirm. In order.',
  },
  {
    name: 'the tag-the-fields lab on 1.3.5',
    url: '/criteria/1.3.5/',
    lab: '.lab-slot .ip-lab',
    passing: '1.3.5 passes',
    failing: '1.3.5 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      for (const field of ['Full name', 'Email', 'Phone']) {
        const group = lab.getByRole('group', { name: field, exact: true });
        await radio(group, 'No autocomplete').focus();
        await page.keyboard.press('ArrowDown');
      }
    },
    said: 'Autofill filled 3 of 3 fields.',
  },
  {
    name: 'the say-what-you-see lab on 2.5.3',
    url: '/criteria/2.5.3/',
    lab: '.lab-slot .lin-lab',
    passing: '2.5.3 passes',
    failing: '2.5.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByLabel('aria-label', { exact: true }).focus();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('Send message to support');
    },
    said: 'You said “click Send”. It clicked “Send message to support”.',
  },
];

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const verdict = (lab: Locator) => lab.locator('.lab-verdict');
const live = (lab: Locator) => lab.locator('[aria-live="polite"]');

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

for (const c of LABS) {
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
      await expect(live(lab)).toHaveText(c.said);

      // In the failing state the mock (`data-lab-mock`) shows the failure, on purpose: the
      // contrast labs draw text in the reader's colours. Everything else in the lab must pass.
      const scan = () =>
        new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .include(c.lab)
          .exclude(`${c.lab} [data-lab-mock]`)
          .analyze();
      const results = await scan();
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);

      // Back to the start with the keyboard: Reset is a button in the tab order.
      await lab.getByRole('button', { name: 'Reset' }).focus();
      await page.keyboard.press('Enter');
      await expect(verdict(lab)).toHaveText(start);
      const again = await scan();
      expect(again.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });

    test('Reset returns to the start, unannounced', async ({ page }) => {
      await open(page, c.url);
      const lab = page.locator(c.lab);
      const before = await snapshot(lab);
      await drive(lab, page);
      await expect(live(lab)).toHaveText(c.said);
      expect(await snapshot(lab)).not.toEqual(before);

      await lab.getByRole('button', { name: 'Reset' }).click();
      await expect(verdict(lab)).toHaveText(start);
      expect(await snapshot(lab)).toEqual(before);
      // The live region still holds the reader's last change: Reset said nothing new.
      await page.waitForTimeout(800);
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
      });
    }
  });
}
