import { test, expect } from '@playwright/test';

test('publishes canonical metadata and structured data for Rivalry Lab', async ({ page }) => {
  await page.goto('/rivalry-lab');

  await expect(page).toHaveTitle(/Rivalry Lab/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://howmanydayssincemichiganhasbeatenohiostate.com/rivalry-lab');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
});

test('publishes an evidence-labeled Rivalry Lab methodology page', async ({ page }) => {
  await page.goto('/rivalry-lab/about');

  await expect(page).toHaveTitle(/Rivalry Lab Methodology/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://howmanydayssincemichiganhasbeatenohiostate.com/rivalry-lab/about'
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://howmanydayssincemichiganhasbeatenohiostate.com/og/rivalry-lab/about.png'
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  await expect(page.getByRole('heading', { level: 1, name: 'HOW RIVALRY LAB WORKS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'WHAT THE LAB SHOWS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'WHAT IT DOES NOT CLAIM' })).toBeVisible();
  await expect(page.getByText('OBSERVED', { exact: true })).toBeVisible();
  await expect(page.getByText('DERIVED', { exact: true })).toBeVisible();
  await expect(page.getByText('SIMULATED', { exact: true })).toBeVisible();
  const labNav = page.getByRole('navigation', { name: 'Rivalry Lab' });
  await expect(labNav.getByRole('link', { name: 'OPEN THE LAB' })).toHaveAttribute('href', '/rivalry-lab');
  await expect(labNav.getByRole('link', { name: 'METHOD' })).toHaveAttribute('href', '/rivalry-lab/about');
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
});

test('links to methodology from the Rivalry Lab provenance panel', async ({ page }) => {
  await page.goto('/rivalry-lab');
  await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();

  await expect(page.getByTestId('snapshot-provenance').getByRole('link', { name: 'READ THE METHOD' })).toHaveAttribute(
    'href',
    '/rivalry-lab/about'
  );
});
