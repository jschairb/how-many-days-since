/**
 * Copy and routing for the generated Open Graph cards.
 *
 * Every page's card is rendered on demand by `/og/[...route].png`, so the copy
 * lives here rather than in a build-time table: the same resolver answers both
 * the page (which advertises the URL) and the endpoint (which draws it), and
 * the day counts stay current without a rebuild.
 *
 * Nothing here touches Astro or CanvasKit, so the whole map is unit testable.
 */
import games from '../data/rivalry-games.json';
import { LAST_MICHIGAN_WIN, calcDaysSince } from './days';
import { nextRivalryGame } from './next-rivalry-game';
import { teamNameFor, formatRecord } from './rivalry-archive';
import { rivalrySnapshot, type TeamId } from './rivalry-snapshot';
import { formatCount } from './share-graphic';

/** Facebook, X, LinkedIn, and Slack all render this ratio without cropping. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_TYPE = 'image/png';

export const OG_SITE_NAME = 'How Many Days Since Michigan Has Beaten Ohio State?';
export const OG_LOGO_PATH = '/og-logo.png';

/** Where a page with no card of its own points its `og:image`. */
export const DEFAULT_OG_IMAGE_PATH = '/og/home.png';

export interface OgCard {
  /** Headline drawn across the card, and the basis of the image's alt text. */
  title: string;
  /** Supporting line under the headline. */
  description: string;
}

const latestGame = games[0];
const earliestGame = games[games.length - 1];

/** Alt text for a card, describing the words a sighted user would read on it. */
export function ogCardAlt(card: OgCard): string {
  return `${card.title} — ${card.description}`;
}

function homeCard(now: Date): OgCard {
  const days = calcDaysSince(LAST_MICHIGAN_WIN, now);
  return {
    title: `${formatCount(days)} DAYS SINCE MICHIGAN BEAT OHIO STATE`,
    description: `Latest meeting: ${latestGame.winner} ${latestGame.wScore}, ${latestGame.loser} ${latestGame.lScore} · ${latestGame.date}, ${latestGame.year}`,
  };
}

function countdownCard(now: Date): OgCard {
  const kickoff = new Date(nextRivalryGame.start);
  const days = calcDaysSince(now, kickoff);
  const when = `${nextRivalryGame.date} · ${nextRivalryGame.time} · ${nextRivalryGame.location}`;
  return {
    title: days > 0 ? `${formatCount(days)} DAYS TO THE GAME` : 'THE GAME IS HERE',
    description: when,
  };
}

function recordCard(): OgCard {
  return {
    title: 'THE RECORD',
    description: `All ${games.length} Ohio State-Michigan meetings, ${earliestGame.year}-${latestGame.year}`,
  };
}

function gameCard(year: number): OgCard | null {
  const game = games.find((entry) => entry.year === year);
  if (!game) return null;
  return {
    title: `${game.winner} ${game.wScore}, ${game.loser} ${game.lScore}`.toUpperCase(),
    description: `${game.year} · ${game.date ?? 'Date not reported'} · ${game.location ?? 'Location not reported'}`,
  };
}

function teamSeasonCard(teamId: string, season: number): OgCard | null {
  const entry = rivalrySnapshot.ratings.teamSeasons.find(
    (candidate) => candidate.teamId === teamId && candidate.season === season
  );
  if (!entry) return null;
  return {
    title: `${entry.season} ${teamNameFor(entry.teamId as TeamId)}`.toUpperCase(),
    description: `${formatRecord(entry)} · ${entry.pointsFor} for, ${entry.pointsAgainst} against · Rivalry season archive`,
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
      title: 'RIVALRY LAB',
      description: 'Historical Ohio State vs Michigan matchup simulator',
    };
  }
  if (path === '/rivalry-lab/about') {
    return {
      title: 'HOW RIVALRY LAB WORKS',
      description: 'Methods, source labels, and limitations for the historical matchup simulator',
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
