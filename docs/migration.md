# Moving The Game to therivalrylab.com

The site at howmanydayssincemichiganhasbeatenohiostate.com (the long domain) is moving to
therivalrylab.com (the new domain). On the new domain The Game is the folder `/thegame/`, and
later rivalries become sibling folders (`/iron-bowl/`, `/army-navy/`). One container serves both
hostnames the whole way through; nothing runs twice.

The move has three phases. Phase one ships the code and changes nothing the long domain serves.
Phase two points DNS. Phase three flips two settings and files the change of address.

## How the server tells the hosts apart

`src/middleware.ts` runs before every page. It reads the host the request was addressed to
(`X-Forwarded-Host` from the proxy in front of the container, else `Host`) and records the
result on `Astro.locals.site` for the pages.

On the long domain, or on any host it does not recognise (localhost, the container's own
address, a health checker), the request goes straight on. This is the layout the site has always
served.

On the new domain:

- `/` is a placeholder page for the platform, canonical to itself.
- `/thegame/...` is rewritten to the page at `/...`. The page renders with its links prefixed,
  its Rivalry Lab calls going to `/thegame/api/...`, and its canonical pointing wherever
  `CANONICAL_HOST` says.
- `/robots.txt` is served at the root.
- Any other path answers 404, so the new host never shows a second copy of a page.

Static files (`/images/...`, `/favicon.svg`, the sitemap) are served by the Node adapter before
the middleware runs, at the root of both hosts. Page markup refers to them by root-relative path,
so they need no prefix.

Two settings steer the move. Both are read from the environment, with these defaults:

| Setting | Default | Effect |
| --- | --- | --- |
| `CANONICAL_HOST` | the long domain | The host every page names in `<link rel="canonical">`, `og:url`, `og:image`, the share link, the sitemap, and the `Sitemap:` line of robots.txt. When it is the new domain, the paths sit under `/thegame/`. |
| `REDIRECT_TO_NEW_HOST` | off | When `true`, the long domain answers each of its paths with a permanent redirect to the same page on the new domain, from the table in `src/lib/redirect-map.ts`. GET and HEAD get 301; other methods get 308 so a POST keeps its body. |

The sitemap is written at build time, so `CANONICAL_HOST` has to reach the build as well as the
running server. The Dockerfile takes it as a build argument and carries it into the runtime image;
a runtime variable of the same name overrides it.

robots.txt is served by `src/pages/robots.txt.ts`. On the long domain with the defaults it is
byte-for-byte the file the old build integration wrote. On the new domain, while
`CANONICAL_HOST` is still the long domain, it is `Disallow: /`, so crawlers stay out of the
staging copy. The long domain is never disallowed, before or after the flip: a crawler has to
fetch the old URLs to see their redirects.

## Phase one: serve both hosts

This is the pull request for GWP-853. With the default settings the long domain serves what it
served before, with one change in mechanism: `/record/<year>` and `/teams/<team>/<season>` render
on demand instead of being prerendered, because Astro refuses to rewrite an on-demand request
into a prerendered page and a prerendered page cannot vary by host. The HTML is the same, and the
sitemap lists the same 239 URLs as before.

Verify a deployment of phase one with the container running on port 4310:

```sh
# Long domain: root is The Game, canonical to itself, no redirect.
curl -sI -H 'Host: howmanydayssincemichiganhasbeatenohiostate.com' http://127.0.0.1:4310/ | head -1
curl -s  -H 'Host: howmanydayssincemichiganhasbeatenohiostate.com' http://127.0.0.1:4310/record | grep -o 'rel="canonical" href="[^"]*"'

# New domain: placeholder at the root, The Game under /thegame/, nothing at /record.
curl -s  -H 'Host: therivalrylab.com' http://127.0.0.1:4310/ | grep '<h1>'
curl -s  -H 'Host: therivalrylab.com' http://127.0.0.1:4310/thegame/record | grep -o 'rel="canonical" href="[^"]*"'
curl -sI -H 'Host: therivalrylab.com' http://127.0.0.1:4310/record | head -1
curl -s  -H 'Host: therivalrylab.com' http://127.0.0.1:4310/robots.txt
```

## Phase two: DNS

Point the new domain at the host that runs the container.

1. Add `therivalrylab.com` (and `www.therivalrylab.com`) as domains on the hosting platform so
   its proxy routes the hostname to this container and issues a certificate.
2. At the DNS provider, point the apex `therivalrylab.com` at the platform. An apex cannot carry a
   CNAME, so use the A record the platform gives, or a flattened alias (ALIAS or ANAME) where the
   provider offers one. `www` can be a plain CNAME to the platform hostname.
3. Leave the long domain as it is. It can stay a CNAME; it keeps serving the site until phase
   three, and after that it serves the redirects.
4. In Google Search Console, add `therivalrylab.com` as a domain property now (a DNS TXT record),
   so the property exists and has history before the change of address in phase three.

Check it from outside once DNS has propagated:

```sh
curl -sI https://therivalrylab.com/thegame/ | head -1          # 200
curl -s  https://therivalrylab.com/robots.txt                   # Disallow: /
curl -s  https://howmanydayssincemichiganhasbeatenohiostate.com/robots.txt   # unchanged
```

During phase two the new domain is live but canonical to the long domain and closed to crawlers.
It can stay in that state for as long as needed.

## Phase three: flip

1. Set `CANONICAL_HOST=therivalrylab.com` as a build argument and as a runtime variable, and
   rebuild the image. The rebuild writes the sitemap with new-domain URLs under `/thegame/`.
2. Set `REDIRECT_TO_NEW_HOST=true` on the running service. From this point the long domain
   answers every known path with a permanent redirect.
3. Verify:

   ```sh
   curl -sI https://howmanydayssincemichiganhasbeatenohiostate.com/record | grep -i '^location'
   # location: https://therivalrylab.com/thegame/record
   curl -s https://therivalrylab.com/thegame/record | grep -o 'rel="canonical" href="[^"]*"'
   # https://therivalrylab.com/thegame/record/
   curl -s https://therivalrylab.com/robots.txt        # Allow: /, Sitemap: https://therivalrylab.com/sitemap-index.xml
   curl -s https://therivalrylab.com/sitemap-0.xml | grep -c '<loc>https://therivalrylab.com/thegame/'   # 239
   ```

4. In Search Console, open the long domain's property and file a change of address to the
   `therivalrylab.com` property. Search Console checks that the old home page redirects to the
   new one before it accepts.
5. Update the site URL on the GA4 web data stream and on any external links under GWP's control
   (the merch pages, the portfolio).

The long domain's Search Console property shows six clicks in three weeks, so the flip does not
need to wait for the off-season. Search Console's guidance is to keep the redirects in place for
at least 180 days; keep the long domain registered and pointed at the container for at least a
year.

## Rolling back

Phase three is two settings. Unset `REDIRECT_TO_NEW_HOST` and the long domain serves pages
again; set `CANONICAL_HOST` back to the long domain (or unset it) and rebuild, and canonicals,
sitemap, and robots return to the phase-one state. DNS does not change in either direction.
