import { describe, expect, it } from 'vitest';
import games from '../../data/rivalry-games.json';
import { rivalrySnapshot } from '../rivalry-snapshot';
import { archivePageUrls } from '../sitemap-pages';

const SITE = 'https://howmanydayssincemichiganhasbeatenohiostate.com';

describe('archivePageUrls', () => {
  const urls = archivePageUrls(SITE);

  it('lists one record page per meeting and one page per team season', () => {
    expect(urls).toHaveLength(games.length + rivalrySnapshot.ratings.teamSeasons.length);
    expect(urls).toContain(`${SITE}/record/1897/`);
    expect(urls).toContain(`${SITE}/record/2025/`);
    expect(urls).toContain(`${SITE}/teams/ohio-state/2024/`);
    expect(urls).toContain(`${SITE}/teams/michigan/1970/`);
  });

  it('uses the trailing-slash form throughout', () => {
    expect(urls.every((url) => url.endsWith('/'))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('tolerates a site URL with a trailing slash', () => {
    expect(archivePageUrls(`${SITE}/`)[0]).toBe(`${SITE}/record/2025/`);
  });
});
