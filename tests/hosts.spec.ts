import { test, expect } from '@playwright/test';

/**
 * One server, two hostnames. The dev server answers on 127.0.0.1, so each
 * suite names its host in `X-Forwarded-Host`, the header a proxy in front of
 * the container sets and the middleware reads first.
 *
 * These run with the default settings: canonicals point at the long domain
 * and the redirect table is switched off. The flip is covered by the
 * middleware unit tests, which stub the environment per case.
 */
const LONG = 'howmanydayssincemichiganhasbeatenohiostate.com';
const NEW = 'therivalrylab.com';

test.describe('the long domain, with the default settings', () => {
  test.use({ extraHTTPHeaders: { 'X-Forwarded-Host': LONG } });

  test('serves The Game at the root with no redirect and a canonical to itself', async ({ page, request }) => {
    const response = await request.get('/', { maxRedirects: 0 });
    expect(response.status()).toBe(200);

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HOW MANY DAYS SINCE');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://${LONG}/`);
    await expect(page.locator('#share-x')).toHaveAttribute('href', /url=https%3A%2F%2Fhowmanydayssincemichiganhasbeatenohiostate\.com$/);
  });

  test('keeps every internal link at the root', async ({ page }) => {
    await page.goto('/record/2024');
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((href) => href!.startsWith('/thegame'))).toEqual([]);
    await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'THE RECORD' })).toHaveAttribute('href', '/record');
  });

  test('renders the archive pages on demand and answers 404 for a year with no meeting', async ({ request }) => {
    expect((await request.get('/record/2024')).status()).toBe(200);
    expect((await request.get('/teams/ohio-state/2024')).status()).toBe(200);
    expect((await request.get('/record/1888')).status()).toBe(404);
    expect((await request.get('/teams/ohio-state/1888')).status()).toBe(404);
  });

  test('has nothing under /thegame/', async ({ request }) => {
    expect((await request.get('/thegame/')).status()).toBe(404);
    expect((await request.get('/thegame/record')).status()).toBe(404);
  });

  test('publishes the same robots.txt the build used to write', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    expect(await response.text()).toBe(`User-agent: *\nAllow: /\nSitemap: https://${LONG}/sitemap-index.xml\n`);
  });
});

test.describe('the new domain, with the default settings', () => {
  test.use({ extraHTTPHeaders: { 'X-Forwarded-Host': NEW } });

  test('serves the platform placeholder at the root, canonical to itself', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Rivalry Lab');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rivalry Lab');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://${NEW}/`);
    await expect(page.getByRole('link', { name: /The Game/ })).toHaveAttribute('href', '/thegame/');
  });

  test('serves the same page under /thegame/ that the long domain serves at /', async ({ page, browser }) => {
    await page.goto('/thegame/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('HOW MANY DAYS SINCE');
    const prefixed = await page.locator('main').innerText();

    const longContext = await browser.newContext({ extraHTTPHeaders: { 'X-Forwarded-Host': LONG } });
    const longPage = await longContext.newPage();
    await longPage.goto('/');
    const root = await longPage.locator('main').innerText();
    await longContext.close();

    expect(prefixed).toBe(root);
  });

  test('canonicalises The Game to the long domain while the flag says so', async ({ page }) => {
    for (const [path, canonical] of [
      ['/thegame/', `https://${LONG}/`],
      ['/thegame/record', `https://${LONG}/record/`],
      ['/thegame/record/2024', `https://${LONG}/record/2024/`],
      ['/thegame/rivalry-lab/about', `https://${LONG}/rivalry-lab/about/`],
      ['/thegame/mo-carmen', `https://${LONG}/mo-carmen/`],
    ]) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', canonical);
      await expect(page.locator('meta[property="og:url"]'), path).toHaveAttribute('content', canonical);
    }
  });

  test('prefixes every internal link and keeps assets at the root', async ({ page }) => {
    await page.goto('/thegame/record/2024');
    const nav = page.getByRole('navigation', { name: 'Site' });
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/thegame/');
    await expect(nav.getByRole('link', { name: 'THE RECORD' })).toHaveAttribute('href', '/thegame/record');
    await expect(page.getByRole('link', { name: '← EVERY MEETING' })).toHaveAttribute('href', '/thegame/record');

    const pageLinks = await page.locator('main a[href^="/"], nav a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
    expect(pageLinks.length).toBeGreaterThan(0);
    expect(pageLinks.filter((href) => !href.startsWith('/thegame/'))).toEqual([]);

    // Following a prefixed link lands on a page, and the favicon is still at the root.
    await page.getByRole('link', { name: '← EVERY MEETING' }).click();
    await expect(page).toHaveURL(/\/thegame\/record$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('THE RECORD');
    expect((await page.request.get('/favicon.svg')).status()).toBe(200);
  });

  test('runs Rivalry Lab through the prefixed server routes', async ({ page, request }) => {
    expect((await request.get('/thegame/api/health')).status()).toBe(200);
    expect((await request.get('/thegame/api/matchup?osuYear=1995&michYear=2023')).status()).toBe(200);
    expect((await request.get('/thegame/og/home.png')).headers()['content-type']).toContain('image/png');

    const apiCalls: string[] = [];
    page.on('request', (call) => {
      if (call.url().includes('/api/')) apiCalls.push(new URL(call.url()).pathname);
    });
    await page.goto('/thegame/rivalry-lab');
    await page.getByRole('button', { name: 'BUILD MATCHUP →' }).click();
    await expect(page.getByRole('heading', { name: 'TALE OF THE TAPE' })).toBeVisible();
    await page.getByRole('button', { name: 'SIMULATE MATCHUP →' }).click();
    await page.getByRole('button', { name: 'SIMULATE', exact: true }).click();
    await expect(page.locator('[data-game-score]')).toContainText('TYPICAL SCORE');

    expect(apiCalls.length).toBeGreaterThan(0);
    expect(apiCalls.filter((path) => !path.startsWith('/thegame/api/'))).toEqual([]);
  });

  test('serves no second copy of a page outside the prefix', async ({ request }) => {
    for (const path of ['/record', '/record/2024', '/rivalry-lab', '/countdown', '/api/health', '/og/home.png']) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test('keeps crawlers out while canonicals point at the long domain', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe('User-agent: *\nDisallow: /\n');
  });
});
