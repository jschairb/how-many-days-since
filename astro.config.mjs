import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import robotsTxt from 'astro-robots-txt';

import sitemap from '@astrojs/sitemap';

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

  integrations: [robotsTxt(), sitemap()],
});
