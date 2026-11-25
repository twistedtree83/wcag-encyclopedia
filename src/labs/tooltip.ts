/**
 * The 1.4.13 lab's model (#47): a tooltip on the words "incl. duties". The reader sets its three
 * behaviours, the three conditions of 1.4.13, then works it with a simulated pointer and keys:
 *
 *   dismissable  Escape closes it without moving the pointer
 *   hoverable    the pointer can move off the word into the tooltip and it stays open
 *   persistent   it stays until dismissed, the pointer leaves, or it stops being relevant; it does
 *                not close itself on a timer
 *
 * It passes only with all three.
 */

import type { Verdict } from './LabShell';

export type TipConditions = {
  readonly dismissable: boolean;
  readonly hoverable: boolean;
  readonly persistent: boolean;
};

export type Condition = keyof TipConditions;
/** Where the simulated pointer is: away from the text, on the word, or in the tooltip. */
export type Pointer = 'away' | 'word' | 'tip';
/** What the reader can do to it: hover the word, move into the tooltip, wait, press Escape. */
export type TipAction = 'hover' | 'into' | 'wait' | 'escape';

export type TipLab = {
  readonly conditions: TipConditions;
  readonly pointer: Pointer;
  readonly open: boolean;
  /** The sentence for the last thing the reader did; null after a change of conditions. */
  readonly did: string | null;
};

/** Each condition's checkbox, in order, and what failing it means. */
export const CONDITIONS: readonly {
  readonly condition: Condition;
  readonly label: string;
  readonly fails: string;
}[] = [
  { condition: 'dismissable', label: 'Escape closes it', fails: 'Escape does not close it' },
  {
    condition: 'hoverable',
    label: 'The pointer can move into it',
    fails: 'it vanishes when the pointer moves into it',
  },
  { condition: 'persistent', label: 'It stays until dismissed', fails: 'it closes on a timer' },
];

export const TIP_TEXT = 'Duties are estimated at checkout and charged by your carrier on delivery.';

/** The lab with these conditions: the mock reloads, closed, the pointer away. */
export function withConditions(conditions: TipConditions): TipLab {
  return { conditions, pointer: 'away', open: false, did: null };
}

/** The tooltip most sites ship: none of the three. */
export const TIP_START: TipLab = withConditions({
  dismissable: false,
  hoverable: false,
  persistent: false,
});

const CLOSED = 'There is no tooltip open.';

export function tipAct(s: TipLab, action: TipAction): TipLab {
  if (action === 'hover') return { ...s, pointer: 'word', open: true, did: 'The tooltip opens.' };
  if (!s.open) return { ...s, did: CLOSED };
  const { dismissable, hoverable, persistent } = s.conditions;
  switch (action) {
    case 'into':
      return hoverable
        ? { ...s, pointer: 'tip', did: 'The pointer is in the tooltip, and it stays open.' }
        : {
            ...s,
            pointer: 'tip',
            open: false,
            did: 'The tooltip vanished as the pointer left the word.',
          };
    case 'wait':
      return persistent
        ? { ...s, did: 'Five seconds later the tooltip is still open.' }
        : { ...s, open: false, did: 'Five seconds later the tooltip closed by itself.' };
    case 'escape':
      return dismissable
        ? { ...s, open: false, did: 'Escape closed the tooltip, and the pointer did not move.' }
        : { ...s, did: 'Escape did nothing. The tooltip still covers the text.' };
  }
}

export function tipVerdict(s: TipLab): Verdict {
  const { dismissable, hoverable, persistent } = s.conditions;
  return { criterion: '1.4.13', passes: dismissable && hoverable && persistent };
}

/** The live region's sentence: what the last action did, or what the conditions add up to. */
export function tipSaid(s: TipLab): string {
  if (s.did !== null) return s.did;
  const missing = CONDITIONS.filter((r) => !s.conditions[r.condition]).map((r) => r.fails);
  return missing.length === 0
    ? 'Escape closes it, the pointer can move into it, and it stays until dismissed.'
    : `Fails: ${missing.join(', ')}.`;
}
