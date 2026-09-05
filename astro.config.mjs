import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

import games from './src/data/rivalry-games.json';
import snapshot from './src/data/rivalry-lab-snapshot.json';
import { basePathFor, readHostConfig } from './src/lib/hosts';

// The sitemap is written at build time, so the canonical host is read here as
// well as per request in the middleware. Set CANONICAL_HOST for the build and
// for the running server; it defaults to the long domain.
const { canonicalHost } = readHostConfig();
const site = `https://${canonicalHost}`;
const base = basePathFor(canonicalHost);

// The archive pages render on demand (the middleware can only rewrite into
// on-demand routes), so the sitemap lists them from the data they render from,
// in the trailing-slash form the integration uses for every other page.
const archivePages = [
  ...games.map((game) => `/record/${game.year}/`),
  ...snapshot.ratings.teamSeasons.map((entry) => `/teams/${entry.teamId}/${entry.season}/`),
];

export default defineConfig({
  site,
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  // Last date Michigan beat Ohio State
  vite: {
    define: {
      'import.meta.env.REFERENCE_DATE': JSON.stringify('2024-11-30T05:00:00.000Z'),
      'import.meta.env.IMAGE_ROTATION_INTERVAL': JSON.stringify(5000), // Image rotation interval in milliseconds
    },
  },

  // robots.txt is served by `src/pages/robots.txt.ts`, so it can vary by host.
  integrations: [
    sitemap({
      customPages: archivePages.map((path) => `${site}${path}`),
      // Once the canonical host is the new domain, every page sits under /thegame/.
      serialize: base ? (item) => ({ ...item, url: item.url.replace(`${site}/`, `${site}${base}/`) }) : undefined,
    }),
  ],
});
