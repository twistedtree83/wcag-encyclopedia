/**
 * The 2.4.7 flagship lab's model (#44): the reader styles the focus ring on a dark button on a
 * white page (thickness, offset, colour) and the verdict says whether it can still be seen.
 *
 * No new maths: a ring is visible when it clears the site's non-text threshold (the "Borders and
 * icons" row of `THRESHOLD_CHECKS`, 3:1, judged by the contrast engine) against everything it
 * touches. With an offset, the gap shows the page, so the ring touches only the page. With no
 * offset it sits on the button's edge and must stand out from the button too, which is how a
 * dark ring disappears into a dark control.
 */

import { contrastRatio, formatScore, passesThreshold } from '../../color/contrast';
import type { Verdict } from '../shared/LabShell';
import { THRESHOLD_CHECKS } from '../shared/thresholds';

export type RingColour = 'blue' | 'black' | 'grey' | 'yellow';

export type Ring = {
  /** Thickness in CSS pixels, 0 (no ring) to `MAX_PX`. */
  readonly width: number;
  /** Gap between the button and the ring, in CSS pixels, 0 to `MAX_PX`. */
  readonly offset: number;
  readonly colour: RingColour;
};

export const MAX_PX = 6;

/** The page and the button the ring is drawn on: a depicted design, the same in both themes. */
export const PAGE_BG = '#FFFFFF';
export const BUTTON_BG = '#102A43';
export const BUTTON_TEXT = '#FFFFFF';

export const RING_COLOURS: readonly { value: RingColour; label: string; hex: string }[] = [
  { value: 'blue', label: 'Blue', hex: '#1D4ED8' },
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'grey', label: 'Mid grey', hex: '#949494' },
  { value: 'yellow', label: 'Yellow', hex: '#FFCC00' },
];

/** The site's own ring, near enough: 3px, clear of the control. */
export const RING_START: Ring = { width: 3, offset: 2, colour: 'blue' };

/** The threshold a ring is judged at: the non-text row of the site's threshold list. */
export const RING_CHECK = THRESHOLD_CHECKS.find((c) => !c.text)!;

export const hexOf = (colour: RingColour): string =>
  RING_COLOURS.find((c) => c.value === colour)!.hex;

export type Side = {
  readonly against: 'the page' | 'the button';
  readonly ratio: number;
  /** Two decimals, truncated, as the colour check shows it. */
  readonly score: string;
  readonly passes: boolean;
};

export type RingCheck = { readonly sides: readonly Side[]; readonly passes: boolean };

export function ringCheck({ width, offset, colour }: Ring): RingCheck {
  if (width <= 0) return { sides: [], passes: false };
  const hex = hexOf(colour);
  const side = (against: Side['against'], bg: string): Side => {
    const ratio = contrastRatio(hex, bg);
    return { against, ratio, score: formatScore(ratio), passes: passesThreshold(ratio, RING_CHECK.threshold) };
  };
  const sides = [side('the page', PAGE_BG)];
  if (offset === 0) sides.push(side('the button', BUTTON_BG));
  return { sides, passes: sides.every((s) => s.passes) };
}

export function ringVerdict(ring: Ring): Verdict {
  return { criterion: '2.4.7', passes: ringCheck(ring).passes };
}

const px = (n: number) => `${n} pixel${n === 1 ? '' : 's'}`;

/** The live region's sentence after the reader changes the ring. */
export function ringSaid(ring: Ring): string {
  const check = ringCheck(ring);
  if (check.sides.length === 0) return 'No ring. Focus cannot be seen.';
  const colour = RING_COLOURS.find((c) => c.value === ring.colour)!.label.toLowerCase();
  const where = ring.offset === 0 ? 'touching the button' : `${px(ring.offset)} clear`;
  const ratios = check.sides.map((s) => `${s.score} to 1 against ${s.against}`).join(', ');
  const lost = check.sides.filter((s) => !s.passes).map((s) => s.against);
  const result = lost.length === 0 ? 'Visible.' : `Lost against ${lost.join(' and ')}.`;
  return `${ring.width} pixel ${colour} ring, ${where}. ${ratios}. ${result}`;
}
