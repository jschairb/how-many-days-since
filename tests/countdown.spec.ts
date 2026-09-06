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
  const event = JSON.parse((await page.locator('script[type="application/ld+json"]').nth(2).textContent())!);
  expect(event['@type']).toBe('SportsEvent');
  expect(event.startDate).toBe('2026-11-28T12:00:00-05:00');
  expect(event.location).toMatchObject({ name: 'Ohio Stadium', address: { addressLocality: 'Columbus', addressRegion: 'OH' } });
  expect(event.organizer.name).toBe('Ohio State Buckeyes');
  expect(event.performer.map((team: { name: string }) => team.name)).toEqual(['Ohio State Buckeyes', 'Michigan Wolverines']);
  expect(event.image).toBe('https://howmanydayssincemichiganhasbeatenohiostate.com/og/countdown.png');
  expect(event.eventStatus).toBe('https://schema.org/EventScheduled');
});

test('links the home next-game line to the countdown and colors Columbus on hover', async ({ page }) => {
  await page.goto('/');

  const nextGame = page.getByRole('link', { name: /next game: november 28, 2026 - columbus/i });
  await expect(nextGame).toHaveAttribute('href', '/countdown/');
  await expect(nextGame).toHaveClass(/next-game-link/);
});
