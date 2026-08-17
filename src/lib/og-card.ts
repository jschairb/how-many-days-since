/**
 * Copy and routing for the generated Open Graph cards.
 *
 * Every page's card is rendered on demand by `/og/[...route].png`, so the copy
 * lives here rather than in a build-time table: the same resolver answers both
 * the page (which advertises the URL) and the endpoint (which draws it), and
 * the day counts stay current without a rebuild.
 *
 * Nothing here touches Astro or the renderer, so the whole map is unit testable.
 */
import games from '../data/rivalry-games.json';
import { LAST_MICHIGAN_WIN, calcDaysSince } from './days';
import { nextRivalryGame } from './next-rivalry-game';
import { teamIdFor, teamNameFor, formatRecord, type RivalryTeam } from './rivalry-archive';
import { rivalrySnapshot, type TeamId } from './rivalry-snapshot';
import { formatCount } from './share-graphic';

/** Facebook, X, LinkedIn, and Slack all render this ratio without cropping. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_TYPE = 'image/png';

export const OG_SITE_NAME = 'How Many Days Since Michigan Has Beaten Ohio State?';
export const OG_SITE_DOMAIN = 'howmanydayssincemichiganhasbeatenohiostate.com';
export const OG_LOGO_PATH = '/og-logo.png';

/** Where a page with no card of its own points its `og:image`. */
export const DEFAULT_OG_IMAGE_PATH = '/og/home.png';

/**
 * Whose colors the card wears. `rivalry` is the both-sides treatment for pages
 * that belong to neither team — the home count, the record, the Lab.
 */
export type CardTeam = TeamId | 'rivalry';

/**
 * A run of headline text and the color it takes. The page heroes color each
 * team's name and leave the scores in ink; the cards do the same.
 */
export interface HeadlineSpan {
  text: string;
  tone?: 'ink' | 'ohio-state' | 'michigan' | 'muted';
}

export interface OgCard {
  /** Small caps label above the headline, matching the pages' eyebrows. */
  eyebrow: string;
  /**
   * The headline, set in Archivo Black like the page it stands for. Omitted on
   * cards where the `metric` is the headline.
   */
  headline?: string | HeadlineSpan[];
  /** Supporting line under the headline. */
  detail: string;
  /**
   * An optional oversized figure — the day counts, drawn the way the home
   * page draws its counter. When set, `headline` becomes the line above it.
   */
  metric?: { value: string; unit: string };
  team: CardTeam;
}

const latestGame = games[0];
const earliestGame = games[games.length - 1];

/** The headline as one string, for alt text and for measuring its length. */
export function headlineText(headline: string | HeadlineSpan[]): string {
  return typeof headline === 'string' ? headline : headline.map((span) => span.text).join(' ');
}

/** Alt text for a card, describing the words a sighted user would read on it. */
export function ogCardAlt(card: OgCard): string {
  const figure = card.metric ? `${card.metric.value} ${card.metric.unit}. ` : '';
  const headline = card.headline ? `${headlineText(card.headline)}. ` : '';
  return `${card.eyebrow}. ${figure}${headline}${card.detail}`;
}

function homeCard(now: Date): OgCard {
  const days = calcDaysSince(LAST_MICHIGAN_WIN, now);
  return {
    eyebrow: 'HOW MANY DAYS SINCE MICHIGAN HAS BEATEN OHIO STATE?',
    metric: { value: formatCount(days), unit: 'DAYS' },
    detail: `Latest meeting: ${latestGame.winner} ${latestGame.wScore}, ${latestGame.loser} ${latestGame.lScore} · ${latestGame.date}, ${latestGame.year}`,
    // The streak belongs to Ohio State, so the card wears scarlet.
    team: 'ohio-state',
  };
}

function countdownCard(now: Date): OgCard {
  const days = calcDaysSince(now, new Date(nextRivalryGame.start));
  const when = `${nextRivalryGame.date} · ${nextRivalryGame.time} · ${nextRivalryGame.location}`;
  if (days <= 0) {
    return { eyebrow: 'THE GAME', headline: 'IT IS HERE', detail: when, team: 'rivalry' };
  }
  return {
    eyebrow: 'COUNTDOWN TO THE GAME',
    metric: { value: formatCount(days), unit: 'DAYS' },
    detail: when,
    team: 'rivalry',
  };
}

function recordCard(): OgCard {
  return {
    eyebrow: `EVERY MEETING · ${earliestGame.year}-${latestGame.year}`,
    headline: 'THE RECORD',
    detail: `All ${games.length} Ohio State-Michigan meetings, decade by decade`,
    team: 'rivalry',
  };
}

function gameCard(year: number): OgCard | null {
  const game = games.find((entry) => entry.year === year);
  if (!game) return null;
  const winner = game.winner as RivalryTeam | 'Tie';
  const loser = game.loser as RivalryTeam;
  return {
    eyebrow: `RIVALRY MEETING · ${game.year}`,
    // Laid out like the game page's hero: team names in their colors, the
    // score in ink between them.
    headline: [
      { text: game.winner.toUpperCase(), tone: winner === 'Tie' ? 'ink' : teamIdFor(winner) },
      { text: `${game.wScore}–${game.lScore}` },
      { text: loser.toUpperCase(), tone: teamIdFor(loser) },
    ],
    detail: `${game.date ?? 'Date not reported'} · ${game.location ?? 'Location not reported'}`,
    team: winner === 'Tie' ? 'rivalry' : teamIdFor(winner),
  };
}

function teamSeasonCard(teamId: string, season: number): OgCard | null {
  const entry = rivalrySnapshot.ratings.teamSeasons.find(
    (candidate) => candidate.teamId === teamId && candidate.season === season
  );
  if (!entry) return null;
  // scoringMargin is points per game, and carries full float precision.
  const margin = `${entry.scoringMargin >= 0 ? '+' : ''}${entry.scoringMargin.toFixed(1)}`;
  const teamName = teamNameFor(entry.teamId as TeamId);
  return {
    eyebrow: `RIVALRY SEASON ARCHIVE · ${entry.season}`,
    headline: [
      { text: teamName.toUpperCase(), tone: entry.teamId as TeamId },
      { text: formatRecord(entry) },
    ],
    detail: `${entry.games} games · ${entry.pointsFor} for · ${entry.pointsAgainst} against · ${margin} per game`,
    team: entry.teamId as TeamId,
  };
}

/** Drops the trailing slash Astro leaves on some URLs, so `/record/` maps too. */
function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * The card for a page, or `null` when the page has no generated card — an
 * unknown route, or one like `/mo-carmen` that ships its own artwork.
 */
export function resolveOgCard(pathname: string, now: Date = new Date()): OgCard | null {
  const path = normalizePath(pathname);

  if (path === '/') return homeCard(now);
  if (path === '/countdown') return countdownCard(now);
  if (path === '/record') return recordCard();
  if (path === '/rivalry-lab') {
    return {
      eyebrow: 'OHIO STATE VS MICHIGAN',
      headline: 'RIVALRY LAB',
      detail: 'Historical matchup simulator with evidence-labeled ratings',
      team: 'rivalry',
    };
  }
  if (path === '/rivalry-lab/about') {
    return {
      eyebrow: 'METHOD & SOURCES',
      headline: 'HOW RIVALRY LAB WORKS',
      detail: 'What the Lab shows, what it derives, and what it does not claim',
      team: 'rivalry',
    };
  }

  const game = /^\/record\/(\d{4})$/.exec(path);
  if (game) return gameCard(Number(game[1]));

  const season = /^\/teams\/([a-z-]+)\/(\d{4})$/.exec(path);
  if (season) return teamSeasonCard(season[1], Number(season[2]));

  return null;
}

/**
 * The `og:image` path for a page. Pages without a card of their own fall back
 * to the site card, so no page ever advertises an image the endpoint 404s on.
 */
export function ogImagePathFor(pathname: string): string {
  const path = normalizePath(pathname);
  if (!resolveOgCard(path)) return DEFAULT_OG_IMAGE_PATH;
  return `/og${path === '/' ? '/home' : path}.png`;
}

/**
 * The inverse, for the endpoint: turns its rest-route parameter back into the
 * page path whose card it should draw. `null` for anything that is not a card
 * request, so the endpoint can 404 instead of rendering arbitrary input.
 */
export function pagePathForOgRoute(route: string | undefined): string | null {
  if (!route) return null;
  const slug = route.replace(/^\/+/, '');
  if (!/^[a-z0-9/-]+\.png$/.test(slug) || slug.includes('//')) return null;
  const path = slug.slice(0, -'.png'.length);
  return path === 'home' ? '/' : `/${path}`;
}
