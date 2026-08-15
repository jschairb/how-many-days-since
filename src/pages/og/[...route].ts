import { OGImageRoute } from 'astro-og-canvas';

export const prerender = true;

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages: {
    home: { title: 'Ohio State 27 - Michigan 9', description: 'November 29, 2025 · The Game' },
    'mo-carmen': { title: 'Mo Carmen', description: "Born the moment Shawn Springs fell down in '96" },
    record: { title: 'The Record', description: '121 Ohio State-Michigan meetings, 1897-2025' },
    'rivalry-lab': { title: 'Rivalry Lab', description: 'Historical Ohio State vs Michigan matchup simulator' },
    'rivalry-lab/about': { title: 'How Rivalry Lab Works', description: 'Methods, source labels, and limitations for the historical matchup simulator' },
  },
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[190, 33, 55]],
    font: { title: { size: 120, weight: 'Bold' }, description: { size: 48 } },
  }),
});
