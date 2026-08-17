import { test, expect } from '@playwright/test';

const capturedEvents = (page: any) => page.evaluate(() => JSON.parse(sessionStorage.getItem('analytics-events') ?? '[]'));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    type AnalyticsWindow = Window & { analyticsEvents: unknown[]; gtag: (...args: unknown[]) => void };
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow.analyticsEvents = JSON.parse(sessionStorage.getItem('analytics-events') ?? '[]');
    analyticsWindow.gtag = (...args: unknown[]) => {
      analyticsWindow.analyticsEvents.push(args);
      sessionStorage.setItem('analytics-events', JSON.stringify(analyticsWindow.analyticsEvents));
    };
  });
});

test.describe('Count', () => {
  test('does not render a rotating image section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.hero')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /another one/i })).toHaveCount(0);
  });

  test('links to the Rivalry Lab collection and features the commemorative tee', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'MERCH' })).toHaveAttribute(
      'href',
      'https://gwpworkshop.com/collections/rivalry-lab'
    );
    await expect(
      page.getByRole('link', { name: /shop the 2025 commemorative tee/i })
    ).toHaveAttribute(
      'href',
      'https://gwpworkshop.com/products/script-in-the-snow-the-2025-rivalry-game-commemorative-tee'
    );
  });

  test('tracks the featured product and its placement', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /shop the 2025 commemorative tee/i }).click();

    await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'merch_product_opened', {
      product: 'script-in-the-snow',
      placement: 'home_featured',
    }]);
  });

  test('renders the handoff counter and shared navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/How many days since Michigan has beaten Ohio State/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HOW MANY DAYS SINCE');
    const nav = page.getByRole('navigation', { name: 'Site' });
    await expect(nav.getByRole('link')).toHaveCount(5);
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(nav.getByRole('link', { name: 'COUNTDOWN' })).toHaveAttribute('href', '/countdown');
    await expect(page.locator('[data-live-count]')).toHaveAttribute('data-reference-date', '2024-11-30T17:00:00Z');
  });

  test('counts Eastern calendar days, not elapsed 24-hour periods', async ({ page }) => {
    // 8:00 AM Eastern on 2026-08-16 — before 1:00 PM, where the old
    // elapsed-time math lagged one behind. Nov 30 2024 → Aug 16 2026 = 624.
    await page.clock.install({ time: new Date('2026-08-16T12:00:00Z') });
    await page.goto('/');

    await expect(page.locator('#days_count')).toHaveText('624');
  });

  test('displays a numeric days count and historical totals', async ({ page }) => {
    await page.goto('/');
    const count = page.locator('.counter strong');
    await expect(count).toBeVisible();
    expect(Number((await count.textContent())?.replaceAll(',', ''))).toBeGreaterThanOrEqual(0);
    await expect(page.getByText('ALL-TIME SERIES (M-OSU-T), 1897-2025')).toBeVisible();
    await expect(page.getByText('NEXT GAME: November 28, 2026 - Columbus.')).toBeVisible();
  });

  test('keeps the Share ribbon aligned to the content and removes image captions', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('figcaption')).toHaveCount(0);
    await expect(page.locator('.featured-merch img')).toHaveAttribute('alt', /.+/);
    await expect(page.getByRole('link', { name: 'Great Western Productions' })).toHaveAttribute(
      'href',
      'https://greatwesternproductions.com'
    );

    const content = await page.locator('.site-main').boundingBox();
    const ribbon = await page.locator('#share-clip').boundingBox();
    expect(content).not.toBeNull();
    expect(ribbon).not.toBeNull();
    expect(ribbon!.x + ribbon!.width).toBeCloseTo(content!.x + content!.width - 40, 0);
  });
});
