/**
 * 1.4.5 Images of Text (#55): a sale heading that is either real text or a picture of it, in the
 * zoom frame, zoomed and shown in the reader's own colours.
 *
 * The picture is drawn once at 1x, the way an exported banner is, so at 200% each of its pixels
 * is stretched over two, and at 400% over four: it blurs. Real text is redrawn at every size.
 * A reader's colours reach text through CSS and never reach the pixels of a picture.
 *
 * The verdict fails for the image whatever the zoom or colours: they only show why.
 */

import { colourLine, sharpLine } from '../../live/readouts';
import type { Verdict } from '../shared/LabShell';
import type { Viewport, Zoom } from '../shared/zoom';

export const HEADLINE = 'Spring sale — 30% off';

/** The window the heading is drawn in at 100%: a small browser window. */
export const SALE_WINDOW: Viewport = { width: 640, height: 360 };

export type Heading = 'text' | 'image';
export type Colours = 'page' | 'mine';

export const HEADINGS: readonly { readonly value: Heading; readonly label: string }[] = [
  { value: 'text', label: 'Real text' },
  { value: 'image', label: 'Image of text' },
];

export const COLOURS: readonly { readonly value: Colours; readonly label: string }[] = [
  { value: 'page', label: 'The page’s own' },
  { value: 'mine', label: 'Mine' },
];

export type ImagesOfText = { readonly heading: Heading; readonly zoom: Zoom; readonly colours: Colours };

export const IMAGES_START: ImagesOfText = { heading: 'text', zoom: 100, colours: 'page' };

// The readout lines are shared with the live stages, so they live in `live/readouts.ts`.
export { colourLine, sharpLine };

export function imagesVerdict({ heading }: ImagesOfText): Verdict {
  return { criterion: '1.4.5', passes: heading === 'text' };
}

export function imagesSaid({ heading, zoom, colours }: ImagesOfText): string {
  const image = heading === 'image';
  const name = HEADINGS.find((h) => h.value === heading)!.label;
  return `${name} at ${zoom}%. ${sharpLine(zoom, image)}. ${colourLine(colours === 'mine', image)}.`;
}
