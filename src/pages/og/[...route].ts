import type { APIRoute } from 'astro';
import { OG_IMAGE_TYPE, pagePathForOgRoute, resolveOgCard } from '../../lib/og-card';
import { renderOgCard } from '../../lib/og-render';

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

export const GET: APIRoute = async ({ params }) => {
  const path = pagePathForOgRoute(params.route);
  const card = path ? resolveOgCard(path) : null;
  if (!card) return new Response('Not found', { status: 404 });

  return new Response(await renderOgCard(card), {
    headers: {
      'Content-Type': OG_IMAGE_TYPE,
      'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
    },
  });
};
