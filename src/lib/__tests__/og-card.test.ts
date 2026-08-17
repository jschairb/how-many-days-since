import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OG_IMAGE_PATH,
  ogCardAlt,
  ogImagePathFor,
  pagePathForOgRoute,
  resolveOgCard,
} from '../og-card';

const NOW = new Date('2026-08-17T16:00:00Z');

describe('resolveOgCard', () => {
  it('counts the days since the last Michigan win on the home card', () => {
    const card = resolveOgCard('/', NOW);

    expect(card?.title).toBe('625 DAYS SINCE MICHIGAN BEAT OHIO STATE');
    expect(card?.description).toContain('Ohio State 27, Michigan 9');
  });

  it('counts down to kickoff on the countdown card', () => {
    const card = resolveOgCard('/countdown', NOW);

    expect(card?.title).toBe('103 DAYS TO THE GAME');
    expect(card?.description).toContain('November 28, 2026');
  });

  it('drops the countdown to a kickoff banner once the game arrives', () => {
    const card = resolveOgCard('/countdown', new Date('2026-11-28T18:00:00Z'));

    expect(card?.title).toBe('THE GAME IS HERE');
  });

  it('reports the meeting count on the record card', () => {
    const card = resolveOgCard('/record', NOW);

    expect(card?.title).toBe('THE RECORD');
    expect(card?.description).toBe('All 121 Ohio State-Michigan meetings, 1897-2025');
  });

  it('scores a single rivalry meeting', () => {
    const card = resolveOgCard('/record/2024', NOW);

    expect(card?.title).toBe('MICHIGAN 13, OHIO STATE 10');
    expect(card?.description).toBe('2024 · Nov 30 · Columbus');
  });

  it('summarises a team season', () => {
    const card = resolveOgCard('/teams/ohio-state/2024', NOW);

    expect(card?.title).toBe('2024 OHIO STATE');
    expect(card?.description).toContain('Rivalry season archive');
  });

  it('ignores a trailing slash', () => {
    expect(resolveOgCard('/record/', NOW)).toEqual(resolveOgCard('/record', NOW));
  });

  it('has no card for a meeting that never happened', () => {
    expect(resolveOgCard('/record/1888', NOW)).toBeNull();
  });

  it('has no card for a page that ships its own artwork', () => {
    expect(resolveOgCard('/mo-carmen', NOW)).toBeNull();
  });
});

describe('ogImagePathFor', () => {
  it('names the home card', () => {
    expect(ogImagePathFor('/')).toBe('/og/home.png');
  });

  it('mirrors the page path for every other card', () => {
    expect(ogImagePathFor('/rivalry-lab/about')).toBe('/og/rivalry-lab/about.png');
    expect(ogImagePathFor('/record/1969')).toBe('/og/record/1969.png');
  });

  it('falls back to the site card rather than pointing at a missing image', () => {
    expect(ogImagePathFor('/mo-carmen')).toBe(DEFAULT_OG_IMAGE_PATH);
    expect(ogImagePathFor('/nothing-here')).toBe(DEFAULT_OG_IMAGE_PATH);
  });
});

describe('pagePathForOgRoute', () => {
  it('round-trips every page path through its image path', () => {
    for (const page of ['/', '/countdown', '/record', '/record/2024', '/teams/michigan/1997']) {
      const route = ogImagePathFor(page).replace('/og/', '');
      expect(pagePathForOgRoute(route)).toBe(page);
    }
  });

  it('rejects anything that is not a card request', () => {
    expect(pagePathForOgRoute(undefined)).toBeNull();
    expect(pagePathForOgRoute('record/2024')).toBeNull();
    expect(pagePathForOgRoute('../../etc/passwd.png')).toBeNull();
    expect(pagePathForOgRoute('record//2024.png')).toBeNull();
  });
});

describe('ogCardAlt', () => {
  it('reads back the words drawn on the card', () => {
    expect(ogCardAlt({ title: 'THE RECORD', description: 'All 121 meetings' })).toBe(
      'THE RECORD — All 121 meetings'
    );
  });
});
