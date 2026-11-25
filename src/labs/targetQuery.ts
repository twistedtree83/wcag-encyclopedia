/**
 * The 2.5.8 page keeps its flagship lab's state in the URL, so a reader can share the targets
 * they sized:
 *
 *   ?size=8..44   each target's width and height in CSS pixels
 *   ?gap=0..24    the space between targets in CSS pixels
 *
 * The starting state writes no query. Unknown or out-of-range values are ignored rather than
 * rejected, as `ringQuery.ts` does: a bad link still opens the page.
 */

import { GAP_MAX, SIZE_MAX, SIZE_MIN, TARGETS_START, type Targets } from './targetSize';

/** The search string for the targets, with its leading `?`, or '' for the start. */
export function searchFromTargets({ size, gap }: Targets): string {
  if (size === TARGETS_START.size && gap === TARGETS_START.gap) return '';
  return `?size=${size}&gap=${gap}`;
}

const whole = (v: string | null, min: number, max: number): number | null =>
  v !== null && /^\d{1,2}$/.test(v) && Number(v) >= min && Number(v) <= max ? Number(v) : null;

/** The targets a search string asks for, or `null` when it asks for nothing this lab knows. */
export function targetsFromSearch(search: string): Targets | null {
  const params = new URLSearchParams(search);
  const size = whole(params.get('size'), SIZE_MIN, SIZE_MAX);
  const gap = whole(params.get('gap'), 0, GAP_MAX);
  if (size === null && gap === null) return null;
  return { size: size ?? TARGETS_START.size, gap: gap ?? TARGETS_START.gap };
}
