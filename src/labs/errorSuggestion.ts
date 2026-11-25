/**
 * The 3.3.3 lab's model (#59): a one-field form whose date is rejected on submit. The error is
 * tied to the field either way (3.3.1 is met); the reader chooses whether it only says something
 * is wrong, or says how to put it right.
 *
 * The verdict judges the message, so it holds before the first submit too.
 */

import { spoken, type Announcement } from './announce';
import type { Verdict } from './LabShell';

export type ErrorMessage = 'vague' | 'suggest';

export type ErrorSuggestion = {
  readonly message: ErrorMessage;
  /** Whether the reader has submitted the form, so the error is on screen. */
  readonly submitted: boolean;
};

export const ES_START: ErrorSuggestion = { message: 'vague', submitted: false };

/** The rejected entry: a two-digit year. */
export const ES_VALUE = '05/03/26';

export const ES_TEXT: Readonly<Record<ErrorMessage, string>> = {
  vague: 'Invalid input',
  suggest: 'Use DD/MM/YYYY, for example 05/03/2026',
};

export const MESSAGES: readonly { readonly value: ErrorMessage; readonly label: string }[] = [
  { value: 'vague', label: '“Invalid input”' },
  { value: 'suggest', label: 'The format, with an example' },
];

export function esVerdict({ message }: ErrorSuggestion): Verdict {
  return { criterion: '3.3.3', passes: message === 'suggest' };
}

/** The live region's sentence after a change: the log, then whether it helps. */
export function esSaid({ message, submitted }: ErrorSuggestion, lines: readonly Announcement[]): string {
  const said = `Screen reader says: ${lines.map(spoken).join('; ')}.`;
  if (!submitted) return `${said} Not submitted yet.`;
  return message === 'suggest'
    ? `${said} It says how to put it right.`
    : `${said} It says something is wrong, not how to put it right.`;
}

/**
 * Whether `text` is a real date written day, month, then a four-digit year, separated by spaces,
 * slashes, dots or hyphens. The 3.3.3 Fixed form accepts exactly this.
 */
export function isDayMonthYear(text: string): boolean {
  const m = /^\s*(\d{1,2})[\s/.-]+(\d{1,2})[\s/.-]+(\d{4})\s*$/.exec(text);
  if (!m) return false;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}
