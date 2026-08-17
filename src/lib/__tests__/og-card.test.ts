import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OG_IMAGE_PATH,
  headlineText,
  ogCardAlt,
  ogImagePathFor,
  pagePathForOgRoute,
  resolveOgCard,
} from '../og-card';

const NOW = new Date('2026-08-17T16:00:00Z');

describe('resolveOgCard', () => {
  it('counts the days since the last Michigan win on the home card', () => {
    const card = resolveOgCard('/', NOW);

    expect(card?.metric).toEqual({ value: '625', unit: 'DAYS' });
    expect(card?.detail).toContain('Ohio State 27, Michigan 9');
    // The streak is Ohio State's, so the card wears scarlet.
    expect(card?.team).toBe('ohio-state');
  });

  it('counts down to kickoff on the countdown card', () => {
    const card = resolveOgCard('/countdown', NOW);

    expect(card?.metric).toEqual({ value: '103', unit: 'DAYS' });
    expect(card?.detail).toContain('November 28, 2026');
    expect(card?.team).toBe('rivalry');
  });

  it('drops the countdown to a kickoff banner once the game arrives', () => {
    const card = resolveOgCard('/countdown', new Date('2026-11-28T18:00:00Z'));

    expect(card?.metric).toBeUndefined();
    expect(card?.headline).toBe('IT IS HERE');
  });

  it('reports the meeting count on the record card', () => {
    const card = resolveOgCard('/record', NOW);

    expect(card?.headline).toBe('THE RECORD');
    expect(card?.eyebrow).toBe('EVERY MEETING · 1897-2025');
    expect(card?.detail).toContain('All 121 Ohio State-Michigan meetings');
  });

  it('colors each team in a rivalry meeting score', () => {
    const card = resolveOgCard('/record/2024', NOW);

    expect(card?.headline).toEqual([
      { text: 'MICHIGAN', tone: 'michigan' },
      { text: '13–10' },
      { text: 'OHIO STATE', tone: 'ohio-state' },
    ]);
    expect(card?.detail).toBe('Nov 30 · Columbus');
    // The winner's colors dress the card.
    expect(card?.team).toBe('michigan');
  });

  it('keeps both sides of a tied meeting in ink', () => {
    const card = resolveOgCard('/record/1992', NOW);

    // Both sides carry "Tie", and neither may be read as a team.
    expect(card?.headline).toEqual([
      { text: 'TIE', tone: 'ink' },
      { text: '13–13' },
      { text: 'TIE', tone: 'ink' },
    ]);
    expect(card?.team).toBe('rivalry');
  });

  it('keeps every tied meeting neutral', () => {
    for (const year of [1900, 1910, 1941, 1949, 1973, 1992]) {
      const card = resolveOgCard(`/record/${year}`, NOW);
      const tones = (card!.headline as { tone?: string }[]).map((span) => span.tone);

      expect(tones, `${year}`).not.toContain('michigan');
      expect(tones, `${year}`).not.toContain('ohio-state');
      expect(card?.team, `${year}`).toBe('rivalry');
    }
  });

  it('summarises a team season without leaking the raw margin float', () => {
    const card = resolveOgCard('/teams/michigan/1997', NOW);

    expect(headlineText(card!.headline!)).toBe('MICHIGAN 12-0');
    expect(card?.detail).toBe('12 games · 322 for · 114 against · +17.3 per game');
    expect(card?.team).toBe('michigan');
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
  it('reads back every word drawn on the card', () => {
    expect(
      ogCardAlt({
        eyebrow: 'EVERY MEETING',
        headline: 'THE RECORD',
        detail: 'All 121 meetings',
        team: 'rivalry',
      })
    ).toBe('EVERY MEETING. THE RECORD. All 121 meetings');
  });

  it('reads the oversized figure and the colored spans', () => {
    expect(
      ogCardAlt({
        eyebrow: 'COUNTDOWN',
        metric: { value: '103', unit: 'DAYS' },
        headline: [{ text: 'OHIO STATE', tone: 'ohio-state' }, { text: '27–9' }],
        detail: 'Columbus',
        team: 'rivalry',
      })
    ).toBe('COUNTDOWN. 103 DAYS. OHIO STATE 27–9. Columbus');
  });
});
