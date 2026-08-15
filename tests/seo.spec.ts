import { test, expect } from '@playwright/test';

test('publishes canonical metadata and structured data for Rivalry Lab', async ({ page }) => {
  await page.goto('/rivalry-lab');

  await expect(page).toHaveTitle(/Rivalry Lab/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://howmanydayssincemichiganhasbeatenohiostate.com/rivalry-lab');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
});
