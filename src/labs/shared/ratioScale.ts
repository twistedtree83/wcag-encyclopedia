/**
 * The 1 to 21 contrast scale every contrast lab draws under its ratio (`RatioExplained`): where a
 * ratio sits on it, and the same thing in words. Pure, so the static HTML and the live lab agree.
 *
 * The scale is logarithmic, as contrast is: 1 : 1 at the left end, 21 : 1 at the right, and the
 * three thresholds (3, 4.5 and 7) spread out where the reader can see them.
 */

import { AA_BODY, AA_LARGE, AAA_BODY, formatScore, passesThreshold } from '../../color/contrast';

/** The thresholds marked on the scale, lowest first. */
export const RATIO_MARKS = [AA_LARGE, AA_BODY, AAA_BODY] as const;

/** Where a ratio sits on the scale, 0..100 (percent of its width): log(ratio) / log(21). */
export function ratioPosition(ratio: number): number {
  return (Math.log(ratio) / Math.log(21)) * 100;
}

/** The scale in words, the text equivalent of the drawing. Judged as the checks are: truncated. */
export function scaleSentence(ratio: number): string {
  const at = `On the scale from 1 : 1 to 21 : 1, ${formatScore(ratio)} : 1 is`;
  const r = (n: number) => `${n} : 1`;
  if (!passesThreshold(ratio, AA_LARGE)) {
    return `${at} below ${r(AA_LARGE)}: too low for text, borders or icons.`;
  }
  if (!passesThreshold(ratio, AA_BODY)) {
    return `${at} between ${r(AA_LARGE)} and ${r(AA_BODY)}: enough for large text, borders and icons, not for body text.`;
  }
  if (!passesThreshold(ratio, AAA_BODY)) {
    return `${at} between ${r(AA_BODY)} and ${r(AAA_BODY)}: enough for body text at AA, not at AAA.`;
  }
  return `${at} at or above ${r(AAA_BODY)}: enough for every threshold.`;
}
