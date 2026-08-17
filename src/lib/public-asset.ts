/**
 * Filesystem paths for files under `public/`.
 *
 * The OG endpoint renders at request time and hands CanvasKit real file paths
 * for its logo and fonts. Those files live in `public/` during `astro dev` and
 * in `dist/client/` once built, so the lookup probes both rather than assuming
 * one layout and breaking in the container.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Dev reads `public/` first so a stale `dist/` from an earlier build cannot
// shadow an edited asset; the built server has no `public/` and reads `dist/`.
const ROOTS = import.meta.env.DEV ? ['public', 'dist/client'] : ['dist/client', 'public'];

const resolved = new Map<string, string>();

/**
 * Resolves a public-relative path, e.g. `fonts/archivo-black.ttf`.
 * @throws if the file is missing from every known root, so a bad asset path
 * fails loudly at first use rather than silently dropping from the card.
 */
export function publicAssetPath(relativePath: string): string {
  const cached = resolved.get(relativePath);
  if (cached) return cached;

  for (const root of ROOTS) {
    const candidate = resolve(process.cwd(), root, relativePath);
    if (existsSync(candidate)) {
      resolved.set(relativePath, candidate);
      return candidate;
    }
  }

  throw new Error(`Public asset not found in ${ROOTS.join(' or ')}: ${relativePath}`);
}
