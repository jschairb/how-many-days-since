/**
 * Where each long-domain path lands on the new domain.
 *
 * The middleware consults this table only while `REDIRECT_TO_NEW_HOST` is set,
 * so the table can be complete ahead of the flip without changing anything the
 * long domain serves today. `redirect-map.test.ts` checks that every route in
 * `src/pages` has a row here.
 */
import { THE_GAME_BASE } from './hosts';

const GAME = THE_GAME_BASE;

/**
 * Every route in `src/pages`, written the way Astro names it, paired with its
 * new-domain path. Dynamic segments keep Astro's bracket syntax and are
 * carried across as matched. `robots.txt` stays at the new host's root: it
 * describes the host, so it does not belong to The Game's folder.
 */
export const ROUTE_MOVES: ReadonlyArray<readonly [from: string, to: string]> = [
  ['/', `${GAME}/`],
  ['/countdown', `${GAME}/countdown`],
  ['/mo-carmen', `${GAME}/mo-carmen`],
  ['/record', `${GAME}/record`],
  ['/record/[year]', `${GAME}/record/[year]`],
  ['/rivalry-lab', `${GAME}/rivalry-lab`],
  ['/rivalry-lab/about', `${GAME}/rivalry-lab/about`],
  ['/teams/[team]/[season]', `${GAME}/teams/[team]/[season]`],
  ['/api/chalk-talk', `${GAME}/api/chalk-talk`],
  ['/api/health', `${GAME}/api/health`],
  ['/api/matchup', `${GAME}/api/matchup`],
  ['/api/simulate', `${GAME}/api/simulate`],
  ['/og/[...route]', `${GAME}/og/[...route]`],
  ['/robots.txt', '/robots.txt'],
];

const isFileLike = (path: string) => /\.[a-z0-9]+$/i.test(path);

/**
 * The full table: each move plus its trailing-slash twin, since the server
 * answers `/record` and `/record/` alike. Keys are exact paths or Astro-style
 * patterns; values keep the same shape.
 */
export const REDIRECT_MAP: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    ROUTE_MOVES.flatMap(([from, to]) =>
      from === '/' || isFileLike(from) ? [[from, to]] : [[from, to], [`${from}/`, `${to}/`]]
    )
  )
);

const SEGMENT = /\[\.\.\.[^\]]+\]|\[[^\]]+\]/g;

function patternToRegExp(pattern: string): RegExp {
  const source = pattern
    .split(/(\[\.\.\.[^\]]+\]|\[[^\]]+\])/)
    .map((part) => {
      if (part.startsWith('[...')) return '(.+)';
      if (part.startsWith('[')) return '([^/]+)';
      return part.replace(/[.*+?^${}()|\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${source}$`);
}

/** The new-domain path for a long-domain path, or `null` when the table has no row for it. */
export function redirectTarget(pathname: string): string | null {
  const exact = REDIRECT_MAP[pathname];
  if (exact !== undefined) return exact;

  for (const [from, to] of Object.entries(REDIRECT_MAP)) {
    if (!from.includes('[')) continue;
    const match = patternToRegExp(from).exec(pathname);
    if (!match) continue;
    let index = 1;
    return to.replace(SEGMENT, () => match[index++]);
  }

  return null;
}
