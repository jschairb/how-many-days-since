import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import robotsTxt from 'astro-robots-txt';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://howmanydayssincemichiganhasbeatenohiostate.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  // Last date Michigan beat Ohio State
  vite: {
    define: {
      'import.meta.env.REFERENCE_DATE': JSON.stringify('2024-11-30T05:00:00.000Z'),
      'import.meta.env.IMAGE_ROTATION_INTERVAL': JSON.stringify(5000), // Image rotation interval in milliseconds
    },
  },

  integrations: [robotsTxt(), sitemap()],
});
