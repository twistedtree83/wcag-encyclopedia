/**
 * The 1.3.1 page keeps its flagship lab's state in the URL, so a reader can share what they built:
 *
 *   ?mock=form|table                          which mock is shown
 *   ?real=heading,list,labels,headers         the parts built from real elements, any order
 *
 * The starting state writes no query, and parts are written in a fixed order. Anything unknown is
 * ignored, as `nrvQuery.ts` does: a bad link still opens the page.
 */

import { MOCKS, PART_ORDER, STRUCTURE_START, ordered, type Part, type Structure } from './structure';

/** The search string for a state, with its leading `?`, or '' for the starting state. */
export function searchFromStructure({ mock, real }: Structure): string {
  const parts = ordered(real);
  if (mock === STRUCTURE_START.mock && parts.length === 0) return '';
  return parts.length ? `?mock=${mock}&real=${parts.join(',')}` : `?mock=${mock}`;
}

/** The state a search string asks for, or `null` when it asks for nothing this lab knows. */
export function structureFromSearch(search: string): Structure | null {
  const params = new URLSearchParams(search);
  const mock = MOCKS.find((m) => m.value === params.get('mock'))?.value ?? null;
  const asked = (params.get('real') ?? '').split(',');
  const real = ordered(PART_ORDER.filter((p): p is Part => asked.includes(p)));
  if (mock === null && real.length === 0) return null;
  return { mock: mock ?? STRUCTURE_START.mock, real };
}
