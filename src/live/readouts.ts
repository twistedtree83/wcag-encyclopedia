/**
 * Readout lines that a lab and a live stage both show for 1.4.5 (#55): how sharp the heading is,
 * and whether it takes the reader's colours. They live here so the stage and its instruments
 * never reach into a lab; the 1.4.5 lab's model (`labs/imagesOfText.ts`) re-exports them.
 */

/** How sharp the heading is at `zoom` percent. */
export function sharpLine(zoom: number, image: boolean): string {
  if (!image) return `Text redrawn at ${zoom}%: sharp`;
  if (zoom === 100) return 'Image at its own size: sharp';
  return `Image pixels stretched ${zoom / 100} times: blurred`;
}

/** Whether the heading takes the reader's colours. */
export function colourLine(restyled: boolean, image: boolean): string {
  if (!restyled) return 'Your colours: off';
  return image ? 'Your colours: on, but the image keeps its own' : 'Your colours: on, and the text follows them';
}
