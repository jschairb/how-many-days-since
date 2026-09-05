/**
 * The new host's root: a placeholder for the Rivalry Lab platform until it has
 * a real front page. It exists on the new host only, so it is its own canonical
 * whichever way `CANONICAL_HOST` points.
 */
import { NEW_HOST, THE_GAME_BASE } from './hosts';

export const PLATFORM_NAME = 'Rivalry Lab';
export const PLATFORM_INDEX_CANONICAL = `https://${NEW_HOST}/`;
export const PLATFORM_INDEX_DESCRIPTION =
  'Rivalry Lab tracks college football rivalries, starting with The Game.';

export function platformIndexHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${PLATFORM_NAME}</title>
    <meta name="description" content="${PLATFORM_INDEX_DESCRIPTION}" />
    <link rel="canonical" href="${PLATFORM_INDEX_CANONICAL}" />
  </head>
  <body>
    <h1>${PLATFORM_NAME}</h1>
    <p>${PLATFORM_INDEX_DESCRIPTION}</p>
    <p><a href="${THE_GAME_BASE}/">The Game: Ohio State vs Michigan</a></p>
  </body>
</html>
`;
}

export function platformIndexResponse(): Response {
  return new Response(platformIndexHtml(), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
