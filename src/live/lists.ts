import type { Announcement } from '../labs/announce';

/**
 * A screen reader's own readings, out of context (#50): the links list and the headings list a
 * reader pulls up to skim a page, and what is said on switching browser tabs. Each is cut from
 * the announcement log's lines, so it is read from the markup actually rendered.
 *
 * The live stages use these for the "List the links", "List the headings" and "Switch tab" keys;
 * the 2.4.2, 2.4.4 and 2.4.6 labs use them for their logs.
 */

/** The role words each list keeps. */
const LIST_ROLES = {
  links: ['link'],
  headings: ['heading'],
  /** Headings and form fields: what a reader skims to check headings and labels (2.4.6). */
  outline: ['heading', 'edit text'],
} as const satisfies Record<string, readonly string[]>;

export type ListKind = keyof typeof LIST_ROLES;

/** The lines a screen reader's `kind` list shows, in page order. */
export function listOf(lines: readonly Announcement[], kind: ListKind): Announcement[] {
  const roles: readonly string[] = LIST_ROLES[kind];
  return lines.filter((l) => l.role !== null && roles.includes(l.role));
}

/**
 * What is said on switching to a browser tab: the page's title. A page with no title is said by
 * its address, as browsers show it in the tab.
 */
export function tabSwitchLine(title: string, address: string): Announcement {
  return { name: title.trim() || address, role: null, states: [], description: '' };
}
