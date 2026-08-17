import { test, expect } from '@playwright/test';

const PHONE = { width: 375, height: 720 };
const WIDE = { width: 1024, height: 800 };

test.describe('site navigation', () => {
  test('keeps every link on the bar above the breakpoint', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Site' });
    await expect(page.locator('.site-nav-toggle')).toBeHidden();
    for (const label of ['COUNTDOWN', 'THE RECORD', 'RIVALRY LAB', 'MERCH']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }

    // The row is only worth keeping while it fits without scrolling.
    const overflow = await nav.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBe(0);
  });

  test('collapses to the home icon and a toggle on a phone', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Site' });
    const toggle = page.locator('.site-nav-toggle');

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'COUNTDOWN' })).toBeHidden();

    // Nothing may spill sideways once the links are behind the toggle.
    expect(await nav.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
  });

  test('opens the links as full-width rows and closes again', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Site' });
    const toggle = page.locator('.site-nav-toggle');
    const countdown = nav.getByRole('link', { name: 'COUNTDOWN' });

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(countdown).toBeVisible();
    await expect(nav.getByRole('link', { name: 'MERCH' })).toBeVisible();

    // Stacked rows should be comfortably tappable, not 13px text links.
    const row = (await countdown.boundingBox())!;
    expect(row.height).toBeGreaterThanOrEqual(44);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(countdown).toBeHidden();
  });

  test('closes on Escape and on a click outside the nav', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');

    const toggle = page.locator('.site-nav-toggle');

    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.getByRole('heading', { level: 1 }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('drops the open state when the viewport grows past the breakpoint', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');

    const toggle = page.locator('.site-nav-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.setViewportSize(WIDE);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('marks the current page inside the collapsed menu', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/countdown');

    await page.locator('.site-nav-toggle').click();
    const current = page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'COUNTDOWN' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current).toBeVisible();
  });

  test('carries Share as the last row of the menu on the home page', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');

    const share = page.locator('#site-nav #share-trigger');
    await expect(share).toBeHidden();

    await page.locator('.site-nav-toggle').click();
    await expect(share).toBeVisible();

    // It reads as a menu row: same width and rhythm as the links above it.
    const merch = (await page.getByRole('link', { name: 'MERCH' }).boundingBox())!;
    const row = (await share.boundingBox())!;
    expect(row.x).toBe(merch.x);
    expect(row.width).toBe(merch.width);
    expect(row.y).toBeGreaterThan(merch.y);
  });

  test('keeps every destination reachable without JavaScript', async ({ browser }) => {
    // Nothing may hide a link that only a click handler could bring back, so
    // the bar falls back to the scrolling row it had before the collapse.
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: PHONE });
    const page = await context.newPage();
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Site' });
    await expect(nav).not.toHaveClass(/collapsible/);
    await expect(page.locator('.site-nav-toggle')).toBeHidden();
    for (const label of ['COUNTDOWN', 'THE RECORD', 'RIVALRY LAB', 'MERCH']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }

    // Share falls back to the pinned pill rather than a hidden menu row.
    expect(await page.locator('#share-clip').evaluate((el) => getComputedStyle(el).position)).toBe(
      'fixed'
    );
    await expect(page.locator('#share-trigger')).toBeVisible();

    await context.close();
  });

  test('leaves the desktop ribbon in the corner', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto('/');

    // Above the breakpoint Share is still the pinned badge, not a nav item.
    await expect(page.locator('#share-trigger')).toBeVisible();
    expect(await page.locator('#share-clip').evaluate((el) => getComputedStyle(el).position)).toBe(
      'fixed'
    );
    const nav = page.getByRole('navigation', { name: 'Site' });
    expect(await nav.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
  });
});
