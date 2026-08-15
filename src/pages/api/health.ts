import type { APIRoute } from 'astro';
import { rivalrySnapshot } from '../../lib/rivalry-snapshot';
export const GET: APIRoute = () => Response.json({ status: 'ok', productVersion: rivalrySnapshot.productVersion });
