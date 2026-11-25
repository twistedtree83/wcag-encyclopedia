/**
 * The 3.3.4 lab's model (#59): a depicted payment to Sam Lee, typed as £2,500.00 when it should
 * have been £250.00. The reader picks the safeguard (none, a review step with a way back, or an
 * undo) and pays. Any one safeguard meets the criterion, so the verdict judges the choice and
 * holds before the payment too.
 */

import type { Verdict } from './LabShell';

export type Guard = 'none' | 'review' | 'undo';
export type PayStage = 'form' | 'review' | 'paid' | 'undone';

export type ErrorPrevention = {
  readonly guard: Guard;
  readonly stage: PayStage;
  /** The amount in the form: the slip of an extra zero, or the corrected one. */
  readonly amount: 'wrong' | 'right';
};

export const EP_START: ErrorPrevention = { guard: 'none', stage: 'form', amount: 'wrong' };

export const PAYEE = 'Sam Lee';
export const AMOUNT: Readonly<Record<ErrorPrevention['amount'], string>> = {
  wrong: '£2,500.00',
  right: '£250.00',
};

export const GUARDS: readonly { readonly value: Guard; readonly label: string }[] = [
  { value: 'none', label: 'None: one click pays' },
  { value: 'review', label: 'A review step, with a way back' },
  { value: 'undo', label: 'An undo after paying' },
];

/** A change, and what the live region says about it. */
export type Step = { readonly e: ErrorPrevention; readonly said: string };

const GUARD_SAID: Readonly<Record<Guard, string>> = {
  none: 'Paying now happens in one click, with no way back.',
  review: 'Paying now shows a review step first, with a way back to correct it.',
  undo: 'Paying now goes at once, with an undo for 30 minutes.',
};

export function epVerdict({ guard }: ErrorPrevention): Verdict {
  return { criterion: '3.3.4', passes: guard !== 'none' };
}

/** The reader changes the safeguard: the payment starts again from the form. */
export function epGuard(e: ErrorPrevention, guard: Guard): Step {
  return { e: { ...e, guard, stage: 'form' }, said: GUARD_SAID[guard] };
}

/** The reader presses Pay on the form. */
export function epPay(e: ErrorPrevention): Step {
  const sum = AMOUNT[e.amount];
  if (e.guard === 'review') {
    return {
      e: { ...e, stage: 'review' },
      said: `Check before paying: ${sum} to ${PAYEE}. Go back to correct it, or confirm it.`,
    };
  }
  return {
    e: { ...e, stage: 'paid' },
    said:
      e.guard === 'undo'
        ? `Paid ${sum} to ${PAYEE}. You can undo it for 30 minutes.`
        : `Paid ${sum} to ${PAYEE}. There is no way to take it back.`,
  };
}

/** From the review step, or after an undo: back to the form, and the amount corrected. */
export function epBack(e: ErrorPrevention): Step {
  return {
    e: { ...e, stage: 'form', amount: 'right' },
    said: `Back on the form, with the amount corrected to ${AMOUNT.right}.`,
  };
}

/** The reader confirms on the review step. */
export function epConfirm(e: ErrorPrevention): Step {
  return { e: { ...e, stage: 'paid' }, said: `Paid ${AMOUNT[e.amount]} to ${PAYEE}.` };
}

/** The reader undoes a payment that has gone. */
export function epUndo(e: ErrorPrevention): Step {
  return {
    e: { ...e, stage: 'undone' },
    said: `Payment undone. The ${AMOUNT[e.amount]} is back in your account.`,
  };
}
