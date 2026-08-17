import { test, expect } from '@playwright/test';

const SITE = 'https://howmanydayssincemichiganhasbeatenohiostate.com';

/** Every page an Open Graph validator can reach, and the card it should claim. */
const PAGES = [
  { path: '/', card: `${SITE}/og/home.png` },
  { path: '/countdown', card: `${SITE}/og/countdown.png` },
  { path: '/record', card: `${SITE}/og/record.png` },
  { path: '/record/2024', card: `${SITE}/og/record/2024.png` },
  { path: '/rivalry-lab', card: `${SITE}/og/rivalry-lab.png` },
  { path: '/rivalry-lab/about', card: `${SITE}/og/rivalry-lab/about.png` },
  { path: '/teams/ohio-state/2024', card: `${SITE}/og/teams/ohio-state/2024.png` },
  { path: '/mo-carmen', card: `${SITE}/mo-carmen.png` },
];

/** The tags a scrape has to find before the link unfurls as a large card. */
const REQUIRED_TAGS = [
  'meta[property="og:type"]',
  'meta[property="og:site_name"]',
  'meta[property="og:locale"]',
  'meta[property="og:url"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:image:type"]',
  'meta[property="og:image:width"]',
  'meta[property="og:image:height"]',
  'meta[property="og:image:alt"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
];

for (const { path, card } of PAGES) {
  test(`publishes a complete Open Graph card on ${path}`, async ({ page }) => {
    await page.goto(path);

    for (const selector of REQUIRED_TAGS) {
      const content = await page.locator(selector).getAttribute('content');
      expect(content, `${selector} on ${path}`).toBeTruthy();
    }

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', card);
    await expect(page.locator('meta[property="og:logo"]')).toHaveAttribute(
      'content',
      `${SITE}/og-logo.png`
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE}${path === '/' ? '/' : path}`
    );

    // The card the page advertises has to be one the site actually serves.
    const image = await page.request.get(new URL(card).pathname);
    expect(image.status(), `${card} is served`).toBe(200);
    expect(image.headers()['content-type']).toContain('image/png');
  });
}

test('serves no card for a route that has no page', async ({ request }) => {
  expect((await request.get('/og/not-a-page.png')).status()).toBe(404);
  expect((await request.get('/og/record/1888.png')).status()).toBe(404);
});

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
  await expect(page.getByRole('link', { name: 'OPEN THE LAB' }).first()).toHaveAttribute('href', '/rivalry-lab');
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
});

test('links to methodology from the Rivalry Lab header', async ({ page }) => {
  await page.goto('/rivalry-lab');

  await expect(page.getByRole('link', { name: 'METHOD & SOURCES →' })).toHaveAttribute(
    'href',
    '/rivalry-lab/about'
  );
});
