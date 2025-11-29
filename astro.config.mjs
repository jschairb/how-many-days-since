import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https:/howmanydayssincemichiganbeatohiostate.com',
  // Last date Michigan beat Ohio State
  vite: {
    define: {
      'import.meta.env.REFERENCE_DATE': JSON.stringify('2024-11-30T05:00:00.000Z'),
      'import.meta.env.GA_MEASUREMENT_ID': JSON.stringify('G-SLJZ2YGLV1'), // Replace with your GA4 Measurement ID
    },
  },
});
