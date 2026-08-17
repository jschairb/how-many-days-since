/**
 * Renders a card to PNG: satori lays the template out and emits SVG, resvg
 * rasterizes it. Neither needs a browser, so this runs inside the same
 * alpine container the site already ships in.
 *
 * Fonts and the logo are read once per process and held in memory — the first
 * card after a boot pays for the disk reads, the rest do not.
 */
import { readFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, OG_LOGO_PATH, type OgCard } from './og-card';
import { buildCardTemplate } from './og-template';
import { publicAssetPath } from './public-asset';

/** The page fonts, bundled so a card never waits on a font CDN. */
const FONT_FILES = [
  { name: 'Archivo Black', file: 'fonts/archivo-black.ttf', weight: 400 },
  { name: 'IBM Plex Sans', file: 'fonts/ibm-plex-sans-600.ttf', weight: 700 },
] as const;

let assets: Promise<{ fonts: Awaited<ReturnType<typeof loadFonts>>; logo: string }> | undefined;

async function loadFonts() {
  return Promise.all(
    FONT_FILES.map(async ({ name, file, weight }) => ({
      name,
      weight: weight as 400 | 700,
      style: 'normal' as const,
      data: await readFile(publicAssetPath(file)),
    }))
  );
}

function loadAssets() {
  assets ??= (async () => {
    const [fonts, logo] = await Promise.all([
      loadFonts(),
      readFile(publicAssetPath(OG_LOGO_PATH.replace(/^\//, ''))),
    ]);
    return { fonts, logo: `data:image/png;base64,${logo.toString('base64')}` };
  })();
  return assets;
}

export async function renderOgCard(card: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  const { fonts, logo } = await loadAssets();

  const svg = await satori(buildCardTemplate(card, logo) as Parameters<typeof satori>[0], {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts,
  });

  // Satori embeds the glyphs as paths, so resvg needs no font config of its own.
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_IMAGE_WIDTH } }).render().asPng();
  // Copied out of the Buffer's pooled backing store, which `Response` rejects.
  return new Uint8Array(png);
}
