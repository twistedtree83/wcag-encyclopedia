import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from '../src/site/routes';

/**
 * The axe scan.
 *
 * Catches what the unit tests structurally cannot: landmark and heading-order problems,
 * missing accessible names, ARIA misuse, and contrast as actually composited by the browser.
 *
 * Runs in both themes and at 320px. A page documenting WCAG that fails an automated WCAG
 * scan has no standing, so this gates the build.
 *
 * Elements marked `data-depicts-failure` are the deliberate failures a criterion page teaches
 * with (the low-contrast text in a 1.4.3 Broken stage, for instance). They are excluded per
 * element, never per component; a test below asserts each one sits inside the Broken stage,
 * and TOKEN_PAIRS audits their colours with `expect: 'fail'`, so one that started passing
 * would break the build.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/* --- The pre-rendered pages (ADR 0001) --------------------------------------------------- */

/**
 * Every pre-rendered page, in both themes and at 320px. The list is the route table the
 * prerender step writes, so a new page is scanned the moment it exists. These pages are also
 * held to axe's best-practice rules (design guide §2).
 */
const SITE_TAGS = [...TAGS, 'wcag22a', 'best-practice'];
const SITE_PAGES = ROUTES.map((r) => `/${r.path}`);
const MODES = [
  { name: 'light theme', colorScheme: 'light', width: 1280 },
  { name: 'dark theme', colorScheme: 'dark', width: 1280 },
  { name: '320px', colorScheme: 'light', width: 320 },
] as const;

async function openSitePage(page: import('@playwright/test').Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

for (const url of SITE_PAGES) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations (${mode.name})`, async ({ page }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await openSitePage(page, url);
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

  test(`${url} does not scroll horizontally at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openSitePage(page, url);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows, `${url} scrolls in two directions at 320px, which fails 1.4.10`).toBe(false);
  });

  test(`${url} gives every link and button a visible focus indicator`, async ({ page }) => {
    await openSitePage(page, url);
    const controls = page.locator('a[href], button');
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const control = controls.nth(i);
      await control.focus();
      const outline = await control.evaluate((el) => getComputedStyle(el).outlineWidth);
      expect(Number.parseFloat(outline), `control ${i} has no focus outline`).toBeGreaterThan(0);
    }
  });

  test(`${url} keeps every deliberate failure inside the Broken stage`, async ({ page }) => {
    await openSitePage(page, url);
    const marked = page.locator('[data-depicts-failure]');
    const count = await marked.count();
    for (let i = 0; i < count; i++) {
      const inside = await marked.nth(i).evaluate((el) => !!el.closest('figure.bad'));
      expect(inside, `excluded element ${i} is not inside the Broken stage`).toBe(true);
    }
  });
}

/**
 * Pages whose content changes after load: scan the states too, not only the first paint.
 * The All criteria index filtered to one principle, and with nothing matching.
 */
const STATE_PAGES = ['/criteria/?p=2', '/criteria/?q=zzzz'];

for (const url of STATE_PAGES) {
  for (const mode of MODES) {
    test(`${url} has no accessibility violations (${mode.name})`, async ({ page }) => {
      await page.setViewportSize({ width: mode.width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.colorScheme });
      await openSitePage(page, url);
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
}
