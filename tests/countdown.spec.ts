import { expect, test } from '@playwright/test';

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

test('links the home next-game line to the countdown and colors Columbus on hover', async ({ page }) => {
  await page.goto('/');

  const nextGame = page.getByRole('link', { name: /next game: november 28, 2026 - columbus/i });
  await expect(nextGame).toHaveAttribute('href', '/countdown');
  await expect(nextGame).toHaveClass(/next-game-link/);
});
