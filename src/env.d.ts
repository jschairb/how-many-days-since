/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Set by `src/middleware.ts` on every request. */
    site: import('./lib/hosts').SiteContext;
    /** Present once the middleware has rewritten a new-host path to its page. */
    hostRewrite?: { from: string; to: string };
  }
}
