/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Set by `src/middleware.ts` on every request. */
    site: import('./lib/hosts').SiteContext;
  }
}
