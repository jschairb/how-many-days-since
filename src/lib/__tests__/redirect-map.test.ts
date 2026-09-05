import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REDIRECT_MAP, ROUTE_MOVES, redirectTarget } from '../redirect-map';

const PAGES_DIR = join(process.cwd(), 'src', 'pages');

/** Every route Astro builds from `src/pages`, named the way Astro names it. */
function routesInPages(dir = PAGES_DIR): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (entry.startsWith('_') || entry === '__tests__') return [];
    if (statSync(path).isDirectory()) return routesInPages(path);
    if (!/\.(astro|ts)$/.test(entry)) return [];
    const route = relative(PAGES_DIR, path)
      .replace(/\.(astro|ts)$/, '')
      .replace(/(^|\/)index$/, '');
    return [`/${route}`];
  });
}

describe('REDIRECT_MAP', () => {
  it('covers every route in src/pages', () => {
    const routes = routesInPages();
    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      expect(Object.keys(REDIRECT_MAP), route).toContain(route);
    }
  });

  it('lists no route that src/pages does not have', () => {
    const routes = new Set(routesInPages());
    for (const [from] of ROUTE_MOVES) {
      expect(routes.has(from), from).toBe(true);
    }
  });

  it('carries a trailing-slash twin for each page path', () => {
    expect(REDIRECT_MAP['/record']).toBe('/thegame/record');
    expect(REDIRECT_MAP['/record/']).toBe('/thegame/record/');
    expect(REDIRECT_MAP['/countdown/']).toBe('/thegame/countdown/');
    expect(REDIRECT_MAP['/']).toBe('/thegame/');
    expect(REDIRECT_MAP['//']).toBeUndefined();
    expect(REDIRECT_MAP['/robots.txt/']).toBeUndefined();
  });
});

describe('redirectTarget', () => {
  it('maps the fixed pages', () => {
    expect(redirectTarget('/')).toBe('/thegame/');
    expect(redirectTarget('/record')).toBe('/thegame/record');
    expect(redirectTarget('/record/')).toBe('/thegame/record/');
    expect(redirectTarget('/countdown')).toBe('/thegame/countdown');
    expect(redirectTarget('/rivalry-lab/about')).toBe('/thegame/rivalry-lab/about');
    expect(redirectTarget('/mo-carmen/')).toBe('/thegame/mo-carmen/');
  });

  it('maps the archive pages by their parameters', () => {
    expect(redirectTarget('/record/2024')).toBe('/thegame/record/2024');
    expect(redirectTarget('/record/2024/')).toBe('/thegame/record/2024/');
    expect(redirectTarget('/teams/ohio-state/2024')).toBe('/thegame/teams/ohio-state/2024');
  });

  it('maps the server routes and the card endpoint', () => {
    expect(redirectTarget('/api/matchup')).toBe('/thegame/api/matchup');
    expect(redirectTarget('/og/home.png')).toBe('/thegame/og/home.png');
    expect(redirectTarget('/og/teams/michigan/2023.png')).toBe('/thegame/og/teams/michigan/2023.png');
  });

  it('keeps robots.txt at the new root', () => {
    expect(redirectTarget('/robots.txt')).toBe('/robots.txt');
  });

  it('has no answer for paths that are not routes', () => {
    expect(redirectTarget('/nope')).toBeNull();
    expect(redirectTarget('/record/2024/extra')).toBeNull();
    expect(redirectTarget('/thegame/record')).toBeNull();
    expect(redirectTarget('/images/osu-banner.gif')).toBeNull();
  });
});
