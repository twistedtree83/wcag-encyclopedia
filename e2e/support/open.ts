import { expect, type Page } from '@playwright/test';

/**
 * The one way an e2e spec opens a built page (docs/CONVENTIONS.md, "Running e2e"): go to it,
 * insist it was built, then wait until it is ready to use. `tests/e2eOpen.test.ts` fails if a
 * spec waits for hydration on its own.
 */
export async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await whenReady(page);
}

/**
 * Waits for the page in the tab now: `<Site>` has set `<html data-hydrated="true">`, so the
 * controls are live, and the web fonts have loaded, so layout and geometry are final. Use it
 * after a reload or a navigation the test caused; use `open` to go to a page.
 */
export async function whenReady(page: Page) {
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
  await page.evaluate(() => document.fonts.ready);
}
