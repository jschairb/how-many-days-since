/**
 * The Open Graph card layout, written as the site's own CSS.
 *
 * Satori lays this out with flexbox and renders it to SVG, so the card can use
 * the same devices the pages do — the 8px ink frame, the Archivo Black
 * headlines, the offset text shadow under the counter, the team color bar. Two
 * rules from satori: every element that has children needs `display: flex`,
 * and there is no `calc()`.
 */
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  OG_SITE_DOMAIN,
  headlineText,
  type CardTeam,
  type HeadlineSpan,
  type OgCard,
} from './og-card';

/** Straight from src/styles/site.css, so the cards cannot drift from the pages. */
const INK = '#111';
const PAPER = '#fff';
const MUTED = '#6b717c';
const BODY = '#3d4148';
const OSU_SCARLET = '#bb0000';
const MICHIGAN_NAVY = '#00274c';
const MICHIGAN_MAIZE = '#ffcb05';

interface TeamStyle {
  /** Blocks across the top of the card, each with its share of the width. */
  bar: { color: string; grow: number }[];
  /** Color of the oversized figure. */
  accent: string;
}

const TEAM_STYLES: Record<CardTeam, TeamStyle> = {
  'ohio-state': { bar: [{ color: OSU_SCARLET, grow: 1 }], accent: OSU_SCARLET },
  michigan: {
    // Navy carries the bar; maize is the stripe, the way the team wears it.
    bar: [{ color: MICHIGAN_NAVY, grow: 5 }, { color: MICHIGAN_MAIZE, grow: 1 }],
    accent: MICHIGAN_NAVY,
  },
  rivalry: {
    bar: [{ color: OSU_SCARLET, grow: 1 }, { color: MICHIGAN_NAVY, grow: 1 }],
    // The bar carries both sides; the figure stays in the site's scarlet so it
    // never reads as ink printed on ink.
    accent: OSU_SCARLET,
  },
};

const TONES: Record<NonNullable<HeadlineSpan['tone']>, string> = {
  ink: INK,
  'ohio-state': OSU_SCARLET,
  michigan: MICHIGAN_NAVY,
  muted: MUTED,
};

/**
 * Minimal `React.createElement` stand-in. Satori only needs plain objects of
 * this shape, so the template stays in a `.ts` file with no JSX toolchain.
 */
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: Node[] | string): Node => ({
  type,
  props: { style, ...(children === undefined ? {} : { children }) },
});

/** Long headlines step down so they wrap at most twice and never overflow. */
function headlineSize(headline: string): number {
  if (headline.length > 40) return 56;
  if (headline.length > 26) return 66;
  if (headline.length > 14) return 80;
  return 100;
}

/**
 * The headline row. Colored spans sit side by side and wrap together, so a
 * score reads `OHIO STATE 27–9 MICHIGAN` in the teams' own colors.
 */
function headlineNode(headline: string | HeadlineSpan[]): Node {
  const size = headlineSize(headlineText(headline));
  const spans: HeadlineSpan[] = typeof headline === 'string' ? [{ text: headline }] : headline;

  return h(
    'div',
    {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      fontFamily: 'Archivo Black',
      fontSize: size,
      lineHeight: 1.02,
      letterSpacing: '-0.02em',
      paddingBottom: 22,
    },
    spans.map((span, index) =>
      h(
        'div',
        {
          display: 'flex',
          color: TONES[span.tone ?? 'ink'],
          paddingRight: index === spans.length - 1 ? 0 : Math.round(size * 0.22),
        },
        span.text
      )
    )
  );
}

export function buildCardTemplate(card: OgCard, logoDataUri: string): Node {
  const team = TEAM_STYLES[card.team];

  return h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      backgroundColor: PAPER,
      // The pages frame every panel in a hard ink border; so does the card.
      border: `10px solid ${INK}`,
      fontFamily: 'IBM Plex Sans',
    },
    [
      // Team bar, the card's answer to the scarlet rule under the site nav.
      h(
        'div',
        { display: 'flex', width: '100%', height: 22 },
        team.bar.map(({ color, grow }) =>
          h('div', { display: 'flex', flexGrow: grow, height: '100%', backgroundColor: color })
        )
      ),

      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'center',
          padding: '0 64px',
        },
        [
          h(
            'div',
            {
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: MUTED,
              paddingBottom: 18,
            },
            card.eyebrow
          ),

          ...(card.metric
            ? [
                h(
                  'div',
                  { display: 'flex', alignItems: 'flex-end', paddingBottom: 26 },
                  [
                    h(
                      'div',
                      {
                        display: 'flex',
                        fontFamily: 'Archivo Black',
                        fontSize: 196,
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        color: team.accent,
                        // The home page's counter shadow, scaled to the card.
                        textShadow: `9px 9px 0 ${INK}`,
                      },
                      card.metric.value
                    ),
                    h(
                      'div',
                      {
                        display: 'flex',
                        fontFamily: 'Archivo Black',
                        fontSize: 58,
                        lineHeight: 1,
                        color: INK,
                        // Clears the figure's offset shadow.
                        paddingLeft: 40,
                        paddingBottom: 24,
                      },
                      card.metric.unit
                    ),
                  ]
                ),
              ]
            : []),

          ...(card.headline ? [headlineNode(card.headline)] : []),

          h(
            'div',
            { display: 'flex', fontSize: 27, lineHeight: 1.3, color: BODY },
            card.detail
          ),
        ]
      ),

      // Footer: the mark and the domain, so a cropped card still says whose it is.
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          padding: '20px 64px',
          borderTop: `3px solid ${INK}`,
        },
        [
          { type: 'img', props: { src: logoDataUri, width: 44, height: 44, style: { display: 'flex' } } },
          h(
            'div',
            {
              display: 'flex',
              paddingLeft: 18,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: MUTED,
            },
            OG_SITE_DOMAIN
          ),
        ]
      ),
    ]
  );
}
