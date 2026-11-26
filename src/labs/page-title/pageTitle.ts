/**
 * The 2.4.2 lab's model (#50): a mock checkout page whose title the reader picks, heard as a
 * simulated switch to its browser tab. The title passes once it says which page this is.
 */

import { spoken } from '../shared/announce';
import type { Verdict } from '../shared/LabShell';
import { tabSwitchLine } from '../../live/lists';

export type TitleChoice = 'empty' | 'generic' | 'descriptive';

/** The page's address, shown and read in place of a missing title. */
export const ADDRESS = 'acme.example/checkout/delivery';

const TEXT: Readonly<Record<TitleChoice, string>> = {
  empty: '',
  generic: 'Acme',
  descriptive: 'Delivery details — Acme',
};

export const TITLE_START: TitleChoice = 'generic';

export const TITLES: readonly { value: TitleChoice; label: string }[] = [
  { value: 'empty', label: 'Empty: no title at all' },
  { value: 'generic', label: 'Generic: “Acme”' },
  { value: 'descriptive', label: 'Descriptive: “Delivery details — Acme”' },
];

/** The title's text: empty for none. */
export function titleText(choice: TitleChoice): string {
  return TEXT[choice];
}

/** What the tab shows and a screen reader says on switching to it. */
export function tabLabel(choice: TitleChoice): string {
  return spoken(tabSwitchLine(TEXT[choice], ADDRESS));
}

export function titleVerdict(choice: TitleChoice): Verdict {
  return { criterion: '2.4.2', passes: choice === 'descriptive' };
}

const WHY: Readonly<Record<TitleChoice, string>> = {
  empty: 'The page has no title, so the address is read instead.',
  generic: 'The title names the site, not this page.',
  descriptive: 'The title says which page this is.',
};

/** What the lab announces once the reader picks a title. */
export function titleSaid(choice: TitleChoice): string {
  return `Screen reader says: ${tabLabel(choice)}. ${WHY[choice]}`;
}
