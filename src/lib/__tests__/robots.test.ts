import { describe, expect, it } from 'vitest';
import { LONG_HOST, NEW_HOST, readHostConfig, siteContextFor } from '../hosts';
import { robotsTxt } from '../robots';
import { GET } from '../../pages/robots.txt';

/** What `astro-robots-txt` wrote to `dist/client/robots.txt` before this endpoint replaced it. */
const LEGACY_ROBOTS = `User-agent: *\nAllow: /\nSitemap: https://${LONG_HOST}/sitemap-index.xml\n`;

describe('robotsTxt', () => {
  const defaults = readHostConfig({});
  const flipped = readHostConfig({ CANONICAL_HOST: NEW_HOST });

  it('writes the same file the build integration wrote, on the long domain by default', () => {
    expect(robotsTxt(siteContextFor(LONG_HOST, defaults))).toBe(LEGACY_ROBOTS);
    expect(robotsTxt(siteContextFor('localhost', defaults))).toBe(LEGACY_ROBOTS);
  });

  it('keeps crawlers off the new host while canonicals point at the long domain', () => {
    expect(robotsTxt(siteContextFor(NEW_HOST, defaults))).toBe('User-agent: *\nDisallow: /\n');
  });

  it('opens the new host and keeps the long domain crawlable after the flip', () => {
    const expected = `User-agent: *\nAllow: /\nSitemap: https://${NEW_HOST}/sitemap-index.xml\n`;
    expect(robotsTxt(siteContextFor(NEW_HOST, flipped))).toBe(expected);
    // The old URLs must stay fetchable so a crawler can see their redirects.
    expect(robotsTxt(siteContextFor(LONG_HOST, flipped))).toBe(expected);
  });
});

describe('GET /robots.txt', () => {
  it('serves the body as plain text from the middleware context', async () => {
    const request = new Request(`https://${LONG_HOST}/robots.txt`, { headers: { host: LONG_HOST } });
    const response = await GET({ request, locals: { site: siteContextFor(LONG_HOST, readHostConfig({})) } } as never);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(await response.text()).toBe(LEGACY_ROBOTS);
  });

  it('falls back to the request host when the middleware did not run', async () => {
    const request = new Request('http://127.0.0.1/robots.txt', { headers: { 'x-forwarded-host': NEW_HOST } });
    const response = await GET({ request, locals: {} } as never);
    expect(await response.text()).toBe('User-agent: *\nDisallow: /\n');
  });
});
