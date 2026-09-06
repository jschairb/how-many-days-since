import { describe, expect, it } from 'vitest';
import { gameDateIso, seasonForPath, sitemapLastmod } from '../sitemap-lastmod';

const SITE = 'https://howmanydayssincemichiganhasbeatenohiostate.com';
const build = new Date('2026-09-06T15:00:00Z');

describe('gameDateIso', () => {
  it('turns the record date and year into an ISO day', () => {
    expect(gameDateIso({ year: 2025, date: 'Nov 29' })).toBe('2025-11-29');
    expect(gameDateIso({ year: 1897, date: 'Oct 16' })).toBe('1897-10-16');
  });

  it('returns null when the record carries no date', () => {
    expect(gameDateIso({ year: 1900, date: null })).toBeNull();
    expect(gameDateIso({ year: 1900, date: 'sometime' })).toBeNull();
  });
});

describe('seasonForPath', () => {
  it('reads the season off record and team-season pages', () => {
    expect(seasonForPath('/record/1897/')).toBe(1897);
    expect(seasonForPath('/teams/ohio-state/2024/')).toBe(2024);
    expect(seasonForPath('/teams/michigan/2021')).toBe(2021);
  });

  it('leaves the live pages alone', () => {
    expect(seasonForPath('/')).toBeNull();
    expect(seasonForPath('/record/')).toBeNull();
    expect(seasonForPath('/countdown/')).toBeNull();
  });
});

describe('sitemapLastmod', () => {
  it('dates archive pages from their game', () => {
    expect(sitemapLastmod(`${SITE}/record/2024/`, build)).toBe('2024-11-30');
    expect(sitemapLastmod(`${SITE}/teams/michigan/2024/`, build)).toBe('2024-11-30');
  });

  it('dates the live pages from the build', () => {
    expect(sitemapLastmod(`${SITE}/`, build)).toBe('2026-09-06T15:00:00.000Z');
    expect(sitemapLastmod(`${SITE}/countdown/`, build)).toBe('2026-09-06T15:00:00.000Z');
  });

  it('falls back to the build date for a season without a recorded date', () => {
    expect(sitemapLastmod(`${SITE}/record/1900/`, build, [{ year: 1900, date: null }])).toBe('2026-09-06T15:00:00.000Z');
    expect(sitemapLastmod(`${SITE}/record/1888/`, build)).toBe('2026-09-06T15:00:00.000Z');
  });
});
