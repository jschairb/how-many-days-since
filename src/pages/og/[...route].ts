import { OGImageRoute } from 'astro-og-canvas';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const referenceDate = new Date(import.meta.env.REFERENCE_DATE);
const now = new Date();
const daysSince = Math.max(
  Math.floor((now.getTime() - referenceDate.getTime()) / MS_PER_DAY),
  0
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages: {
    home: {
      title: 'Ohio State 27 - Michigan 9',
      description: 'November 29, 2025 • The Game',
    },
    'mo-carmen': {
      title: 'Mo Carmen',
      description: 'Born the moment Shawn Springs fell down in \'96',
    },
    'rivalry': {
      title: 'The Rivalry',
      description: 'A Buckeye Perspective',
    },
  },
  getImageOptions: (_path, page) => {
    return {
      title: page.title,
      description: page.description,
      bgGradient: [[190, 33, 55]],
      font: {
        title: {
          size: 120,
          weight: 'Bold',
        },
        description: {
          size: 48,
        },
      },
    };
  },
});
