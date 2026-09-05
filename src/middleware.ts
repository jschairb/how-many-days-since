/**
 * Host-aware routing.
 *
 * Every request passes through here before a page renders. The middleware
 * works out which host the request is for, records that on `locals.site` for
 * the pages, and then:
 *
 * - on the long domain, with the default settings, hands the request straight
 *   on, so nothing the long domain serves today changes;
 * - on the long domain with `REDIRECT_TO_NEW_HOST` set, answers with a
 *   permanent redirect to the same page on the new domain;
 * - on the new domain, serves the placeholder at `/`, rewrites `/thegame/...`
 *   to the page at `/...`, lets `/robots.txt` through, and answers 404 for
 *   any other path, so the new host never shows a second copy of a page.
 *
 * Static files (`/images/...`, `/favicon.svg`, the sitemap) are served by the
 * Node adapter before this runs, on both hosts, at the root. Page markup
 * refers to them by root-relative paths, so they need no prefix.
 *
 * Only on-demand routes can be rewritten into (Astro refuses to rewrite an
 * on-demand request into a prerendered page), which is why the archive pages
 * render on demand.
 */
import type { MiddlewareHandler } from 'astro';
import { LONG_HOST, NEW_HOST, readHostConfig, requestHost, siteContextFor, stripBase } from './lib/hosts';
import { platformIndexResponse } from './lib/platform-index';
import { redirectTarget } from './lib/redirect-map';

export const onRequest: MiddlewareHandler = (context, next) => {
  const config = readHostConfig();
  const site = siteContextFor(requestHost(context.request), config);
  context.locals.site = site;
  const { pathname, search } = context.url;

  if (config.redirectToNewHost && site.host === LONG_HOST) {
    const target = redirectTarget(pathname);
    if (target !== null) {
      const method = context.request.method.toUpperCase();
      const status = method === 'GET' || method === 'HEAD' ? 301 : 308;
      return context.redirect(`https://${NEW_HOST}${target}${search}`, status);
    }
  }

  if (!site.basePath) return next();

  // `context.rewrite()` renders the target with fresh `params` and `url` (a
  // rewrite through `next(path)` leaves endpoints holding the pre-rewrite
  // ones) and runs this middleware again for the inner path. The marker set
  // below is how that second pass knows to hand the request on.
  if (context.locals.hostRewrite) return next();

  if (pathname === '/') return platformIndexResponse();
  if (pathname === '/robots.txt') return next();

  const inner = stripBase(pathname, site.basePath);
  if (inner === null) return new Response('Not found', { status: 404 });
  context.locals.hostRewrite = { from: pathname, to: inner };
  return context.rewrite(`${inner}${search}`);
};
