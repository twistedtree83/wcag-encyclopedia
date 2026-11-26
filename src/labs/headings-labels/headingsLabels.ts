/**
 * The 2.4.6 lab's model (#50): a mock returns page with three headings and one field. The reader
 * rewrites the headings and the field's label, and hears a simulated headings-and-fields list
 * read them. 2.4.6 asks that headings and labels describe their topic or purpose, not merely
 * exist (being marked up is 1.3.1).
 */

import { spoken, type Announcement } from '../shared/announce';
import type { Verdict } from '../shared/LabShell';

export type Wording = 'vague' | 'descriptive';

export type Doc = { readonly headings: Wording; readonly label: Wording };

export const DOC_START: Doc = { headings: 'vague', label: 'vague' };

/** The page heading, then its two section headings. */
export const HEADINGS: Readonly<Record<Wording, readonly [string, string, string]>> = {
  vague: ['More', 'Information', 'Details'],
  descriptive: ['Returns and refunds', 'How long you have', 'What it costs'],
};

export const LABELS: Readonly<Record<Wording, string>> = {
  vague: 'Enter your details here',
  descriptive: 'Order number',
};

export const HEADING_CHOICES: readonly { value: Wording; label: string }[] = [
  { value: 'vague', label: '“More”, “Information”, “Details”' },
  { value: 'descriptive', label: '“Returns and refunds”, “How long you have”, “What it costs”' },
];

export const LABEL_CHOICES: readonly { value: Wording; label: string }[] = [
  { value: 'vague', label: '“Enter your details here”' },
  { value: 'descriptive', label: '“Order number”' },
];

export function docVerdict({ headings, label }: Doc): Verdict {
  return { criterion: '2.4.6', passes: headings === 'descriptive' && label === 'descriptive' };
}

/** What the lab announces: the list as read, then why it passes or fails. */
export function docSaid({ headings, label }: Doc, list: readonly Announcement[]): string {
  const why =
    headings === 'descriptive' && label === 'descriptive'
      ? 'Every heading and the label say what they are for.'
      : headings === 'descriptive'
        ? 'The label does not say what to type.'
        : label === 'descriptive'
          ? 'The headings do not say what is under them.'
          : 'Neither the headings nor the label say what they are for.';
  return `Headings and fields list says: ${list.map(spoken).join('; ')}. ${why}`;
}
