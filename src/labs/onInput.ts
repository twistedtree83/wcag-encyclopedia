/**
 * The 3.2.2 lab's model (#59): a depicted checkout page with a name already typed and a country
 * select. The reader decides whether changing the country goes to that country's page by itself
 * or waits for a Go button, then changes it. Every page change happens inside the mock.
 *
 * The verdict judges the design, so it holds before the first change too.
 */

import type { Verdict } from './LabShell';

export type WhenChanged = 'auto' | 'go';
export type Country = 'uk' | 'fr';

export type OnInput = {
  readonly when: WhenChanged;
  /** The country showing in the select. */
  readonly chosen: Country;
  /** The country whose checkout page the mock is on. */
  readonly page: Country;
  /** Whether the name the reader typed is still in the form. */
  readonly kept: boolean;
};

export const OI_START: OnInput = { when: 'auto', chosen: 'uk', page: 'uk', kept: true };

/** The name already typed into the mock form. */
export const OI_NAME = 'Ada Lovelace';

export const COUNTRY: Readonly<Record<Country, string>> = { uk: 'United Kingdom', fr: 'France' };
export const ADDRESS: Readonly<Record<Country, string>> = {
  uk: 'shop.example/uk/checkout',
  fr: 'shop.example/fr/checkout',
};

export const WHEN: readonly { readonly value: WhenChanged; readonly label: string }[] = [
  { value: 'auto', label: 'Goes to its page straight away' },
  { value: 'go', label: 'Waits for the Go button' },
];

export const COUNTRIES: readonly { readonly value: Country; readonly label: string }[] = [
  { value: 'uk', label: COUNTRY.uk },
  { value: 'fr', label: COUNTRY.fr },
];

/** A change, and what the live region says about it. */
export type Step = { readonly o: OnInput; readonly said: string };

export function oiVerdict({ when }: OnInput): Verdict {
  return { criterion: '3.2.2', passes: when === 'go' };
}

export function oiWhen(o: OnInput, when: WhenChanged): Step {
  return {
    o: { ...o, when },
    said:
      when === 'go'
        ? 'Changing the country now waits for the Go button.'
        : 'Changing the country now goes to its page by itself.',
  };
}

/** The reader picks a country in the select. */
export function oiChoose(o: OnInput, chosen: Country): Step {
  if (o.when === 'go') {
    return {
      o: { ...o, chosen },
      said: `${COUNTRY[chosen]} chosen. Nothing else changed. Press Go when you are ready.`,
    };
  }
  return {
    o: { ...o, chosen, page: chosen, kept: false },
    said:
      `${COUNTRY[chosen]} chosen. The page changed to ${ADDRESS[chosen]} by itself, ` +
      'and the name you typed is gone.',
  };
}

/** The reader presses Go: the page follows the select, and the form comes with it. */
export function oiGo(o: OnInput): Step {
  return {
    o: { ...o, page: o.chosen },
    said: `You pressed Go. The page changed to ${ADDRESS[o.chosen]}, as you asked.`,
  };
}
