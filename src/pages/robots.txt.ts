import type { APIRoute } from 'astro';
import { siteFrom } from '../lib/hosts';
import { robotsTxt } from '../lib/robots';

export const GET: APIRoute = (context) =>
  new Response(robotsTxt(siteFrom(context)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
