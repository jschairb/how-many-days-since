import { expect, test } from '@playwright/test';

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

test('publishes the next game countdown with canonical event metadata', async ({ page }) => {
  await page.goto('/countdown');

  await expect(page).toHaveTitle(/Countdown to The Game/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://howmanydayssincemichiganhasbeatenohiostate.com/countdown/'
  );
  await expect(page.getByRole('heading', { name: 'THE GAME', exact: true })).toBeVisible();
  await expect(page.locator('[data-countdown-days]')).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(3);
  expect(await page.locator('script[type="application/ld+json"]').nth(2).evaluate((element) => element.textContent)).toContain('2026-11-28T12:00:00-05:00');
});

test('keeps the selected team in the URL and offers a shareable link', async ({ page }) => {
  await page.goto('/countdown');

  await page.getByRole('button', { name: 'MICHIGAN' }).click();
  await expect(page).toHaveURL(/team=michigan/);
  await expect(page.locator('[data-countdown]')).toHaveAttribute('data-team', 'michigan');
  await expect(page.getByRole('button', { name: 'COPY COUNTDOWN LINK' })).toBeVisible();
});

test('tracks palette selection and a copied countdown link without requiring GA', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/countdown');

  await page.getByRole('button', { name: 'MICHIGAN' }).click();
  await page.getByRole('button', { name: 'COPY COUNTDOWN LINK' }).click();

  await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'countdown_palette_selected', { team: 'michigan' }]);
  await expect.poll(() => capturedEvents(page)).toContainEqual(['event', 'countdown_shared', { method: 'clipboard', team: 'michigan' }]);
});

test('links the home next-game line to the countdown and colors Columbus on hover', async ({ page }) => {
  await page.goto('/');

  const nextGame = page.getByRole('link', { name: /next game: november 28, 2026 - columbus/i });
  await expect(nextGame).toHaveAttribute('href', '/countdown');
  await expect(nextGame).toHaveClass(/next-game-link/);
});
