/**
 * The fade-the-text lab's model (R-07): how far the reader has faded the exhibit text, and
 * what that does to its contrast. Pure, so the static HTML and the live lab agree.
 *
 * The exhibit sits on `--exhibit` (the same near-black in both themes). Its text is a grey that
 * runs from #F3F3F3 at 0% faded to #2A2A2A at 100%, as in the design prototype.
 *
 * Thresholds come from the table the colour check uses (`thresholds.ts`), and scores are judged
 * and written by the contrast engine, so the two labs always agree on a pair.
 */

import {
  AA_BODY,
  AA_LARGE,
  AAA_BODY,
  contrastRatio,
  formatScore,
  passesThreshold,
} from '../color/contrast';
import { dark } from '../theme/tokens';
import { TEXT_CHECKS } from './thresholds';

export const FADE_DEFAULT = 18;
export const EXHIBIT_BG = dark.exhibit;

const LIGHTEST = 0xf3;
const DARKEST = 0x2a;

/** The ticks on the scale bar: the three text thresholds and the maximum. */
export const SCALE_TICKS = [AA_LARGE, AA_BODY, AAA_BODY, 21] as const;

export type FadeResult = {
  readonly name: string;
  readonly level: string;
  readonly passes: boolean;
};

export type FadeState = {
  readonly faded: number;
  /** The exhibit text colour, `#rrggbb`. */
  readonly colour: string;
  readonly ratio: number;
  /** "11.94 : 1" — two decimals, truncated so it never over-claims. */
  readonly ratioText: string;
  /** Where the ratio sits on the log-scale bar, 0..100 (percent of its width). */
  readonly position: number;
  readonly results: readonly FadeResult[];
  /** One sentence for the polite live region. */
  readonly announcement: string;
};

/** Position of a ratio on the scale bar: log(ratio) / log(21), as a percentage. */
export function scalePosition(ratio: number): number {
  return (Math.log(ratio) / Math.log(21)) * 100;
}

export function fadeState(faded: number): FadeState {
  const level = Math.round(LIGHTEST - ((LIGHTEST - DARKEST) * faded) / 100);
  const hex = level.toString(16).padStart(2, '0');
  const colour = `#${hex}${hex}${hex}`;
  const ratio = contrastRatio(colour, EXHIBIT_BG);
  const ratioText = `${formatScore(ratio)} : 1`;
  const results = TEXT_CHECKS.map((c) => ({
    name: c.appliesTo,
    level: c.level,
    passes: passesThreshold(ratio, c.threshold),
  }));
  const verdicts = TEXT_CHECKS.map(
    (c, i) => `${results[i]!.passes ? 'passes' : 'fails'} ${c.spoken}`,
  );
  const sentence = verdicts.join(', ');
  return {
    faded,
    colour,
    ratio,
    ratioText,
    position: scalePosition(ratio),
    results,
    announcement: `${faded}% faded. Contrast ratio ${ratioText}. ${sentence[0]!.toUpperCase()}${sentence.slice(1)}.`,
  };
}
