import { test, expect, type Page } from '@playwright/test';

/**
 * The card is white with scarlet and black type, so anything off-white means
 * the canvas has been painted rather than left blank.
 */
const inkedPixels = (page: Page) =>
  page.evaluate(() => {
    const canvas = document.getElementById('share-canvas') as HTMLCanvasElement;
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let inked = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 220 || data[i + 1] < 220 || data[i + 2] < 220) inked += 1;
    }
    return inked;
  });

const dayCount = async (page: Page) => (await page.locator('#days_count').textContent())!.trim();

test.describe('share badge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => inkedPixels(page)).toBeGreaterThan(1000);
  });

  test('sits in the corner with the menu closed', async ({ page }) => {
    await expect(page.locator('#share-trigger')).toBeVisible();
    await expect(page.locator('#share-trigger')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#share-menu')).toBeHidden();
  });

  test('keeps the graphic off the page', async ({ page }) => {
    // The card is only ever a file, never a preview duplicating the page.
    await expect(page.locator('#share-canvas')).toBeAttached();
    await expect(page.locator('#share-canvas')).toBeHidden();
  });

  test('does not overlap the headline at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    const badge = (await page.locator('#share-trigger').boundingBox())!;
    const heading = (await page.locator('main h1').boundingBox())!;
    expect(badge.y + badge.height).toBeLessThanOrEqual(heading.y);
  });

  test('opens and closes the menu', async ({ page }) => {
    await page.locator('#share-trigger').click();
    await expect(page.locator('#share-menu')).toBeVisible();
    await expect(page.locator('#share-trigger')).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(page.locator('#share-menu')).toBeHidden();

    await page.locator('#share-trigger').click();
    await page.locator('main h1').click();
    await expect(page.locator('#share-menu')).toBeHidden();
  });

  test('downloads a PNG named for the current count', async ({ page }) => {
    const days = await dayCount(page);
    await page.locator('#share-trigger').click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#share-download').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(`days-since-michigan-beat-ohio-state-${days}.png`);
    await expect(page.locator('#share-status')).toContainText(`${days} days since Michigan`);
  });

  test('copies the graphic to the clipboard as a PNG', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('#share-trigger').click();

    await page.locator('#share-copy').click();
    await expect(page.locator('#share-status')).toHaveText('Copied. Paste it into your post.');

    const types = await page.evaluate(async () => {
      const [item] = await navigator.clipboard.read();
      return item.types.join(',');
    });
    expect(types).toContain('image/png');
  });

  test('links to X with the count and the site URL as separate params', async ({ page }) => {
    const days = await dayCount(page);
    const url = new URL((await page.locator('#share-x').getAttribute('href'))!);

    expect(url.origin + url.pathname).toBe('https://x.com/intent/post');
    expect(url.searchParams.get('text')).toContain(`${days} days since Michigan beat Ohio State`);
    expect(url.searchParams.get('url')).toBe(
      'https://howmanydayssincemichiganhasbeatenohiostate.com'
    );
  });
});
