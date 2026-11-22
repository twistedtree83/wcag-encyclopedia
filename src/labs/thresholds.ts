/**
 * The contrast thresholds the labs judge a pair against, in the design's order. One table for
 * the colour check (all four) and the fade lab (the three text thresholds), so the two labs
 * cannot disagree about a threshold, its criterion or how it is named.
 */

import { AA_BODY, AA_LARGE, AA_UI, AAA_BODY } from '../color/contrast';

export type ThresholdCheck = {
  readonly threshold: number;
  /** What the threshold applies to: "Body text", "Large text", "Borders and icons". */
  readonly appliesTo: string;
  /** Level and criterion, e.g. "AA · 1.4.3". */
  readonly level: string;
  /** How a live region says it, e.g. "body text AA". */
  readonly spoken: string;
  /** A text threshold. The fade lab shows text, so it checks only these. */
  readonly text: boolean;
};

export const THRESHOLD_CHECKS: readonly ThresholdCheck[] = [
  {
    threshold: AA_BODY,
    appliesTo: 'Body text',
    level: 'AA · 1.4.3',
    spoken: 'body text AA',
    text: true,
  },
  {
    threshold: AA_LARGE,
    appliesTo: 'Large text',
    level: 'AA · 1.4.3',
    spoken: 'large text AA',
    text: true,
  },
  {
    threshold: AAA_BODY,
    appliesTo: 'Body text',
    level: 'AAA · 1.4.6',
    spoken: 'body text AAA',
    text: true,
  },
  {
    threshold: AA_UI,
    appliesTo: 'Borders and icons',
    level: 'AA · 1.4.11',
    spoken: 'borders and icons AA',
    text: false,
  },
];

/** The three text thresholds, in the same order. */
export const TEXT_CHECKS: readonly ThresholdCheck[] = THRESHOLD_CHECKS.filter((c) => c.text);
