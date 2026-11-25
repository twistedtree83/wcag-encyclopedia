/**
 * The zoom frame's model (#53): the browser window a frame stands for, and what scrolls in it.
 *
 * Zooming a browser divides its window into fewer CSS pixels. WCAG measures Reflow from a
 * 1280 by 1024 window: at 400% that is 320 by 256 CSS pixels. The frame lays its content out
 * in that many CSS pixels and scales the picture to fit the lab, so the real page is never
 * resized (`ZoomFrame.tsx`).
 */

export type Viewport = { readonly width: number; readonly height: number };

/** The window WCAG's Reflow figures start from, at 100%. */
export const DESKTOP: Viewport = { width: 1280, height: 1024 };

/** The zoom levels the frame offers, in percent. 400% is the one 1.4.10 names. */
export const ZOOMS = [100, 200, 400] as const;
export type Zoom = (typeof ZOOMS)[number];

/** The window at `zoom` percent, in CSS pixels. Turned swaps width and height (1.3.4). */
export function viewportAt(zoom: number, base: Viewport = DESKTOP, turned = false): Viewport {
  const width = Math.round((base.width * 100) / zoom);
  const height = Math.round((base.height * 100) / zoom);
  return turned ? { width: height, height: width } : { width, height };
}

export type Scrolls = { readonly sideways: boolean; readonly down: boolean };

/** The scroll box's own sizes: what it holds against what it shows. */
export type ScrollBox = {
  readonly scrollWidth: number;
  readonly clientWidth: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
};

/** Browsers round sizes, so overflow of a pixel or less is not scrolling. */
const SLACK = 1;

export function scrollsOf(box: ScrollBox): Scrolls {
  return {
    sideways: box.scrollWidth - box.clientWidth > SLACK,
    down: box.scrollHeight - box.clientHeight > SLACK,
  };
}

/** What scrolls, in words: the line the instruments and readouts show. */
export function scrollLine({ sideways, down }: Scrolls): string {
  if (sideways && down) return 'Scrolls down and sideways: two directions';
  if (sideways) return 'Scrolls sideways only';
  if (down) return 'Scrolls down only';
  return 'Nothing scrolls';
}

/**
 * Text spacing as 1.4.12 sets it, for a frame with `spacing` on: line height 1.5, letter
 * spacing 0.12em, word spacing 0.16em, paragraph spacing 2em (all relative to font size).
 */
export const TEXT_SPACING = { lineHeight: 1.5, letter: 0.12, word: 0.16, paragraph: 2 } as const;
