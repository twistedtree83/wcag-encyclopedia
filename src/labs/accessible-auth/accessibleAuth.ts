/**
 * The 3.3.8 lab's model (#60): a mock sign-in. The reader chooses what it asks of them, a picture
 * puzzle, a password that blocks paste, a password that allows it, or a passkey or emailed link,
 * then tries to fill it from a password manager.
 *
 * The mock is drawn, never a real field: it asks for no credential and nothing is typed into it.
 */

import type { Verdict } from '../shared/LabShell';

export type Method = 'puzzle' | 'blocked' | 'paste' | 'passkey';

export type AccessibleAuth = {
  readonly method: Method;
  /** Whether the reader has tried the password manager since choosing the method. */
  readonly filled: boolean;
};

export const AA_START: AccessibleAuth = { method: 'blocked', filled: false };

/** How long the password manager's password is, drawn as dots. */
export const AA_LENGTH = 16;

export const METHODS: readonly { readonly value: Method; readonly label: string }[] = [
  { value: 'puzzle', label: 'A picture puzzle' },
  { value: 'blocked', label: 'A password, paste blocked' },
  { value: 'paste', label: 'A password, paste allowed' },
  { value: 'passkey', label: 'A passkey or emailed link' },
];

const ASKS: Readonly<Record<Method, string>> = {
  puzzle: 'Type the letters in the picture. A test of perception and memory, with no way around it.',
  blocked: 'Type the password from memory. Paste is blocked, so a password manager cannot fill it.',
  paste: 'Paste or fill the password. A password manager remembers it for the reader.',
  passkey: 'Sign in with a passkey or an emailed link. Nothing to remember or transcribe.',
};

const FILLED: Readonly<Record<Method, string>> = {
  puzzle: 'Nothing to fill: a password manager cannot solve the puzzle.',
  blocked: 'Paste blocked: the field is still empty.',
  paste: `Filled from the password manager: ${AA_LENGTH} characters, none typed.`,
  passkey: 'Nothing to fill or type: the device confirms the passkey.',
};

export function aaVerdict({ method }: AccessibleAuth): Verdict {
  return { criterion: '3.3.8', passes: method === 'paste' || method === 'passkey' };
}

/** What the sign-in asks, or what the password manager managed: the readout, and what is said. */
export function aaOnScreen({ method, filled }: AccessibleAuth): string {
  return filled ? FILLED[method] : ASKS[method];
}
