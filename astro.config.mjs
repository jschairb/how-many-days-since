import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https:/howmanydayssincemichiganbeatohiostate.com',
  // Last date Michigan beat Ohio State
  vite: {
    define: {
      'import.meta.env.REFERENCE_DATE': JSON.stringify('2024-11-30T05:00:00.000Z'),
    },
  },
});
