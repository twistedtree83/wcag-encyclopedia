/**
 * The 3.2.1 lab's model (#47): a mock checkout form with Name, Email and Send. The reader picks
 * what focusing Email does (nothing, send the form, or open another page) and presses a simulated
 * Tab through the mock. The change of context happens inside the mock only: the real page never
 * moves, and the reader's own focus stays on the lab's controls.
 *
 * Only "nothing" passes: focus alone must not change the context. Pressing Send is an action the
 * reader chose, so sending then is fine; it is focus doing it that fails.
 */

import type { Verdict } from './LabShell';

export type FocusAct = 'nothing' | 'submit' | 'navigate';
/** The mock's page: the form, the "sent" page, or another page altogether. */
export type MockPage = 'form' | 'sent' | 'elsewhere';

export type FocusLab = {
  readonly act: FocusAct;
  readonly page: MockPage;
  /** The stop simulated focus is on (an index into STOPS), or -1 when focus is nowhere. */
  readonly at: number;
  /**
   * What happened last: the reader picked a setting (null), Tab moved focus ('tab'), Tab landed
   * on Email and the page changed ('moved'), or Tab found nothing on the new page ('stuck').
   */
  readonly last: 'tab' | 'moved' | 'stuck' | null;
};

/** The form's Tab stops, in order. Email is the one whose focus the reader sets. */
export const STOPS = ['Name', 'Email', 'Send'] as const;
const EMAIL = 1;

export const ADDRESS: Readonly<Record<MockPage, string>> = {
  form: 'shop.example/checkout',
  sent: 'shop.example/checkout/sent',
  elsewhere: 'shop.example/offers',
};

export const ACTS: readonly { readonly value: FocusAct; readonly label: string }[] = [
  { value: 'nothing', label: 'Nothing' },
  { value: 'submit', label: 'Sends the form' },
  { value: 'navigate', label: 'Opens another page' },
];

/** The lab after the reader picks a setting: the mock reloads on its form, focus nowhere. */
export function withAct(act: FocusAct): FocusLab {
  return { act, page: 'form', at: -1, last: null };
}

/** A form any keyboard user would trip over: tabbing to Email sends it half-filled. */
export const FOCUS_START: FocusLab = withAct('submit');

/** One simulated Tab. On the form it moves to the next stop, and Email may change the page. */
export function pressTab(s: FocusLab): FocusLab {
  if (s.page !== 'form') return { ...s, at: -1, last: 'stuck' };
  const at = (s.at + 1) % STOPS.length;
  if (at === EMAIL && s.act === 'submit') return { ...s, page: 'sent', at: -1, last: 'moved' };
  if (at === EMAIL && s.act === 'navigate') {
    return { ...s, page: 'elsewhere', at: -1, last: 'moved' };
  }
  return { ...s, at, last: 'tab' };
}

export function focusVerdict(s: FocusLab): Verdict {
  return { criterion: '3.2.1', passes: s.act === 'nothing' };
}

/** The live region's sentence: what the setting does, or what the last Tab did. */
export function focusSaid(s: FocusLab): string {
  switch (s.last) {
    case null:
      if (s.act === 'nothing') return 'Focusing Email does nothing. Only Send sends.';
      return s.act === 'submit'
        ? 'Focusing Email sends the form.'
        : 'Focusing Email opens another page.';
    case 'tab':
      return `Focus on ${STOPS[s.at]}.`;
    case 'moved':
      return s.page === 'sent'
        ? 'Focus on Email. The form was sent, with Email still empty.'
        : `Focus on Email. The page changed to ${ADDRESS.elsewhere}.`;
    case 'stuck':
      return 'This page has nothing to focus. Press Reset to start again.';
  }
}
