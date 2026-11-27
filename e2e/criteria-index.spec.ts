import { test, expect, type Page } from '@playwright/test';
import { EXPECTED } from '../src/criteria/manifest';
import { PRINCIPLES } from '../src/criteria/structure';
import { open as openPage } from './support/open';

/**
 * The All criteria page (`/criteria/`): the page head with its principle chart, the filter
 * panel, and the grid of index cards. Filter state lives in the URL.
 */

const PAGE = '/criteria/';
const TOTAL = EXPECTED.length;
const byPrinciple = (n: number) => EXPECTED.filter((c) => c.num.startsWith(`${n}.`)).length;

const open = (page: Page, url = PAGE) => openPage(page, url);

const cards = (page: Page) => page.locator('main ul.grid > li > a');
const results = (page: Page) => page.locator('main .count');
const chip = (page: Page, group: 'Principle' | 'Level', name: string) =>
  page.getByRole('group', { name: group }).getByRole('button', { name, exact: true });

test('the page head names all criteria and charts the split by principle', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`All ${TOTAL} criteria`);
  await expect(page.getByRole('heading', { name: 'How they split by principle' })).toBeVisible();
  const rows = page.locator('.split li');
  await expect(rows).toHaveCount(4);
  for (const [i, p] of PRINCIPLES.entries()) {
    await expect(rows.nth(i)).toContainText(p.name);
    await expect(rows.nth(i)).toContainText(String(byPrinciple(p.num)));
  }
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Criteria' }),
  ).toHaveAttribute('aria-current', 'page');
});

test('lists every criterion, each card linking to its page and naming its principle', async ({
  page,
}) => {
  await open(page);
  await expect(cards(page)).toHaveCount(TOTAL);
  await expect(results(page)).toHaveText(`Showing ${TOTAL} of ${TOTAL} criteria.`);
  for (const [i, c] of EXPECTED.entries()) {
    const card = cards(page).nth(i);
    await expect(card).toHaveAttribute('href', `${c.num}/`);
    const principle = PRINCIPLES.find((p) => c.num.startsWith(`${p.num}.`))!;
    await expect(card).toHaveAccessibleName(new RegExp(`${principle.name}.*${escape(c.name)}`));
  }
  await cards(page).first().click();
  await expect(page).toHaveURL(/\/criteria\/1\.1\.1\/$/);
});

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('?p=, ?q= and ?new load the page already filtered', async ({ page }) => {
  await open(page, `${PAGE}?p=2`);
  await expect(cards(page)).toHaveCount(byPrinciple(2));
  await expect(chip(page, 'Principle', 'Operable')).toHaveAttribute('aria-pressed', 'true');
  await expect(chip(page, 'Principle', 'All')).toHaveAttribute('aria-pressed', 'false');

  await open(page, `${PAGE}?new`);
  await expect(cards(page)).toHaveCount(6);
  await expect(chip(page, 'Level', 'New in 2.2')).toHaveAttribute('aria-pressed', 'true');
  await expect(results(page)).toHaveText(`Showing 6 of ${TOTAL} criteria.`);

  await open(page, `${PAGE}?q=captions`);
  await expect(page.getByRole('searchbox', { name: 'Search criteria' })).toHaveValue('captions');
  await expect(cards(page).first()).toContainText('Captions');
  await expect(cards(page)).not.toHaveCount(TOTAL);
});

test('changing a filter updates the URL and keeps focus where it was', async ({ page }) => {
  await open(page);
  const understandable = chip(page, 'Principle', 'Understandable');
  await understandable.click();
  await expect(page).toHaveURL(/\/criteria\/\?p=3$/);
  await expect(understandable).toHaveAttribute('aria-pressed', 'true');
  await expect(understandable).toBeFocused();
  await expect(cards(page)).toHaveCount(byPrinciple(3));

  await chip(page, 'Level', 'AA').click();
  await expect(page).toHaveURL(/\?p=3&l=AA$/);

  await chip(page, 'Level', 'New in 2.2').click();
  await expect(page).toHaveURL(/\?p=3&l=AA&new$/);

  const search = page.getByRole('searchbox', { name: 'Search criteria' });
  await search.fill('help');
  await expect(page).toHaveURL(/\?p=3&l=AA&new&q=help$/);
  await expect(search).toBeFocused();

  await chip(page, 'Principle', 'All').click();
  await chip(page, 'Level', 'All').click();
  await chip(page, 'Level', 'New in 2.2').click();
  await search.fill('');
  await expect(page).toHaveURL(/\/criteria\/$/);
  await expect(cards(page)).toHaveCount(TOTAL);
});

test('chips are toggle buttons at least 44px tall, with the principle shapes', async ({
  page,
}) => {
  await open(page);
  const buttons = page.locator('.filters button');
  await expect(buttons).toHaveCount(9);
  for (const button of await buttons.all()) {
    await expect(button).toHaveAttribute('aria-pressed', /^(true|false)$/);
    const box = await button.boundingBox();
    expect(box!.height, await button.innerText()).toBeGreaterThanOrEqual(44);
  }
  for (const p of PRINCIPLES) {
    await expect(chip(page, 'Principle', p.name).locator(`.mk.p${p.num}`)).toHaveCount(1);
  }
});

test('the results line is a polite live region', async ({ page }) => {
  await open(page);
  await expect(results(page)).toHaveAttribute('aria-live', 'polite');
  await chip(page, 'Level', 'New in 2.2').click();
  await expect(results(page)).toHaveText(`Showing 6 of ${TOTAL} criteria.`);
});

test('a query with no matches shows the dashed suggestion box', async ({ page }) => {
  await open(page, `${PAGE}?q=zzzz`);
  await expect(cards(page)).toHaveCount(0);
  await expect(results(page)).toHaveText(`Showing 0 of ${TOTAL} criteria.`);
  const empty = page.locator('main .empty');
  await expect(empty).toContainText('Nothing matches. Try a number such as 2.4');
  await expect(empty).toHaveCSS('border-top-style', 'dashed');
});

// Ported from the retired e2e/filter.spec.ts (R-08 merge): the old page's search and level
// filter checks, against the All criteria page.
test('search finds a criterion by name and by number', async ({ page }) => {
  await open(page);
  const search = page.getByRole('searchbox', { name: 'Search criteria' });
  const card = (num: string) => cards(page).and(page.locator(`[href="${num}/"]`));

  await search.fill('reflow');
  await expect(card('1.4.10')).toHaveCount(1);
  await expect(card('1.4.1')).toHaveCount(0);

  await search.fill('1.4.11');
  await expect(card('1.4.11')).toHaveCount(1);
  await expect(card('1.4.10')).toHaveCount(0);
});

test('Level A removes the AA criteria from the page and the accessibility tree', async ({
  page,
}) => {
  await open(page);
  const card = (num: string) => cards(page).and(page.locator(`[href="${num}/"]`));
  await expect(card('1.4.1')).toBeVisible();
  await expect(card('1.4.11')).toBeVisible();

  await chip(page, 'Level', 'A').click();
  await expect(card('1.4.1')).toBeVisible();
  // Gone from the DOM, not just hidden, so a screen reader user sees the same set.
  await expect(card('1.4.11')).toHaveCount(0);
  const levelA = EXPECTED.filter((c) => c.level === 'A').length;
  await expect(cards(page)).toHaveCount(levelA);
  await expect(results(page)).toHaveText(`Showing ${levelA} of ${TOTAL} criteria.`);
});
