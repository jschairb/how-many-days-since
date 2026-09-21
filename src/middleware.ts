import type { MiddlewareHandler } from 'astro';
import { redirectTargetFor } from './lib/trailing-slash';

/** Sends a page request to the one URL the canonical and the sitemap name. */
export const onRequest: MiddlewareHandler = (context, next) => {
  const target = redirectTargetFor(context.url.pathname);
  if (target === null) return next();
  return context.redirect(`${target}${context.url.search}`, 301);
};
