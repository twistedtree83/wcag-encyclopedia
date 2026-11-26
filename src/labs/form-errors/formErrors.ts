/**
 * The 3.3.1 lab's model (#52): a one-field form whose email is rejected on submit. The reader
 * chooses how the error is shown, a red border alone or text tied to the field, submits, and the
 * announcement log (read from the mock's markup) says what a screen reader hears.
 *
 * The verdict judges how the form shows its errors, so it holds before the first submit too.
 */

import { spoken, type Announcement } from '../shared/announce';
import type { Verdict } from '../shared/LabShell';

export type ErrorShown = 'border' | 'text';

export type FormErrors = {
  readonly shown: ErrorShown;
  /** Whether the reader has submitted the form, so the error is on screen. */
  readonly submitted: boolean;
};

export const FE_START: FormErrors = { shown: 'border', submitted: false };

/** The rejected entry, and the message that says why. */
export const FE_VALUE = 'ada@example';
export const FE_ERROR = 'Enter an address that includes a domain';

export const SHOWN: readonly { readonly value: ErrorShown; readonly label: string }[] = [
  { value: 'border', label: 'A red border only' },
  { value: 'text', label: 'Text tied to the field' },
];

export function feVerdict({ shown }: FormErrors): Verdict {
  return { criterion: '3.3.1', passes: shown === 'text' };
}

/** The live region's sentence after a change: the log, then what the reader can't hear. */
export function feSaid({ shown, submitted }: FormErrors, lines: readonly Announcement[]): string {
  const said = `Screen reader says: ${lines.map(spoken).join('; ')}.`;
  if (!submitted) return `${said} Not submitted yet.`;
  return shown === 'text'
    ? `${said} The error is in text, tied to the field.`
    : `${said} The field turned red, and nothing says so in text.`;
}
