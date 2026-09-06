/**
 * Where a request for the slashless form of a page should go.
 *
 * Both `/record/1897` and `/record/1897/` used to answer 200, so Google
 * indexed whichever it met first and reported the other as a duplicate. The
 * sitemap and every canonical use the trailing-slash form, so the slashless
 * form redirects there. Files and the API keep whatever form was asked for.
 */
const PASS_THROUGH = /^\/(api\/|_)/;

/** The trailing-slash path to redirect to, or `null` when the path stays. */
export function trailingSlashRedirect(pathname: string): string | null {
  if (pathname === '/' || pathname.endsWith('/')) return null;
  if (PASS_THROUGH.test(pathname)) return null;
  if (/\.[a-z0-9]+$/i.test(pathname)) return null;
  return `${pathname}/`;
}
