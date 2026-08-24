# CLAUDE.md

Guidance for Claude Code when working in this repository.

A Buckeye-forward site counting the days since Michigan last beat Ohio State. Astro 5, and the
one site in `astro_portfolio/` that runs **server-side**: `output: 'server'` with the Node
adapter in standalone mode.

## Commands

```bash
npm run dev              # Astro dev server
npm run build            # Build to dist/ (server entry at dist/server/entry.mjs)
npm run preview          # Serve the build
npm run check            # astro check
npm test                 # Vitest, single run
npm run test:watch
npm run test:e2e         # Playwright (tests/)
npm run sync:lab-snapshot  # Refresh src/data/rivalry-lab-snapshot.json
```

Package manager: **npm**.

## Deployment shape

The build produces a Node server, so this cannot deploy as static files. `Dockerfile` builds
on `node:24-alpine` and runs `node ./dist/server/entry.mjs` with `HOST=0.0.0.0` and
`PORT=4310`. Anything added under `src/pages/api/` is a live endpoint served by that process.

## Data and logic

- `src/data/rivalry-games.json` is the game history. `src/data/rivalry-lab-snapshot.json` is
  generated: refresh it with `npm run sync:lab-snapshot`
  (`scripts/sync-rivalry-lab-snapshot.mjs`) rather than editing it by hand.
- `src/lib/` holds the logic, each module with unit coverage in `src/lib/__tests__/`:
  `days.ts` (the count), `rivalry-record.ts`, `rivalry-lab.ts`, `rivalry-snapshot.ts`,
  `share-graphic.ts`.
- Date math is the core of the site and it is timezone-sensitive: the count is anchored to
  Columbus time. Any change to `days.ts` needs a test covering the day boundary.
- `src/pages/og/` generates Open Graph images through `astro-og-canvas`.

## Testing

Vitest covers `src/lib/`. Playwright specs in `tests/` cover the pages end to end, including
`seo.spec.ts` and `share.spec.ts`. Run both after touching page markup, since the SEO spec
asserts on meta tags.
