import { test, expect, type Page } from '@playwright/test';
import { EXPECTED } from '../src/criteria/manifest';
import { open as openPage } from './support/open';

/**
 * All 55 criterion pages (R-03): built, readable without JavaScript, hydrated without errors,
 * linked onward, laid out per the design guide at 1440px and 390px, and reached from the old
 * site's `#<number>` links.
 */

const open = (page: Page, num: string) => openPage(page, `/criteria/${num}/`);

test('the build writes a page for every criterion, its name in the static HTML', async ({
  request,
}) => {
  expect(EXPECTED).toHaveLength(55);
  for (const { num, name } of EXPECTED) {
    const response = await request.get(`/criteria/${num}/`);
    expect(response.status(), `${num} was not built`).toBe(200);
    const html = await response.text();
    expect(html, num).toContain(`<h1 id="criterion-title">${name}</h1>`);
    expect(html, num).toContain(`data-route="criteria/${num}/"`);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the head, facts, stages, cards and pager are all there', async ({ page }) => {
    await page.goto('/criteria/2.4.11/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Focus Not Obscured (Minimum)',
    );
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(page.getByRole('figure', { name: /broken/i })).toBeVisible();
    await expect(page.getByRole('figure', { name: /fixed/i })).toBeVisible();
    await expect(page.locator('.facts')).toContainText('In WCAG since');
    await expect(page.locator('ul.grid > li')).not.toHaveCount(0);
    await expect(page.getByRole('link', { name: /Previous/ })).toBeVisible();
  });
});

test('hydrates the demo pages without errors, with and without reduced motion', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const num of ['1.4.10', '2.4.7', '4.1.3']) await open(page, num);
  }
  expect(errors).toEqual([]);
});

test('reduced motion stops animations as well as transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '1.4.3');
  // A probe with an animation and a transition, as any future component might add.
  const motion = await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent =
      '@keyframes probe { to { transform: translateX(10px) } }' +
      '#motion-probe { animation: probe 2s infinite; transition: color 1s; }';
    document.head.append(style);
    const probe = document.createElement('div');
    probe.id = 'motion-probe';
    document.body.append(probe);
    const cs = getComputedStyle(probe);
    return { animation: cs.animationName, transition: cs.transitionDuration };
  });
  expect(motion).toEqual({ animation: 'none', transition: '0s' });
});

test('the breadcrumb leads home and to the criteria, and marks the current page', async ({
  page,
}) => {
  await open(page, '1.4.3');
  const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(crumbs.getByRole('link')).toHaveText(['Home', 'Criteria']);
  await expect(crumbs.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '../../');
  await expect(crumbs.getByRole('link', { name: 'Criteria' })).toHaveAttribute('href', '../');
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('1.4.3 Contrast (Minimum)');
});

test('an index card leads to its criterion page', async ({ page }) => {
  await open(page, '4.1.2');
  const cards = page.locator('ul.grid > li');
  await expect(cards).toHaveCount(1);
  await cards.getByRole('link').click();
  await expect(page).toHaveURL(/\/criteria\/4\.1\.3\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Status Messages');
});

test('the card names its principle to screen readers', async ({ page }) => {
  await open(page, '4.1.3');
  await expect(page.locator('ul.grid').getByRole('link')).toHaveAccessibleName(
    /^4\.1\.2\s?, Robust .*Name, Role, Value/,
  );
});

test('the pager walks in number order', async ({ page }) => {
  await open(page, '1.4.5');
  await page.getByRole('link', { name: /^Next/ }).click();
  await expect(page).toHaveURL(/\/criteria\/1\.4\.10\/$/);
  await page.getByRole('link', { name: /Previous/ }).click();
  await expect(page).toHaveURL(/\/criteria\/1\.4\.5\/$/);

  await open(page, '1.1.1');
  const pager = page.getByRole('navigation', { name: 'Previous and next criteria' });
  await expect(pager.getByRole('link')).toHaveCount(1);
  await open(page, '4.1.3');
  await expect(pager.getByRole('link')).toHaveCount(1);
  await expect(pager.getByRole('link')).toHaveAttribute('rel', 'prev');
});

test.describe('the old #number links', () => {
  test('replace the home page with the criterion page, adding no history entry', async ({
    page,
    context,
  }) => {
    await page.goto('/#1.4.3');
    await expect(page).toHaveURL(/\/criteria\/1\.4\.3\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contrast (Minimum)');
    const redirected = await page.evaluate(() => history.length);

    const direct = await context.newPage();
    await direct.goto('/criteria/1.4.3/');
    expect(redirected).toBe(await direct.evaluate(() => history.length));
  });

  test('work for two-digit numbers too', async ({ page }) => {
    await page.goto('/#1.4.10');
    await expect(page).toHaveURL(/\/criteria\/1\.4\.10\/$/);
  });

  test('leave other fragments alone', async ({ page }) => {
    await page.goto('/#9.9.9');
    await expect(page).toHaveURL(/\/#9\.9\.9$/);
    await page.goto('/#main');
    await expect(page).toHaveURL(/\/#main$/);
  });
});

test.describe('layout, per the design guide', () => {
  const box = async (page: Page, selector: string) =>
    (await page.locator(selector).first().boundingBox())!;

  test('at 1440px the facts sit beside the head, the stages side by side, cards three up', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, '1.4.3');
    const h1 = await box(page, 'h1');
    const facts = await box(page, '.facts');
    expect(facts.x).toBeGreaterThan(h1.x + h1.width / 2);

    const bad = await box(page, 'figure.bad');
    const good = await box(page, 'figure.good');
    expect(good.y).toBe(bad.y);
    expect(good.x).toBeGreaterThan(bad.x);

    const tops = await page
      .locator('ul.grid > li')
      .evaluateAll((lis) => lis.map((li) => Math.round(li.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(2); // six cards, three per row
  });

  test('at 390px everything stacks in one column with no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '1.4.3');
    const h1 = await box(page, 'h1');
    const facts = await box(page, '.facts');
    expect(facts.y).toBeGreaterThan(h1.y + h1.height);

    const bad = await box(page, 'figure.bad');
    const good = await box(page, 'figure.good');
    expect(good.y).toBeGreaterThan(bad.y + bad.height - 1);

    const lefts = await page
      .locator('ul.grid > li')
      .evaluateAll((lis) => lis.map((li) => Math.round(li.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(1);

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test('gives every card, pager and breadcrumb link a target of at least 24px (2.5.8)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '2.4.11');
    for (const link of await page.locator('ul.grid a, .pager a, .trail a').all()) {
      const b = (await link.boundingBox())!;
      expect(b.height, await link.innerText()).toBeGreaterThanOrEqual(24);
    }
  });
});
