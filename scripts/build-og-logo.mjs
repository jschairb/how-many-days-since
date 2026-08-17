/**
 * Rasterizes the site mark from public/favicon.svg into public/og-logo.png.
 *
 * `og:logo` and the generated OG cards both need a bitmap, and the only mark
 * the site has is an SVG. CanvasKit already ships with astro-og-canvas, so it
 * draws the same shapes here rather than adding an SVG rasterizer dependency.
 *
 * Run with: node scripts/build-og-logo.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import CanvasKitInit from 'canvaskit-wasm/bin/full/canvaskit.js';

const root = new URL('../', import.meta.url);
const SIZE = 512;
/** The favicon draws on a 100x100 viewBox; every coordinate below scales by this. */
const UNIT = SIZE / 100;

const MICHIGAN_BLUE = [0, 0x27, 0x4c];
const OHIO_STATE_SCARLET = [0xbb, 0, 0];
const MICHIGAN_MAIZE = [0xff, 0xcb, 0x05];
const WHITE = [255, 255, 255];

const canvasKit = await CanvasKitInit({
  locateFile: (file) => fileURLToPath(new URL(`node_modules/canvaskit-wasm/bin/full/${file}`, root)),
});

const surface = canvasKit.MakeSurface(SIZE, SIZE);
if (!surface) throw new Error('CanvasKit could not allocate the logo surface');
const canvas = surface.getCanvas();

const fill = (rgb) => {
  const paint = new canvasKit.Paint();
  paint.setColor(canvasKit.Color(...rgb));
  paint.setStyle(canvasKit.PaintStyle.Fill);
  paint.setAntiAlias(true);
  return paint;
};

canvas.drawRect(canvasKit.XYWHRect(0, 0, SIZE, SIZE), fill(MICHIGAN_BLUE));

// The scarlet half: a triangle from the top-left corner down to bottom-left.
const scarletHalf = new canvasKit.Path();
scarletHalf.moveTo(0, 0);
scarletHalf.lineTo(SIZE, 0);
scarletHalf.lineTo(0, SIZE);
scarletHalf.close();
canvas.drawPath(scarletHalf, fill(OHIO_STATE_SCARLET));
scarletHalf.delete();

// The nine diagonal stitches running along the seam between the two halves.
const stitches = new canvasKit.Paint();
stitches.setColor(canvasKit.Color(...WHITE));
stitches.setStyle(canvasKit.PaintStyle.Stroke);
stitches.setStrokeWidth(3 * UNIT);
stitches.setStrokeCap(canvasKit.StrokeCap.Round);
stitches.setAntiAlias(true);
for (let step = 0; step < 9; step++) {
  const x = 8 + step * 10;
  const y = 86 - step * 10;
  canvas.drawLine(x * UNIT, y * UNIT, (x + 6) * UNIT, (y + 6) * UNIT, stitches);
}
stitches.delete();

// Norwester is the site's display face, so the mark's letters match the pages.
const typefaces = canvasKit.TypefaceFontProvider.Make();
typefaces.registerFont(await readFile(new URL('public/fonts/norwester.otf', root)), 'Norwester');

/** Draws one centred letter: ParagraphBuilder handles the horizontal centring. */
const drawLetter = (letter, color, size, centerX, baseline) => {
  const builder = canvasKit.ParagraphBuilder.MakeFromFontProvider(
    canvasKit.ParagraphStyle({
      textAlign: canvasKit.TextAlign.Center,
      textStyle: { color: canvasKit.Color(...color), fontFamilies: ['Norwester'], fontSize: size * UNIT },
    }),
    typefaces
  );
  builder.addText(letter);
  const paragraph = builder.build();
  const width = SIZE;
  paragraph.layout(width);
  // Paragraphs lay out from the top, so offset by the ascent to land the
  // glyph on the baseline the favicon's <text> elements use.
  const ascent = paragraph.getHeight() - (paragraph.getHeight() - size * UNIT) / 2;
  canvas.drawParagraph(paragraph, centerX * UNIT - width / 2, baseline * UNIT - ascent);
  paragraph.delete();
  builder.delete();
};

// Norwester runs taller than the favicon's Arial Black, so the letters sit a
// few units smaller than the SVG to keep the same margin off the edges.
drawLetter('O', WHITE, 46, 33, 46);
drawLetter('M', MICHIGAN_MAIZE, 41, 66, 83);

const image = surface.makeImageSnapshot();
const png = image.encodeToBytes(canvasKit.ImageFormat.PNG, 100);
if (!png) throw new Error('CanvasKit could not encode the logo to PNG');
await writeFile(new URL('public/og-logo.png', root), png);
image.delete();
surface.delete();

console.log(`Wrote public/og-logo.png (${SIZE}x${SIZE}, ${png.length} bytes)`);
