import { defineMiddleware } from 'astro:middleware';
import { trailingSlashRedirect } from './lib/trailing-slash';

/** One URL per page: the slashless form answers with a 301 to the slash form. */
export const onRequest = defineMiddleware((context, next) => {
  const { method } = context.request;
  if (method !== 'GET' && method !== 'HEAD') return next();
  const target = trailingSlashRedirect(context.url.pathname);
  if (target === null) return next();
  return context.redirect(`${target}${context.url.search}`, 301);
});
