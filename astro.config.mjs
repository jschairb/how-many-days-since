import { defineConfig } from 'astro/config';

import robotsTxt from 'astro-robots-txt';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://howmanydayssincemichiganhasbeatenohiostate.com',

  // Last date Michigan beat Ohio State
  vite: {
    define: {
      'import.meta.env.REFERENCE_DATE': JSON.stringify('2024-11-30T05:00:00.000Z'),
      'import.meta.env.GA_MEASUREMENT_ID': JSON.stringify('G-SLJZ2YGLV1'), // Replace with your GA4 Measurement ID
      'import.meta.env.IMAGE_ROTATION_INTERVAL': JSON.stringify(5000), // Image rotation interval in milliseconds
    },
  },

  integrations: [robotsTxt(), sitemap()],
});