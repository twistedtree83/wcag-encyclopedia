/**
 * The contrast engine.
 *
 * Pure, total, dependency-free. Two consumers: the token contrast audit (tests) and the
 * measured-ratio badges rendered on contrast examples. It knows nothing about rendering,
 * tokens, or WCAG criteria — only about colour.
 *
 * Formulas are WCAG 2.x §relative luminance and §contrast ratio.
 */

export type Rgb = { readonly r: number; readonly g: number; readonly b: number };

/** WCAG minimum ratios. Large text is >=24px, or >=18.66px when bold. */
export const AA_BODY = 4.5;
export const AA_LARGE = 3;
export const AA_UI = 3;

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Parse `#RGB` or `#RRGGBB` into channel values in 0..255. Throws on anything else. */
export function parseHex(hex: string): Rgb {
  const m = HEX.exec(hex.trim());
  if (!m) throw new Error(`contrast: not a hex colour: ${JSON.stringify(hex)}`);
  let body = m[1]!;
  if (body.length === 3) {
    body = body
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return {
    r: Number.parseInt(body.slice(0, 2), 16),
    g: Number.parseInt(body.slice(2, 4), 16),
    b: Number.parseInt(body.slice(4, 6), 16),
  };
}

/** Linearise one sRGB channel given as 0..255. */
function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(colour: Rgb | string): number {
  const { r, g, b } = typeof colour === 'string' ? parseHex(colour) : colour;
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/**
 * Contrast ratio between two colours, 1..21. Symmetric — argument order does not matter.
 */
export function contrastRatio(a: Rgb | string, b: Rgb | string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Round the way contrast tools report: one decimal place, truncated so we never over-claim. */
export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`;
}

export type TextKind = 'body' | 'large' | 'ui';

export function requiredRatio(kind: TextKind): number {
  return kind === 'body' ? AA_BODY : kind === 'large' ? AA_LARGE : AA_UI;
}

/** Does this pair meet its Level AA requirement? Truncates first, so 4.49 does not round up. */
export function meetsAA(ratio: number, kind: TextKind): boolean {
  return passesThreshold(ratio, requiredRatio(kind));
}

/** The Level AAA body-text threshold (1.4.6). */
export const AAA_BODY = 7;

/** A ratio truncated to two decimals: 4.499 → 4.49, never rounded up. */
function truncate2(ratio: number): number {
  return Math.floor(ratio * 100) / 100;
}

/** Does a ratio clear a threshold? Judged on the two-decimal truncation the reader sees. */
export function passesThreshold(ratio: number, threshold: number): boolean {
  return truncate2(ratio) >= threshold;
}

/** The colour check's score: two decimals, truncated ("4.49"). */
export function formatScore(ratio: number): string {
  return truncate2(ratio).toFixed(2);
}

/**
 * A typed hex code as `#RRGGBB` in capitals, or `null` while it is not a whole code yet.
 * Takes 3 or 6 digits, with or without `#`. Never throws (the colour check calls it per key).
 */
export function normaliseHex(input: string): string | null {
  let body = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(body)) {
    body = body
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return /^[0-9a-f]{6}$/i.test(body) ? `#${body.toUpperCase()}` : null;
}

function toHex({ r, g, b }: Rgb): string {
  const part = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

/**
 * The closest colour of the same hue as `fg` that reaches `target` against `bg`: mix `fg`
 * towards black and towards white in 1% steps, and keep whichever needs the smaller change.
 * `null` only if neither direction gets there (cannot happen for the 4.5:1 threshold).
 */
export function nearestPass(fg: string, bg: string, target = AA_BODY): string | null {
  const from = parseHex(fg);
  let best: { colour: string; step: number } | null = null;
  for (const to of [0, 255]) {
    for (let step = 1; step <= 100; step++) {
      const t = step / 100;
      const colour = toHex({
        r: from.r + (to - from.r) * t,
        g: from.g + (to - from.g) * t,
        b: from.b + (to - from.b) * t,
      });
      if (contrastRatio(colour, bg) >= target) {
        if (!best || step < best.step) best = { colour, step };
        break;
      }
    }
  }
  return best ? best.colour : null;
}
