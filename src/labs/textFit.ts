/**
 * Text that has to fit (#54): the models of the 1.4.12 flagship lab and the 1.4.4 lab. Both draw
 * the same notice card (`NoticeCard.tsx`) in the zoom frame. Its boxes are either locked at the
 * size they were designed at, in px, or flexible.
 *
 *   1.4.12  the reader turns on text-spacing overrides, one at a time or all four
 *   1.4.4   the reader scales the text to 150% or 200%
 *
 * A locked box is exactly the size of its text as designed, so any override or any larger text
 * pushes text out of it: the verdict fails. Flexible boxes grow, so it passes. e2e checks the
 * card measures the same (`data-clipped`).
 */

import type { Verdict } from './LabShell';
import type { ScrollBox, Viewport } from './zoom';

/** The zoom frame's window for the notice card: a small browser window, at 100% zoom. */
export const CARD_WINDOW: Viewport = { width: 480, height: 360 };

/** The four overrides 1.4.12 names, in the order it names them. */
export type Override = 'line' | 'paragraph' | 'letter' | 'word';

export const OVERRIDES: readonly { readonly value: Override; readonly label: string }[] = [
  { value: 'line', label: 'Line height 1.5' },
  { value: 'paragraph', label: 'Paragraph spacing 2' },
  { value: 'letter', label: 'Letter spacing 0.12' },
  { value: 'word', label: 'Word spacing 0.16' },
];

/** The overrides in `on`, in 1.4.12's order and without repeats. */
export function ordered(on: readonly Override[]): Override[] {
  return OVERRIDES.map((o) => o.value).filter((v) => on.includes(v));
}

export type SpacingBoxes = 'fixed' | 'flexible';

export const SPACING_BOXES: readonly { readonly value: SpacingBoxes; readonly label: string }[] = [
  { value: 'fixed', label: 'Fixed height' },
  { value: 'flexible', label: 'Flexible' },
];

export type Spacing = { readonly on: readonly Override[]; readonly boxes: SpacingBoxes };

export const SPACING_START: Spacing = { on: [], boxes: 'fixed' };

export function spacingVerdict({ on, boxes }: Spacing): Verdict {
  return { criterion: '1.4.12', passes: boxes === 'flexible' || on.length === 0 };
}

const fits = (passes: boolean) => (passes ? 'all the text fits' : 'text is cut off');

export function spacingSaid(state: Spacing): string {
  const on = ordered(state.on);
  const named = on.length
    ? on
        .map((v, i) => {
          const label = OVERRIDES.find((o) => o.value === v)!.label;
          return i === 0 ? label : label.toLowerCase();
        })
        .join(', ')
    : 'No spacing overrides';
  const boxes = state.boxes === 'fixed' ? 'Fixed-height boxes' : 'Flexible boxes';
  return `${named}. ${boxes}: ${fits(spacingVerdict(state).passes)}.`;
}

/** The text sizes the 1.4.4 lab offers, in percent. 200% is the one 1.4.4 names. */
export const SCALES = [100, 150, 200] as const;
export type Scale = (typeof SCALES)[number];

export type ResizeBoxes = 'locked' | 'flexible';

export const RESIZE_BOXES: readonly { readonly value: ResizeBoxes; readonly label: string }[] = [
  { value: 'locked', label: 'Locked in px' },
  { value: 'flexible', label: 'Flexible' },
];

export type Resize = { readonly scale: Scale; readonly boxes: ResizeBoxes };

export const RESIZE_START: Resize = { scale: 100, boxes: 'locked' };

export function resizeVerdict({ scale, boxes }: Resize): Verdict {
  return { criterion: '1.4.4', passes: boxes === 'flexible' || scale === 100 };
}

export function resizeSaid(state: Resize): string {
  const boxes = RESIZE_BOXES.find((b) => b.value === state.boxes)!.label;
  return `Text at ${state.scale}%. ${boxes}: ${fits(resizeVerdict(state).passes)}.`;
}

/** Browsers round sizes, so a pixel or less of overflow is not clipping. */
const SLACK = 1;

/** Whether a box holds more text than it shows, sideways or down. */
export function clips(box: ScrollBox): boolean {
  return box.scrollWidth - box.clientWidth > SLACK || box.scrollHeight - box.clientHeight > SLACK;
}
