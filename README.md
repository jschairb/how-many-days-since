# How Many Days Since Michigan Beat Ohio State?

This is a proudly Buckeye-forward Astro site that keeps track of the number of days since Michigan last beat Ohio State. It celebrates scarlet and gray supremacy with rotating celebratory imagery, Columbus time updates, and the same vintage styling the original site used to rub salt in Michigan's wounds.

## Requirements

- Node.js 24.14.0 LTS (`.nvmrc` is committed — run `nvm use` to switch automatically)
- npm 9+ (bundled with current Node releases)

## Getting Started

```bash
npm install
```

Astro will install locally in `node_modules` along with TypeScript and other build-time dependencies.

## Local Development

Start an interactive dev server with hot reloading:

```bash
npm run dev
```

The site will be served at the URL printed in the terminal (typically http://localhost:4321). You can edit the `src/pages/index.astro` page or the styles under `public/` and immediately see those changes reflected.

## Building for Production

```bash
npm run build
```

Astro emits a Node server application into `dist/`. The Count and Record pages render from bundled historical data. Rivalry Lab calls server routes for matchup calculation, seeded simulation, and local Chalk Talk.

Run the production server locally:

```bash
HOST=0.0.0.0 PORT=4310 node ./dist/server/entry.mjs
```

## Deployment

Deploy this repository to a Node-capable host or container runtime. A static-only host cannot serve the Rivalry Lab API routes.

```bash
docker build -t how-many-days-since:local .
docker run --rm -p 4310:4310 how-many-days-since:local
```

The container listens on port `4310`. Verify `/api/health`, `/api/matchup`, `/api/simulate`, and `/rivalry-lab` after deployment.

## Rivalry Lab snapshot refresh

The public site consumes a reduced, derived snapshot from the private historical-model workspace. It never imports the warehouse, CFBD credentials, or purchased data packages.

```sh
# In ~/src/cfb/cfb_simulator, after ratings and validation refresh:
npm run product:generate
npm run product:export-public

# In this repository:
npm run sync:lab-snapshot -- ../cfb/cfb_simulator/exports/rivalry-lab-snapshot.json
```

Review and commit the resulting `src/data/rivalry-lab-snapshot.json` with the public-site change. This explicit release step prevents an unreviewed model refresh from changing production behavior.

## Tests

Unit tests cover the core date-calculation and time-formatting utilities in `src/lib/days.ts`:

```bash
npm test           # single run
npm run test:watch # watch mode
```

## Type Checking

Run TypeScript type checking:

```bash
npm run check
```

## Configuration

The reference date (last time Michigan beat Ohio State) is configured in `astro.config.mjs`:

```javascript
vite: {
  define: {
    'import.meta.env.REFERENCE_DATE': JSON.stringify('2024-11-30T05:00:00.000Z'),
  },
}
```

Update this date when needed to keep the counter accurate.

## Project Structure

- `src/lib/days.ts` – Pure utility functions: `calcDaysSince` and `formatEasternTime`. Tested by Vitest.
- `src/lib/share-graphic.ts` – Pure helpers for the shareable graphic: caption and filename builders, the X intent URL, and the text-layout math (`wrapText`, `fitFontSize`). Text measurement is injected, so the layout is tested in Node without a canvas.
- `src/components/ShareGraphic.astro` – The corner Share badge: draws the 1200x630 card on a hidden `<canvas>` and routes the badge to the share sheet, clipboard, download, or X.
- `src/pages/index.astro` – The single page that renders the Buckeye propaganda, computes the days-since count, and randomizes the featured celebratory image.
- `public/` – Static assets including the Block O favicon, fonts, CSS, and triumphant Buckeye imagery.
- `public/images/` – Rotating collection of celebratory images displayed on the page.
- `astro.config.mjs` – Astro configuration including the reference date and site URL.
- `tsconfig.json` – TypeScript configuration extending Astro's strict preset.

## Features

- **Real-time Counter**: Displays days since the reference date, updating every minute
- **Dynamic Time Display**: Shows current time in Columbus (America/New_York timezone)
- **Random Image Rotation**: Randomly selects from celebratory images on each page load
- **Shareable Graphic**: A 1200x630 PNG drawn in the browser with the current count, offered through the native share sheet, the clipboard, a download, or an X post intent
- **Responsive Design**: Works on all device sizes
- **SVG Favicon**: Block O icon in scarlet and white

## Share Graphic

A scarlet **Share** badge sits in the top-right corner: a diagonal corner ribbon on wide viewports, and a pill below 905px, where the 640px body column reaches the corner and a ribbon would land on the `h1`. The badge is the whole interface. The card never renders on the page, since a preview would only repeat what the visitor is already looking at.

`ShareGraphic.astro` paints the card on a hidden `<canvas>` at load and again every minute, so the count holds up on a tab left open past midnight. It renders client-side, so no rebuild is needed to keep it current.

The card is the homepage scaled to 1200x630, reusing the stylesheet's own values: the `h1` in Impact and `#BE2137` over its `#8F3642` shadow, the count in Arial with its `#808080` drop shadow and the small `days.` tail on the same baseline, then the Columbus line in bold. The count auto-shrinks from 210px if the digits ever outgrow the frame.

Tapping the badge does whatever the browser supports:

| Path | Available when | Result |
| --- | --- | --- |
| Native share sheet | `navigator.canShare` accepts files (mobile Safari, Android Chrome) | One tap: the sheet opens with the PNG attached |
| Copy image | `ClipboardItem` and `navigator.clipboard.write` exist | PNG on the clipboard, ready to paste into a post |
| Download PNG | Always | Saves `days-since-michigan-beat-ohio-state-<count>.png` |
| Post on X | Always | Opens the X composer with the caption and site URL |

Where the share sheet takes files the badge fires it directly. Everywhere else the badge opens a small menu with the other three, dismissed by Escape or a click outside.

Note: the `og:image` meta tags still point at the static PNGs in `public/`. Those preview cards do not carry the day count, since a build-time image would go stale between deploys.

## Buckeye Pride

We are unabashedly pro-Buckeye here. The copy, imagery, and counter all exist to remind the college football world that Ohio State runs this rivalry. If you are looking for sympathy for Michigan, you will not find it in this repository. Go Bucks!
