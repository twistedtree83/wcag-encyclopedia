/**
 * The 1.4.10 page keeps its flagship lab's state in the URL, so a reader can share it:
 *
 *   ?zoom=100|200|400        the zoom frame's zoom level
 *   ?layout=fixed|reflow     the catalogue page's layout
 *
 * The starting state writes no query. Unknown values are ignored rather than rejected, as
 * `ringQuery.ts` does: a bad link still opens the page.
 */

import { LAYOUTS, REFLOW_START, type Layout, type Reflow } from './reflow';
import { ZOOMS, type Zoom } from './zoom';

/** The search string for a state, with its leading `?`, or '' for the start. */
export function searchFromReflow({ zoom, layout }: Reflow): string {
  if (zoom === REFLOW_START.zoom && layout === REFLOW_START.layout) return '';
  return `?zoom=${zoom}&layout=${layout}`;
}

/** The state a search string asks for, or `null` when it asks for nothing this lab knows. */
export function reflowFromSearch(search: string): Reflow | null {
  const params = new URLSearchParams(search);
  const z = params.get('zoom');
  const l = params.get('layout');
  const zoom: Zoom | null = ZOOMS.find((v) => String(v) === z) ?? null;
  const layout: Layout | null = LAYOUTS.find((o) => o.value === l)?.value ?? null;
  if (zoom === null && layout === null) return null;
  return { zoom: zoom ?? REFLOW_START.zoom, layout: layout ?? REFLOW_START.layout };
}
