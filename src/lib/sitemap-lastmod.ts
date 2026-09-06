/**
 * The `lastmod` each sitemap entry carries.
 *
 * The archive pages (`/record/<year>/` and `/teams/<team>/<year>/`) change only
 * when their meeting's row in the record does, so they date from the game.
 * Everything else renders live numbers and dates from the build.
 */
import games from '../data/rivalry-games.json';

type Game = { year: number; date: string | null };

const MONTHS: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

/** `Nov 29` plus its year as `YYYY-MM-DD`; `null` when the record has no date. */
export function gameDateIso(game: Game): string | null {
  const match = game.date?.match(/^([A-Z][a-z]{2}) (\d{1,2})$/);
  const month = match ? MONTHS[match[1]] : undefined;
  if (!match || !month) return null;
  return `${game.year}-${month}-${match[2].padStart(2, '0')}`;
}

/** The season a sitemap URL belongs to, or `null` for the live pages. */
export function seasonForPath(pathname: string): number | null {
  const match = pathname.match(/^\/(?:record|teams\/[a-z-]+)\/(\d{4})\/?$/);
  return match ? Number(match[1]) : null;
}

/** ISO `lastmod` for a sitemap URL. */
export function sitemapLastmod(url: string, buildDate: Date, record: Game[] = games): string {
  const season = seasonForPath(new URL(url).pathname);
  const game = season === null ? undefined : record.find((entry) => entry.year === season);
  return (game && gameDateIso(game)) ?? buildDate.toISOString();
}
