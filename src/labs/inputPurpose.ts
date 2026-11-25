/**
 * Identify Input Purpose (#49): which `autocomplete` values name a purpose, a simulated browser
 * autofill, and the 1.3.5 lab's model.
 *
 * PURPOSES is the HTML autofill field names that WCAG's list of input purposes is drawn from. An
 * `autocomplete` value may carry a section, shipping/billing and home/work/mobile before the field
 * name; the field name is the last token. Anything else (an invented "full-name", "on") names no
 * purpose, and a browser silently ignores it.
 */

import type { Verdict } from './LabShell';

const PURPOSES = new Set([
  'name', 'honorific-prefix', 'given-name', 'additional-name', 'family-name', 'honorific-suffix',
  'nickname', 'username', 'new-password', 'current-password', 'one-time-code',
  'organization-title', 'organization', 'street-address', 'address-line1', 'address-line2',
  'address-line3', 'address-level4', 'address-level3', 'address-level2', 'address-level1',
  'country', 'country-name', 'postal-code', 'cc-name', 'cc-given-name', 'cc-additional-name',
  'cc-family-name', 'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type',
  'transaction-currency', 'transaction-amount', 'language', 'bday', 'bday-day', 'bday-month',
  'bday-year', 'sex', 'url', 'photo', 'tel', 'tel-country-code', 'tel-national', 'tel-area-code',
  'tel-local', 'tel-local-prefix', 'tel-local-suffix', 'tel-extension', 'email', 'impp',
]);

/** The purpose an `autocomplete` value names, or `null` when it names none. */
export function purposeOf(autocomplete: string | undefined): string | null {
  const last = (autocomplete ?? '').trim().toLowerCase().split(/\s+/).pop() ?? '';
  return PURPOSES.has(last) ? last : null;
}

/** What the simulated browser has saved for its user, by purpose. */
const SAVED: Readonly<Record<string, string>> = {
  name: 'Ada Lovelace',
  'given-name': 'Ada',
  'family-name': 'Lovelace',
  email: 'ada@example.com',
  tel: '020 7946 0000',
};

/** What a simulated autofill puts in a field with this `autocomplete` value; '' for nothing. */
export function autofillValue(autocomplete: string | undefined): string {
  const purpose = purposeOf(autocomplete);
  return purpose ? (SAVED[purpose] ?? '') : '';
}

/* --- The 1.3.5 lab ------------------------------------------------------------------------- */

export type FieldId = 'name' | 'email' | 'tel';
/** No autocomplete, the right token, or a plausible invented one. */
export type Choice = 'none' | 'right' | 'invented';
export type Purposes = Readonly<Record<FieldId, Choice>>;

export type Field = {
  readonly id: FieldId;
  readonly label: string;
  readonly type: 'text' | 'email' | 'tel';
  readonly right: string;
  readonly invented: string;
};

export const FIELDS: readonly Field[] = [
  { id: 'name', label: 'Full name', type: 'text', right: 'name', invented: 'full-name' },
  { id: 'email', label: 'Email', type: 'email', right: 'email', invented: 'e-mail' },
  { id: 'tel', label: 'Phone', type: 'tel', right: 'tel', invented: 'phone' },
];

export const IP_START: Purposes = { name: 'none', email: 'none', tel: 'none' };

/** The field's `autocomplete` value for a choice, or undefined for none. */
export function tokenFor(field: Field, choice: Choice): string | undefined {
  return choice === 'right' ? field.right : choice === 'invented' ? field.invented : undefined;
}

const filled = (p: Purposes) => FIELDS.filter((f) => autofillValue(tokenFor(f, p[f.id])) !== '');

export function ipVerdict(p: Purposes): Verdict {
  return {
    criterion: '1.3.5',
    passes: FIELDS.every((f) => purposeOf(tokenFor(f, p[f.id])) === f.right),
  };
}

const list = (names: readonly string[]) =>
  names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/** The live region's sentence after a change. */
export function ipSaid(p: Purposes): string {
  const done = filled(p);
  const said = `Autofill filled ${done.length} of ${FIELDS.length} fields.`;
  const missed = FIELDS.filter((f) => !done.includes(f)).map((f) => f.label);
  return missed.length ? `${said} It could not tell what ${list(missed)} are for.` : said;
}
