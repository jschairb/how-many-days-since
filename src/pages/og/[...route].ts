import type { APIRoute } from 'astro';
import { generateOpenGraphImage } from 'astro-og-canvas';
import { OG_IMAGE_TYPE, OG_LOGO_PATH, pagePathForOgRoute, resolveOgCard } from '../../lib/og-card';
import { publicAssetPath } from '../../lib/public-asset';

/**
 * Draws each page's Open Graph card on request instead of at build time.
 *
 * The site already runs a server, and the card copy is data — the live day
 * count, the 121 rivalry meetings, every team season in the snapshot. Rendering
 * on demand keeps all of it current and keeps the build from drawing hundreds
 * of images that nothing may ever request.
 */
export const prerender = false;

/** A day: long enough that scrapers reuse a card, short enough to stay current. */
const CACHE_SECONDS = 86_400;

/**
 * The page headings are Archivo Black over IBM Plex Sans, so the cards use the
 * same pair. Both are bundled rather than fetched from a CDN at request time.
 */
const FONT_FAMILIES = { title: ['Archivo Black'], description: ['IBM Plex Sans'] };

export const GET: APIRoute = async ({ params }) => {
  const path = pagePathForOgRoute(params.route);
  const card = path ? resolveOgCard(path) : null;
  if (!card) return new Response('Not found', { status: 404 });

  const png = await generateOpenGraphImage({
    title: card.title,
    description: card.description,
    logo: { path: publicAssetPath(OG_LOGO_PATH.replace(/^\//, '')), size: [104] },
    fonts: [
      publicAssetPath('fonts/archivo-black.ttf'),
      publicAssetPath('fonts/ibm-plex-sans-600.ttf'),
    ],
    bgGradient: [
      [190, 33, 55],
      [116, 15, 30],
    ],
    padding: 70,
    font: {
      title: { size: 72, lineHeight: 1.1, families: FONT_FAMILIES.title },
      description: { size: 34, color: [247, 221, 226], families: FONT_FAMILIES.description },
    },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': OG_IMAGE_TYPE,
      'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
    },
  });
};
