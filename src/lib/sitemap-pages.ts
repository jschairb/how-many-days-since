/**
 * The archive URLs the sitemap lists.
 *
 * The record and team-season pages render on demand, and the sitemap
 * integration lists only routes with a fixed path, so the archive is
 * enumerated here from the same data the pages read.
 */
import games from '../data/rivalry-games.json';
import { rivalrySnapshot } from './rivalry-snapshot';

export function archivePageUrls(site: string): string[] {
  const base = site.replace(/\/+$/, '');
  return [
    ...games.map((game) => `${base}/record/${game.year}/`),
    ...rivalrySnapshot.ratings.teamSeasons.map((entry) => `${base}/teams/${entry.teamId}/${entry.season}/`),
  ];
}
