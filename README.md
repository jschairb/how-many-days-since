# How Many Days Since Michigan Beat Ohio State?

This is a proudly Buckeye-forward Astro site that keeps track of the number of days since Michigan last beat Ohio State. It celebrates scarlet and gray supremacy with rotating celebratory imagery, Columbus time updates, and the same vintage styling the original site used to rub salt in Michigan's wounds.

## Requirements

- Node.js 20.x (the Astro CLI and tooling expect a modern Node runtime)
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

Astro will emit the static site into `dist/`. You can preview the production build locally by running:

```bash
npm run preview
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

- `src/pages/index.astro` – The single page that renders the Buckeye propaganda, computes the days-since count, and randomizes the featured celebratory image.
- `public/` – Static assets including the Block O favicon, fonts, CSS, and triumphant Buckeye imagery.
- `public/images/` – Rotating collection of celebratory images displayed on the page.
- `astro.config.mjs` – Astro configuration including the reference date and site URL.
- `tsconfig.json` – TypeScript configuration extending Astro's strict preset.

## Features

- **Real-time Counter**: Displays days since the reference date, updating every minute
- **Dynamic Time Display**: Shows current time in Columbus (America/New_York timezone)
- **Random Image Rotation**: Randomly selects from celebratory images on each page load
- **Responsive Design**: Works on all device sizes
- **SVG Favicon**: Block O icon in scarlet and white

## Buckeye Pride

We are unabashedly pro-Buckeye here. The copy, imagery, and counter all exist to remind the college football world that Ohio State runs this rivalry. If you are looking for sympathy for Michigan, you will not find it in this repository. Go Bucks!
