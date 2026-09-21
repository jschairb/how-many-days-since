import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import robotsTxt from 'astro-robots-txt';

import sitemap from '@astrojs/sitemap';

const BUILD_TIME = new Date().toISOString();

export default defineConfig({
  site: 'https://howmanydayssincemichiganhasbeatenohiostate.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  // The counters read their dates from src/data/rivalry-games.json through
  // src/lib/rivalry-anchors.ts. Nothing here carries a game date.
  vite: {
    define: {
      'import.meta.env.IMAGE_ROTATION_INTERVAL': JSON.stringify(5000), // Image rotation interval in milliseconds
    },
  },

  integrations: [
    robotsTxt(),
    // Every URL carries `lastmod`. The pages render from bundled data, so a
    // deploy is the only thing that changes any of them, and the build time is
    // the honest answer for all of them.
    sitemap({ serialize: (item) => ({ ...item, lastmod: BUILD_TIME }) }),
  ],
});
