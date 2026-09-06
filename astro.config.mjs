import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import robotsTxt from 'astro-robots-txt';

import sitemap from '@astrojs/sitemap';
import { sitemapLastmod } from './src/lib/sitemap-lastmod';
import { archivePageUrls } from './src/lib/sitemap-pages';

const site = 'https://howmanydayssincemichiganhasbeatenohiostate.com';
// One stamp per build, so every live page in the sitemap carries the same one.
const buildDate = new Date();

export default defineConfig({
  site,
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
    // Every page renders on demand, so the archive is listed by hand; the
    // slashless form of each URL redirects in src/middleware.ts.
    sitemap({
      customPages: archivePageUrls(site),
      serialize: (item) => ({ ...item, lastmod: sitemapLastmod(item.url, buildDate) }),
    }),
  ],
});
