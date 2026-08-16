import { describe, expect, it } from 'vitest';
import { nextRivalryGame } from '../next-rivalry-game';

describe('nextRivalryGame', () => {
  it('centralizes the 2026 Columbus kickoff in Eastern time', () => {
    expect(nextRivalryGame).toMatchObject({
      date: 'November 28, 2026',
      location: 'Columbus',
      timeZone: 'America/New_York',
      start: '2026-11-28T12:00:00-05:00',
    });
  });
});
