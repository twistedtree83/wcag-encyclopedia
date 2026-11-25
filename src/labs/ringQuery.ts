/**
 * The 2.4.7 page keeps its flagship lab's state in the URL, so a reader can share the ring they
 * styled:
 *
 *   ?w=0..6                      ring thickness in pixels (0 is no ring)
 *   ?off=0..6                    offset from the button in pixels
 *   ?c=blue|black|grey|yellow    ring colour
 *
 * The starting state writes no query. Unknown or out-of-range values are ignored rather than
 * rejected, as `pairQuery.ts` and `nrvQuery.ts` do: a bad link still opens the page.
 */

import { MAX_PX, RING_COLOURS, RING_START, type Ring, type RingColour } from './focusRing';

/** The search string for a ring, with its leading `?`, or '' for the starting ring. */
export function searchFromRing(ring: Ring): string {
  const { width, offset, colour } = ring;
  if (width === RING_START.width && offset === RING_START.offset && colour === RING_START.colour) {
    return '';
  }
  return `?w=${width}&off=${offset}&c=${colour}`;
}

const pixels = (v: string | null): number | null =>
  v !== null && /^\d$/.test(v) && Number(v) <= MAX_PX ? Number(v) : null;

/** The ring a search string asks for, or `null` when it asks for nothing this lab knows. */
export function ringFromSearch(search: string): Ring | null {
  const params = new URLSearchParams(search);
  const width = pixels(params.get('w'));
  const offset = pixels(params.get('off'));
  const c = params.get('c');
  const colour: RingColour | null = RING_COLOURS.find((o) => o.value === c)?.value ?? null;
  if (width === null && offset === null && colour === null) return null;
  return {
    width: width ?? RING_START.width,
    offset: offset ?? RING_START.offset,
    colour: colour ?? RING_START.colour,
  };
}
