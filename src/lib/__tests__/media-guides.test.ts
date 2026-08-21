import { describe, expect, it } from 'vitest';
import { mediaGuideEmbedUrl, mediaGuideFor, mediaGuideItemUrl, mediaGuides } from '../media-guides';

describe('mediaGuides', () => {
  it('covers both programs', () => {
    expect(mediaGuides.some((guide) => guide.teamId === 'ohio-state')).toBe(true);
    expect(mediaGuides.some((guide) => guide.teamId === 'michigan')).toBe(true);
  });

  it('holds one guide per team-season', () => {
    const keys = mediaGuides.map((guide) => `${guide.teamId}:${guide.season}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('carries an identifier that names its own program and season', () => {
    for (const guide of mediaGuides) {
      expect(guide.identifier).toMatch(new RegExp(`^${guide.teamId}-football-${guide.season}-media-guide`));
    }
  });

  it('keeps Michigan State out of Michigan', () => {
    expect(mediaGuides.some((guide) => guide.identifier.startsWith('michigan-state'))).toBe(false);
  });
});

describe('mediaGuideFor', () => {
  it('finds a scanned season', () => {
    expect(mediaGuideFor('ohio-state', 2023)).toMatchObject({ teamId: 'ohio-state', season: 2023 });
  });

  it('returns nothing for a season the archive has not scanned', () => {
    expect(mediaGuideFor('ohio-state', 1897)).toBeUndefined();
  });

  it('keeps the two programs apart in the same season', () => {
    const michigan = mediaGuideFor('michigan', 2019);
    expect(michigan?.identifier).toContain('michigan-football-2019');
  });
});

describe('media guide urls', () => {
  const guide = { teamId: 'ohio-state', season: 2023, identifier: 'ohio-state-football-2023-media-guide-c', title: 'Ohio State football 2023 Media Guide' } as const;

  it('frames the reader from the archive rather than re-hosting the scan', () => {
    expect(mediaGuideEmbedUrl(guide)).toBe('https://archive.org/embed/ohio-state-football-2023-media-guide-c');
  });

  it('links the item page for the download and the rights notice', () => {
    expect(mediaGuideItemUrl(guide)).toBe('https://archive.org/details/ohio-state-football-2023-media-guide-c');
  });
});
