/**
 * The 1.4.12 page keeps its flagship lab's state in the URL, so a reader can share it:
 *
 *   ?spacing=line,paragraph,letter,word   the overrides that are on (comma list, may be empty)
 *   ?boxes=fixed|flexible                 the notice card's boxes
 *
 * The starting state writes no query. Unknown values are ignored rather than rejected, as
 * `reflowQuery.ts` does: a bad link still opens the page.
 */

import { OVERRIDES, SPACING_BOXES, SPACING_START, ordered, type Override, type Spacing, type SpacingBoxes } from '../shared/textFit';

/** The search string for a state, with its leading `?`, or '' for the start. */
export function searchFromSpacing({ on, boxes }: Spacing): string {
  const list = ordered(on);
  if (list.length === 0 && boxes === SPACING_START.boxes) return '';
  return `?spacing=${list.join(',')}&boxes=${boxes}`;
}

/** The state a search string asks for, or `null` when it asks for nothing this lab knows. */
export function spacingFromSearch(search: string): Spacing | null {
  const params = new URLSearchParams(search);
  const s = params.get('spacing');
  const b = params.get('boxes');
  const known = OVERRIDES.map((o) => o.value);
  const on: Override[] | null =
    s === null ? null : ordered(s.split(',').filter((v): v is Override => known.includes(v as Override)));
  const boxes: SpacingBoxes | null = SPACING_BOXES.find((o) => o.value === b)?.value ?? null;
  if (boxes === null && (on === null || (on.length === 0 && s !== ''))) return null;
  return { on: on ?? SPACING_START.on, boxes: boxes ?? SPACING_START.boxes };
}
