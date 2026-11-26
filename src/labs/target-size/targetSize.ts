/**
 * The 2.5.8 flagship lab's model (#57): a row of three equal square targets, `size` CSS pixels
 * on a side and `gap` pixels apart. The reader resizes them and their spacing.
 *
 * A target of at least 24 by 24 passes on size. A smaller one passes on spacing: centre a 24px
 * circle on each, and no circle may overlap another target or another small target's circle.
 * For equal squares in a row, the circles are the closer of the two, so the test is that the
 * centres are at least 24px apart. Circles that only touch do not overlap.
 */

import type { Verdict } from '../shared/LabShell';

export type Targets = {
  /** Width and height of each target, in CSS pixels. */
  readonly size: number;
  /** Space between neighbouring targets, in CSS pixels. */
  readonly gap: number;
};

/** The criterion's number: a 24 by 24 target, or a 24px circle. */
export const MIN_TARGET = 24;
export const SIZE_MIN = 8;
export const SIZE_MAX = 44;
export const GAP_MAX = 24;

/** Undersized, but spaced so it passes: the lesson that spacing counts. */
export const TARGETS_START: Targets = { size: 16, gap: 8 };

export type TargetCheck = {
  /** At least 24 by 24. */
  readonly bySize: boolean;
  /** How far the 24px circles overlap, in pixels; 0 when clear, or when the targets are big. */
  readonly overlap: number;
  readonly passes: boolean;
};

export function targetCheck({ size, gap }: Targets): TargetCheck {
  const bySize = size >= MIN_TARGET;
  const overlap = bySize ? 0 : Math.max(0, MIN_TARGET - (size + gap));
  return { bySize, overlap, passes: bySize || overlap === 0 };
}

export function targetVerdict(t: Targets): Verdict {
  return { criterion: '2.5.8', passes: targetCheck(t).passes };
}

const pixels = (n: number) => `${n} pixel${n === 1 ? '' : 's'}`;

/** The live region's sentence after the reader changes the targets. */
export function targetSaid(t: Targets): string {
  const { bySize, overlap, passes } = targetCheck(t);
  const apart = t.gap === 0 ? 'touching' : `${pixels(t.gap)} apart`;
  const why = bySize
    ? 'At least 24 by 24.'
    : overlap === 0
      ? 'Under 24 by 24, but their 24 pixel circles do not overlap.'
      : `Under 24 by 24, and their 24 pixel circles overlap by ${pixels(overlap)}.`;
  return `${t.size} pixel targets, ${apart}. ${why} ${passes ? 'Passes' : 'Fails'}.`;
}
