import { describe, expect, it } from 'vitest';
import { NEW_HOST } from '../hosts';
import { platformIndexHtml, platformIndexResponse } from '../platform-index';

describe('platform index', () => {
  it('names the platform, says one thing, and links to The Game', () => {
    const html = platformIndexHtml();
    expect(html).toContain('<title>Rivalry Lab</title>');
    expect(html).toContain('<h1>Rivalry Lab</h1>');
    expect(html).toContain('href="/thegame/"');
  });

  it('is its own canonical on the new host', () => {
    expect(platformIndexHtml()).toContain(`<link rel="canonical" href="https://${NEW_HOST}/" />`);
  });

  it('answers as an HTML document', async () => {
    const response = platformIndexResponse();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await response.text()).toBe(platformIndexHtml());
  });
});
