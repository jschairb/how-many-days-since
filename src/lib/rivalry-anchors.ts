/**
 * The two dates the home page counts from, read out of `rivalry-games.json`.
 *
 * The record is the one source for game dates. The counters, the Open Graph
 * card, the meta description, and the FAQ answers all derive their anchors
 * here, so adding a game to the record moves every number at once and no
 * template carries a date of its own.
 */
import games from '../data/rivalry-games.json';
import { columbusCalendarDay } from './days';

export type AnchorTeam = 'Michigan' | 'Ohio State';

export type RivalryGameRow = (typeof games)[number];

/** One side's most recent win, with the facts the page states about it. */
export interface WinAnchor {
  team: AnchorTeam;
  /** The game row the anchor was read from. */
  game: RivalryGameRow;
  /** Kickoff-hour ISO stamp on the game's calendar day, for the live counters. */
  iso: string;
  /** The same instant as `iso`, for `calcDaysSince`. */
  kickoff: Date;
  /** Midnight UTC on the game's calendar day, for comparing calendar days. */
  day: Date;
  /** "November 30, 2024" */
  longDate: string;
  /** "13-10" */
  score: string;
  location: string;
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** The game's calendar day as midnight UTC, parsed from `year` and a "Nov 29" date. */
export function gameDay(game: Pick<RivalryGameRow, 'year' | 'date'>): Date {
  const [, month, day] = game.date.match(/^(\w{3})\s+(\d{1,2})$/) ?? [];
  const monthNumber = MONTHS[month];
  if (monthNumber === undefined || !day) throw new Error(`Unsupported game date: ${game.date} (${game.year})`);
  return new Date(Date.UTC(game.year, monthNumber, Number(day)));
}

/**
 * Noon Eastern on the game's day, in the form the page has always exposed as
 * its reference date. The counter counts Eastern calendar days, so any hour
 * inside the day yields the same number.
 */
export function gameKickoffIso(game: Pick<RivalryGameRow, 'year' | 'date'>): string {
  return `${gameDay(game).toISOString().slice(0, 10)}T17:00:00Z`;
}

/** "November 30, 2024" */
export function gameLongDate(game: Pick<RivalryGameRow, 'year' | 'date'>): string {
  const day = gameDay(game);
  return `${MONTH_NAMES[day.getUTCMonth()]} ${day.getUTCDate()}, ${day.getUTCFullYear()}`;
}

/** The most recently played game in the record. */
export function latestGame(rows: readonly RivalryGameRow[] = games): RivalryGameRow {
  if (rows.length === 0) throw new Error('The rivalry record is empty');
  return rows.reduce((latest, game) => (gameDay(game) > gameDay(latest) ? game : latest));
}

/** The earliest game in the record. */
export function earliestGame(rows: readonly RivalryGameRow[] = games): RivalryGameRow {
  if (rows.length === 0) throw new Error('The rivalry record is empty');
  return rows.reduce((earliest, game) => (gameDay(game) < gameDay(earliest) ? game : earliest));
}

/** The most recent game `team` won, with the facts the page states about it. */
export function lastWinBy(team: AnchorTeam, rows: readonly RivalryGameRow[] = games): WinAnchor {
  const wins = rows.filter((game) => game.winner === team);
  if (wins.length === 0) throw new Error(`${team} has no win in the rivalry record`);
  const game = latestGame(wins);
  return {
    team,
    game,
    iso: gameKickoffIso(game),
    kickoff: new Date(gameKickoffIso(game)),
    day: gameDay(game),
    longDate: gameLongDate(game),
    score: `${game.wScore}-${game.lScore}`,
    location: game.location ?? 'Site not reported',
  };
}

/** The last Saturday of November in `year`, as midnight UTC. */
export function lastSaturdayOfNovember(year: number): Date {
  const november30 = new Date(Date.UTC(year, 10, 30));
  // getUTCDay: Sunday is 0, Saturday is 6.
  const daysPastSaturday = (november30.getUTCDay() + 1) % 7;
  return new Date(Date.UTC(year, 10, 30 - daysPastSaturday));
}

/**
 * The date The Game was most recently scheduled for, on or before `now` as a
 * Columbus calendar day. The Game is played on the last Saturday of November,
 * so this is that Saturday in the current year once it has passed, and the
 * previous year's until then.
 */
export function mostRecentScheduledGame(now: Date = new Date()): Date {
  const today = new Date(columbusCalendarDay(now));
  const thisYear = lastSaturdayOfNovember(today.getUTCFullYear());
  return thisYear <= today ? thisYear : lastSaturdayOfNovember(today.getUTCFullYear() - 1);
}

export const lastMichiganWin: WinAnchor = lastWinBy('Michigan');
export const lastOhioStateWin: WinAnchor = lastWinBy('Ohio State');
