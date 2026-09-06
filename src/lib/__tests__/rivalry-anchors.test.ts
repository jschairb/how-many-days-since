import { describe, expect, it } from 'vitest';
import games from '../../data/rivalry-games.json';
import { nextRivalryGame } from '../next-rivalry-game';
import {
  earliestGame,
  gameDay,
  gameKickoffIso,
  gameLongDate,
  lastMichiganWin,
  lastOhioStateWin,
  lastSaturdayOfNovember,
  lastWinBy,
  latestGame,
  mostRecentScheduledGame,
} from '../rivalry-anchors';

const iso = (date: Date) => date.toISOString().slice(0, 10);

describe('game dates', () => {
  it('parses a record row into its calendar day', () => {
    expect(iso(gameDay({ year: 2025, date: 'Nov 29' }))).toBe('2025-11-29');
    expect(iso(gameDay({ year: 1897, date: 'Oct 16' }))).toBe('1897-10-16');
  });

  it('stamps the kickoff hour the page has always counted from', () => {
    expect(gameKickoffIso({ year: 2024, date: 'Nov 30' })).toBe('2024-11-30T17:00:00Z');
  });

  it('spells the date out for the page copy', () => {
    expect(gameLongDate({ year: 2024, date: 'Nov 30' })).toBe('November 30, 2024');
  });

  it('rejects a date the record does not format', () => {
    expect(() => gameDay({ year: 2025, date: '29 Nov' })).toThrow(/Unsupported game date/);
  });
});

describe('anchors', () => {
  it('reads the last Michigan win off the record', () => {
    expect(lastMichiganWin.game.year).toBe(2024);
    expect(lastMichiganWin.iso).toBe('2024-11-30T17:00:00Z');
    expect(lastMichiganWin.kickoff.toISOString()).toBe('2024-11-30T17:00:00.000Z');
    expect(lastMichiganWin.score).toBe('13-10');
    expect(lastMichiganWin.location).toBe('Columbus');
  });

  it('reads the last Ohio State win off the record', () => {
    expect(lastOhioStateWin.game.year).toBe(2025);
    expect(lastOhioStateWin.iso).toBe('2025-11-29T17:00:00Z');
    expect(lastOhioStateWin.score).toBe('27-9');
    expect(lastOhioStateWin.location).toBe('Ann Arbor');
  });

  it('finds the newest win whatever order the rows arrive in', () => {
    const rows = [...games].reverse();
    expect(lastWinBy('Michigan', rows).game.year).toBe(2024);
    expect(latestGame(rows).year).toBe(2025);
    expect(earliestGame(rows).year).toBe(1897);
  });

  it('refuses a team with no win in the record', () => {
    expect(() => lastWinBy('Michigan', games.filter((game) => game.winner !== 'Michigan'))).toThrow(/no win/);
  });
});

describe('The Game schedule', () => {
  it('lands on the last Saturday of November', () => {
    expect(iso(lastSaturdayOfNovember(2024))).toBe('2024-11-30');
    expect(iso(lastSaturdayOfNovember(2025))).toBe('2025-11-29');
    expect(iso(lastSaturdayOfNovember(2026))).toBe('2026-11-28');
    expect(iso(lastSaturdayOfNovember(2027))).toBe('2027-11-27');
    expect(iso(lastSaturdayOfNovember(2030))).toBe('2030-11-30');
  });

  it('keeps last season until this season has been played', () => {
    expect(iso(mostRecentScheduledGame(new Date('2026-09-05T16:00:00Z')))).toBe('2025-11-29');
    expect(iso(mostRecentScheduledGame(new Date('2026-11-27T23:00:00Z')))).toBe('2025-11-29');
  });

  it('turns over on game day in Columbus', () => {
    // 1:00 AM Eastern on the last Saturday of November 2026.
    expect(iso(mostRecentScheduledGame(new Date('2026-11-28T06:00:00Z')))).toBe('2026-11-28');
    expect(iso(mostRecentScheduledGame(new Date('2026-12-15T12:00:00Z')))).toBe('2026-11-28');
  });
});

/**
 * Drift guard. The deploy runs this suite, so a record that has not been given
 * the newest result cannot ship. The recorded Michigan win was inaccurate for
 * years once before; this keeps it from happening quietly.
 */
describe('the record is current', () => {
  it('holds the most recent playing of The Game', () => {
    const newest = latestGame();
    const scheduled = mostRecentScheduledGame(new Date());
    expect(
      gameDay(newest) >= scheduled,
      `The newest game in src/data/rivalry-games.json is ${iso(gameDay(newest))}, but The Game was played ` +
        `${iso(scheduled)}. Add the result to the record (see README, "After The Game").`
    ).toBe(true);
  });

  it('counts down to a game later than the newest result', () => {
    expect(
      new Date(nextRivalryGame.start) > gameDay(latestGame()),
      'src/lib/next-rivalry-game.ts still points at a game already in the record. Move it to the next season.'
    ).toBe(true);
  });
});
