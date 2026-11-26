/**
 * The 2.4.11 lab's model (#46): a 200px window with a focused field at 70–110px and a sticky
 * banner the reader moves and resizes. 2.4.11 (Minimum) fails only when the banner hides the
 * focused field entirely; part hidden still passes (2.4.12, AAA, asks for none hidden).
 */

import type { Verdict } from '../shared/LabShell';

/** The banner's top edge and height, in the mock's pixels. */
export type Banner = { readonly top: number; readonly height: number };

export const WINDOW_PX = 200;
export const FIELD = { top: 70, height: 40 } as const;
export const MAX_TOP = 160;
export const MAX_HEIGHT = 160;
export const STEP_PX = 10;

export const OBSCURE_START: Banner = { top: 0, height: 50 };

/** How much of the focused field the banner covers, from 0 to 1. */
export function hiddenShare({ top, height }: Banner): number {
  const bottom = Math.min(top + height, WINDOW_PX);
  const overlap = Math.min(bottom, FIELD.top + FIELD.height) - Math.max(top, FIELD.top);
  return Math.max(0, overlap) / FIELD.height;
}

export function obscureVerdict(b: Banner): Verdict {
  return { criterion: '2.4.11', passes: hiddenShare(b) < 1 };
}

/** Where the banner is, in words. */
export function placeText(top: number): string {
  return top === 0 ? 'at the top' : `${top} pixels from the top`;
}

/** The live region's sentence after a change. */
export function obscureSaid(b: Banner): string {
  const share = hiddenShare(b);
  const field =
    share >= 1
      ? 'is completely hidden.'
      : share > 0
        ? `is ${Math.round(share * 100)}% hidden, but still in view.`
        : 'is clear of it.';
  return `Banner ${b.height} pixels tall, ${placeText(b.top)}. The focused field ${field}`;
}
