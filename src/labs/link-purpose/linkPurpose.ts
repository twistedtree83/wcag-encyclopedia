/**
 * The 2.4.4 lab's model (#50): three news items, each ending in a link. The reader picks the link
 * text and the sentence before it, and hears a simulated links list read the links out of context.
 *
 * 2.4.4 is judged in context: a vague link passes when the sentence in the same list item names
 * where it goes. The links list shows what that costs, since it strips the sentence away (taking
 * the link text alone is 2.4.9, at AAA).
 */

import { spoken, type Announcement } from '../shared/announce';
import type { Verdict } from '../shared/LabShell';

export type LinkText = 'read-more' | 'click-here' | 'descriptive';
export type LinkContext = 'none' | 'vague' | 'names';

export type Links = { readonly text: LinkText; readonly context: LinkContext };

export const LINK_START: Links = { text: 'read-more', context: 'none' };

/** The three items: where each link goes, its own descriptive text, and a sentence naming it. */
export const ITEMS: readonly { href: string; descriptive: string; names: string }[] = [
  {
    href: '/reports/annual-2025',
    descriptive: 'Read the annual report 2025',
    names: 'The annual report for 2025 is out.',
  },
  {
    href: '/reports/minutes-march',
    descriptive: 'Read the board minutes for March',
    names: 'The board minutes for March are up.',
  },
  {
    href: '/reports/sustainability',
    descriptive: 'Read the sustainability update',
    names: 'Our sustainability update is out.',
  },
];

export const LINK_TEXTS: readonly { value: LinkText; label: string }[] = [
  { value: 'read-more', label: '“Read more”' },
  { value: 'click-here', label: '“Click here”' },
  { value: 'descriptive', label: 'Names the destination' },
];

export const LINK_CONTEXTS: readonly { value: LinkContext; label: string }[] = [
  { value: 'none', label: 'None: the link stands alone' },
  { value: 'vague', label: '“New this week.”' },
  { value: 'names', label: 'A sentence that names it' },
];

/** The sentence before item `i`'s link, or empty. */
export function sentenceOf(context: LinkContext, i: number): string {
  if (context === 'vague') return 'New this week.';
  if (context === 'names') return ITEMS[i]!.names;
  return '';
}

/** Item `i`'s link text. */
export function linkTextOf(text: LinkText, i: number): string {
  if (text === 'descriptive') return ITEMS[i]!.descriptive;
  return text === 'click-here' ? 'Click here' : 'Read more';
}

export function linkVerdict({ text, context }: Links): Verdict {
  return { criterion: '2.4.4', passes: text === 'descriptive' || context === 'names' };
}

/** What the lab announces: the links list as read, then why it passes or fails. */
export function linkSaid(links: Links, list: readonly Announcement[]): string {
  const why =
    links.text === 'descriptive'
      ? 'Each link says where it goes, even out of context.'
      : links.context === 'names'
        ? 'The sentence beside each link names it, so it passes in context. ' +
          'Out of context, the list is still no help.'
        : 'Nothing says where these links go.';
  return `Links list says: ${list.map(spoken).join('; ')}. ${why}`;
}
