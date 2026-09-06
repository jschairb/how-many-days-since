import { test, expect } from '@playwright/test';

/** Each page answers at one URL: the trailing-slash form the sitemap lists. */
test.describe('one URL per page', () => {
  for (const path of ['/record', '/record/1897', '/mo-carmen', '/countdown', '/rivalry-lab/about', '/teams/ohio-state/2024']) {
    test(`redirects ${path} to the trailing-slash form`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe(`${path}/`);
    });
  }

  test('keeps the query string through the redirect', async ({ request }) => {
    const response = await request.get('/record?utm_source=test', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('/record/?utm_source=test');
  });

  test('leaves the API and the cards at their slashless URLs', async ({ request }) => {
    expect((await request.get('/api/health', { maxRedirects: 0 })).status()).toBe(200);
    expect((await request.get('/og/home.png', { maxRedirects: 0 })).status()).toBe(200);
    expect((await request.get('/og/record/2024.png', { maxRedirects: 0 })).status()).toBe(200);
  });

  test('answers 404 for a season that is not in the record', async ({ request }) => {
    expect((await request.get('/record/1888/')).status()).toBe(404);
    expect((await request.get('/teams/ohio-state/1888/')).status()).toBe(404);
    expect((await request.get('/teams/nobody/2024/')).status()).toBe(404);
  });

  test('links every meeting and team season in the trailing-slash form', async ({ page }) => {
    await page.goto('/record/');
    const hrefs = await page.locator('a[href^="/record/"], a[href^="/teams/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(200);
    expect(hrefs.filter((href) => !href.endsWith('/'))).toEqual([]);
  });

  test('links the adjacent meetings and the season pages in the trailing-slash form', async ({ page }) => {
    await page.goto('/record/2024/');
    await expect(page.getByRole('link', { name: /next meeting: 2025/i })).toHaveAttribute('href', '/record/2025/');
    await expect(page.getByRole('link', { name: /previous meeting: 2023/i })).toHaveAttribute('href', '/record/2023/');
    await expect(page.getByRole('link', { name: 'Ohio State 2024 season' })).toHaveAttribute('href', '/teams/ohio-state/2024/');
    await expect(page.getByRole('link', { name: 'EVERY MEETING' })).toHaveAttribute('href', '/record/');
    const nav = page.getByRole('navigation', { name: 'Site' });
    await expect(nav.getByRole('link', { name: 'THE RECORD' })).toHaveAttribute('href', '/record/');
    await expect(nav.getByRole('link', { name: 'RIVALRY LAB' })).toHaveAttribute('href', '/rivalry-lab/');
  });
});
