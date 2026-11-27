/**
 * What a page shows when its link is shared (S-03): the Open Graph and Twitter tags in its
 * `<head>`, and the **share card** they point at, a 1200×630 PNG drawn at build time.
 *
 * Each criterion page has its own card (number, name, level and principle marker); the fixed
 * pages share one site card. This module only describes a card, as a tree of boxes and text in
 * the design's type and tokens. `scripts/prerender.mjs` draws it with satori and resvg, which
 * are build dependencies only: nothing here reaches the client bundle (the client entry never
 * imports this module).
 *
 * The card's text is held to 4.5:1 and its principle marker to 3:1 by `cardContrastProblems`,
 * which uses the contrast engine. The tags' absolute URLs come from `absoluteUrl` (ADR 0006)
 * and `openGraphProblems` in `crawl.ts` checks every built page.
 */

import { contrastRatio, formatRatio, requiredRatio, type TextKind } from '../color/contrast';
import { EXPECTED, EXPECTED_TOTAL } from '../criteria/manifest';
import { principleFor } from '../criteria/structure';
import { dark } from '../theme/tokens';
import { absoluteUrl } from './crawl';
import { SITE_NAME } from './jsonLd';
import type { Route } from './routes';
import { pageMeta } from './Site';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/** A box on a card, in satori's subset of CSS. `attrs` are an SVG element's attributes. */
export type CardNode = {
  readonly type: string;
  readonly style?: Readonly<Record<string, string | number>>;
  readonly attrs?: Readonly<Record<string, string | number>>;
  readonly children: readonly (CardNode | string)[];
};

/** A page's share card: where it is written under `dist/`, what it shows, and its alt text. */
export type ShareCard = { readonly file: string; readonly alt: string; readonly tree: CardNode };

/** The two faces a card uses, from the self-hosted fonts (`@fontsource/<family>/files/`). */
export const CARD_FONTS = [
  { name: 'Figtree', weight: 800, file: 'figtree/files/figtree-latin-800-normal.woff' },
  { name: 'Figtree', weight: 700, file: 'figtree/files/figtree-latin-700-normal.woff' },
  { name: 'Onest', weight: 400, file: 'onest/files/onest-latin-400-normal.woff' },
] as const;

// The dark theme, the design's default.
const C = dark;
const HEADING = { fontFamily: 'Figtree', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 };
const PRINCIPLE_FILL = { 1: C.a1, 2: C.a2, 3: C.a3, 4: C.a4 } as const;

const PAD_X = 80;
const PAD_Y = 64;

const box = (style: NonNullable<CardNode['style']>, ...children: (CardNode | string)[]): CardNode => ({ type: 'div', style, children });

/** The principle's marker shape (design guide §3.3): square, circle, triangle, diamond. */
function marker(principle: 1 | 2 | 3 | 4, size: number): CardNode {
  const fill = PRINCIPLE_FILL[principle];
  const shape: CardNode =
    principle === 1
      ? { type: 'rect', attrs: { x: 10, y: 10, width: 80, height: 80, rx: 6, fill }, children: [] }
      : principle === 2
        ? { type: 'circle', attrs: { cx: 50, cy: 50, r: 42, fill }, children: [] }
        : principle === 3
          ? { type: 'polygon', attrs: { points: '50,8 94,88 6,88', fill }, children: [] }
          : { type: 'polygon', attrs: { points: '50,4 96,50 50,96 4,50', fill }, children: [] };
  return { type: 'svg', attrs: { width: size, height: size, viewBox: '0 0 100 100' }, children: [shape] };
}

/** The card's frame: page colour, the brand at the top, the given middle and foot. */
function frame(middle: CardNode, foot: CardNode): CardNode {
  return box(
    {
      // satori sizes boxes content-box: the padding adds to these to make 1200×630.
      width: CARD_WIDTH - 2 * PAD_X,
      height: CARD_HEIGHT - 2 * PAD_Y,
      padding: `${PAD_Y}px ${PAD_X}px`,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: C.bg,
      color: C.ink,
      fontFamily: 'Onest',
    },
    box(
      { justifyContent: 'space-between', alignItems: 'center', width: '100%' },
      box({ fontFamily: 'Figtree', fontWeight: 700, fontSize: 34 }, SITE_NAME),
      box({ fontSize: 28, color: C['ink-2'] }, 'WCAG 2.2'),
    ),
    middle,
    foot,
  );
}

/** Long criterion names step down so the name fits in two lines. */
function nameSize(name: string): number {
  if (name.length <= 24) return 84;
  if (name.length <= 38) return 64;
  return 52;
}

function criterionCard(num: string): ShareCard {
  const entry = EXPECTED.find((e) => e.num === num);
  const principle = entry && principleFor(entry.guideline);
  if (!entry || !principle) throw new Error(`share card: no criterion ${num}`);
  const p = principle.num as 1 | 2 | 3 | 4;
  const solid = entry.level === 'AA';

  const middle = box(
    { flexDirection: 'column' },
    box(
      { alignItems: 'center', fontSize: 30, color: C['ink-2'] },
      marker(p, 34),
      box({ marginLeft: 16 }, `${principle.num} ${principle.name}`),
    ),
    box({ ...HEADING, fontSize: 132, color: C['accent-text'], marginTop: 24 }, entry.num),
    box({ ...HEADING, fontSize: nameSize(entry.name), marginTop: 16, maxWidth: 1040 }, entry.name),
  );
  const foot = box(
    { alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    box(
      {
        fontFamily: 'Figtree',
        fontWeight: 700,
        fontSize: 30,
        padding: '8px 22px',
        borderRadius: 10,
        border: `3px solid ${C['badge-bg']}`,
        ...(solid ? { backgroundColor: C['badge-bg'], color: C['badge-fg'] } : { color: C.ink }),
      },
      `Level ${entry.level}`,
    ),
    box({ fontSize: 28, color: C['ink-2'] }, 'Shown broken, then fixed'),
  );
  return {
    file: `share/${entry.num}.png`,
    alt: `Share card: ${entry.num} ${entry.name}, Level ${entry.level}, under the ${principle.name} principle of WCAG 2.2`,
    tree: frame(middle, foot),
  };
}

const SITE_CARD: ShareCard = {
  file: 'share/site.png',
  alt: `Share card: ${SITE_NAME}. Every WCAG criterion, shown: all ${EXPECTED_TOTAL} Level A and AA criteria of WCAG 2.2, under its four principles`,
  tree: frame(
    box(
      { flexDirection: 'column' },
      box(
        { ...HEADING, fontSize: 92, flexDirection: 'column' },
        box({}, 'Every WCAG criterion,'),
        box({ color: C['accent-text'], marginTop: 8 }, 'shown.'),
      ),
      box(
        { fontSize: 34, lineHeight: 1.4, color: C['ink-2'], marginTop: 32, maxWidth: 980 },
        `All ${EXPECTED_TOTAL} Level A and AA criteria of WCAG 2.2, in plain language, shown broken and then fixed.`,
      ),
    ),
    box(
      { alignItems: 'center', fontSize: 28, color: C['ink-2'] },
      ...([1, 2, 3, 4] as const).map((n) =>
        box({ alignItems: 'center', marginRight: 40 }, marker(n, 30), box({ marginLeft: 12 }, ['Perceivable', 'Operable', 'Understandable', 'Robust'][n - 1]!)),
      ),
    ),
  ),
};

/** The card a route's link shows: its criterion's card, or the site card for a fixed page. */
export function shareCard(route: Route): ShareCard {
  return route.page === 'criterion' && route.num ? criterionCard(route.num) : SITE_CARD;
}

const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** The Open Graph and Twitter tags for a route's `<head>`, title and description from `pageMeta`. */
export function shareTags(route: Route): string {
  const { title, description } = pageMeta(route);
  const card = shareCard(route);
  const tags: [string, string, string][] = [
    ['property', 'og:type', route.page === 'criterion' ? 'article' : 'website'],
    ['property', 'og:site_name', SITE_NAME],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', absoluteUrl(route.path)],
    ['property', 'og:image', absoluteUrl(card.file)],
    ['property', 'og:image:type', 'image/png'],
    ['property', 'og:image:width', String(CARD_WIDTH)],
    ['property', 'og:image:height', String(CARD_HEIGHT)],
    ['property', 'og:image:alt', card.alt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:image:alt', card.alt],
  ];
  return tags.map(([attr, key, value]) => `<meta ${attr}="${key}" content="${escape(value)}" />`).join('\n    ');
}

/**
 * The contrast check on a card, by the contrast engine: every piece of text against the
 * nearest background behind it, at 4.5:1 (the design guide's rule 1, without the large-text
 * allowance), and every marker shape against it at 3:1. Returns what fails, or `[]`.
 */
export function cardContrastProblems(tree: CardNode): string[] {
  const problems: string[] = [];
  const check = (fg: string | undefined, bg: string | undefined, kind: TextKind, what: string) => {
    if (!fg || !bg) {
      problems.push(`"${what}" has no ${fg ? 'background' : 'colour'} to measure`);
      return;
    }
    const need = kind === 'body' ? 4.5 : requiredRatio(kind);
    const ratio = contrastRatio(fg, bg);
    if (Math.floor(ratio * 100) / 100 < need) problems.push(`"${what}" is ${formatRatio(ratio)}, below ${need}:1`);
  };
  const walk = (node: CardNode, color: string | undefined, bg: string | undefined) => {
    const c = (node.style?.color as string | undefined) ?? color;
    const b = (node.style?.backgroundColor as string | undefined) ?? bg;
    if (node.attrs?.fill) check(String(node.attrs.fill), b, 'ui', `${node.type} marker`);
    for (const child of node.children) {
      if (typeof child === 'string') check(c, b, 'body', child);
      else walk(child, c, b);
    }
  };
  walk(tree, undefined, undefined);
  return problems;
}

/** The card as satori reads it: React-element-shaped objects, every box a flex box. */
export type SatoriNode = { type: string; props: Record<string, unknown> };
export function toSatori(node: CardNode): SatoriNode {
  const children = node.children.map((child) => (typeof child === 'string' ? child : toSatori(child)));
  const style = node.type === 'div' ? { display: 'flex', ...node.style } : node.style;
  return { type: node.type, props: { ...node.attrs, ...(style ? { style } : {}), children } };
}
