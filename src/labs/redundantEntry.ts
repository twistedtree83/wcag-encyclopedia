/**
 * The 3.3.7 lab's model (#60): a three-step mock checkout. The reader steps through it and
 * chooses what the billing step does with the delivery address typed at step 1: ask for it
 * again, carry it forward, or offer it for reuse with one tick.
 *
 * The verdict judges the checkout's design, so it holds at every step, not only at billing.
 */

import type { Verdict } from './LabShell';

export type Reuse = 'ask' | 'carry' | 'offer';

export type RedundantEntry = {
  readonly reuse: Reuse;
  /** The step on screen, from 0. */
  readonly step: number;
};

export const RE_START: RedundantEntry = { reuse: 'ask', step: 0 };

/** The address the reader typed at the first step. */
export const RE_ADDRESS = '12 Cotton Row, Leeds';

export const RE_STEPS = ['Delivery address', 'Payment', 'Billing address'] as const;

export const REUSE: readonly { readonly value: Reuse; readonly label: string }[] = [
  { value: 'ask', label: 'Asked for again' },
  { value: 'carry', label: 'Carried forward' },
  { value: 'offer', label: 'Offered for reuse' },
];

const PHRASE: Readonly<Record<Reuse, string>> = {
  ask: 'asked for again',
  carry: 'carried forward',
  offer: 'offered for reuse',
};

const AT_BILLING: Readonly<Record<Reuse, string>> = {
  ask: `${RE_ADDRESS.length} characters to type a second time.`,
  carry: 'Nothing to type again.',
  offer: 'One tick, nothing to type again.',
};

export function reVerdict({ reuse }: RedundantEntry): Verdict {
  return { criterion: '3.3.7', passes: reuse !== 'ask' };
}

/** Where the reader is, and what billing does with the address: the readout, and what is said. */
export function reOnScreen({ reuse, step }: RedundantEntry): string {
  const where = `Step ${step + 1} of ${RE_STEPS.length}: ${RE_STEPS[step]}`;
  return step === RE_STEPS.length - 1
    ? `${where}, ${PHRASE[reuse]}. ${AT_BILLING[reuse]}`
    : `${where}. At billing, the address is ${PHRASE[reuse]}.`;
}
