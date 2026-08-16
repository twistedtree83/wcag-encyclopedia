import { test, expect } from '@playwright/test';

/** Real narrow window. */
test.describe('at a 320px window', () => {
  test.use({ viewport: { width: 320, height: 720 } });

  test('replaces the rail with a drawer toggle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.rail')).toBeHidden();
    await expect(page.locator('.nav-toggle')).toBeVisible();
  });

  test('opens the drawer, traps focus in it, and closes on Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-toggle').click();

    const drawer = page.locator('.drawer');
    await expect(drawer).toBeVisible();
    // showModal() makes the rest of the page inert — a Tab cannot land outside.
    await page.keyboard.press('Tab');
    await expect(drawer.locator(':focus')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('returns focus to the trigger when the drawer closes', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.nav-toggle');
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
  });

  test('offers search and the level filter inside the drawer', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-toggle').click();
    const drawer = page.locator('.drawer');
    await expect(drawer.locator('.controls__input')).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Level A', exact: true })).toBeVisible();
  });

  test('gives every drawer link a 44px touch target', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-toggle').click();
    const links = page.locator('.drawer__link');
    for (let i = 0; i < (await links.count()); i++) {
      const box = await links.nth(i).boundingBox();
      expect(box!.height, `drawer link ${i}`).toBeGreaterThanOrEqual(44);
    }
  });

  test('never scrolls horizontally, drawer open or closed', async ({ page }) => {
    await page.goto('/');
    const overflows = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
    expect(await overflows()).toBe(false);
    await page.locator('.nav-toggle').click();
    expect(await overflows()).toBe(false);
  });
});

test('keeps full behaviour at 200% zoom', async ({ page }) => {
  // 200% zoom on a 1280px screen presents as a 640px viewport.
  await page.setViewportSize({ width: 640, height: 512 });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.nav-toggle')).toBeVisible();
  await expect(page.locator('.card').first()).toBeVisible();
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test.describe('the viewport preview', () => {
  test('narrows the whole page, not just the examples', async ({ page }) => {
    await page.goto('/');
    const frame = page.locator('.preview');
    const wide = (await frame.boundingBox())!.width;

    await page.getByRole('button', { name: '320px', exact: true }).click();
    const narrow = (await frame.boundingBox())!.width;

    expect(narrow).toBeLessThan(wide);
    expect(narrow).toBeCloseTo(320, -1);
    // The rail is gone because the *frame* narrowed — a container query, not a media query.
    await expect(page.locator('.rail')).toBeHidden();
  });

  test('opens the drawer when 320px is selected', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '320px', exact: true }).click();
    await expect(page.locator('.drawer')).toBeVisible();
  });

  test('exposes the pressed state of each viewport option', async ({ page }) => {
    await page.goto('/');
    const desktop = page.getByRole('button', { name: 'Desktop' });
    const tablet = page.getByRole('button', { name: 'Tablet' });
    await expect(desktop).toHaveAttribute('aria-pressed', 'true');
    await tablet.click();
    await expect(tablet).toHaveAttribute('aria-pressed', 'true');
    await expect(desktop).toHaveAttribute('aria-pressed', 'false');
  });
});

test('the preview picker stays reachable at every width it can select', async ({ page }) => {
  await page.goto('/');
  // Regression: the picker used to live inside the frame it resizes, so choosing Tablet or
  // 320px narrowed the frame past the breakpoint and hid the only control that could undo it.
  for (const name of ['Tablet', '320px', 'Desktop']) {
    await page.getByRole('button', { name, exact: true }).click();

    // Selecting 320px opens the drawer, which is a modal and correctly makes the rest of the
    // page inert. Dismiss it the way a reader would before checking the picker is usable.
    const drawer = page.locator('.drawer');
    if (await drawer.isVisible()) await page.keyboard.press('Escape');

    await expect(page.locator('.viewport-picker')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Desktop', exact: true })).toBeEnabled();
  }
});

test('no element id appears twice, with the drawer open or closed', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  const duplicates = async () =>
    page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
  // Two Controls instances live in the DOM at once; sharing ids makes `label for` ambiguous.
  expect(await duplicates()).toEqual([]);
  await page.locator('.nav-toggle').click();
  expect(await duplicates()).toEqual([]);
});
