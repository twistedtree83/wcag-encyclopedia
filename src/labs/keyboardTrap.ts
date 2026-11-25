/**
 * The 2.1.2 lab's model (#45): a newsletter widget drawn inside the mock (Email, Subscribe),
 * followed by a link on the page. The widget traps simulated focus with no way out, traps it
 * with Escape as the documented exit, or doesn't trap it at all.
 *
 * Only simulated focus is ever trapped. The mock is inert, the reader's real focus moves between
 * the lab's own buttons as normal, and `trapLeave` (the lab's labelled escape) always works.
 */

import type { Verdict } from './LabShell';

export type TrapMode = 'trap' | 'exit' | 'free';
/** Where simulated focus is: before the widget, on one of its two stops, or on the next link. */
export type TrapAt = 'before' | 'email' | 'subscribe' | 'after';

export const TRAP_MODES: readonly { readonly value: TrapMode; readonly label: string }[] = [
  { value: 'trap', label: 'Trap focus, no way out' },
  { value: 'exit', label: 'Trap focus, Escape lets it out' },
  { value: 'free', label: 'No trap: Tab moves on' },
];

export type Trap = {
  readonly mode: TrapMode;
  readonly at: TrapAt;
  readonly last: string | null;
};

export const TRAP_START: Trap = { mode: 'trap', at: 'before', last: null };

export function trapVerdict(mode: TrapMode): Verdict {
  return { criterion: '2.1.2', passes: mode !== 'trap' };
}

export function trapChoose(_s: Trap, mode: TrapMode): Trap {
  return { mode, at: 'before', last: null };
}

export function trapPress(s: Trap, key: 'tab' | 'escape'): Trap {
  const inside = s.at === 'email' || s.at === 'subscribe';
  if (key === 'escape') {
    if (inside && s.mode === 'exit') {
      return {
        ...s,
        at: 'after',
        last: 'Escape: the widget let focus go. Focus is on the next link.',
      };
    }
    if (inside && s.mode === 'trap') {
      return { ...s, last: 'Escape: nothing happened. Focus is still trapped.' };
    }
    return { ...s, last: 'Escape: nothing happened.' };
  }
  if (s.at === 'before') return { ...s, at: 'email', last: 'Tab: focus is on the Email field.' };
  if (s.at === 'email') {
    return { ...s, at: 'subscribe', last: 'Tab: focus is on the Subscribe button.' };
  }
  if (s.at === 'subscribe') {
    return s.mode === 'free'
      ? { ...s, at: 'after', last: 'Tab: focus moved on to the next link.' }
      : {
          ...s,
          at: 'email',
          last:
            s.mode === 'trap'
              ? 'Tab: back to the Email field. Focus is trapped.'
              : 'Tab: back to the Email field. Escape lets focus out.',
        };
  }
  return { ...s, last: 'Tab: focus stays on the next link, the end of the page.' };
}

/** The lab's labelled escape: simulated focus goes back before the widget, in every mode. */
export function trapLeave(s: Trap): Trap {
  return { ...s, at: 'before', last: 'Simulated focus is back before the widget.' };
}

export function whereText({ at }: Trap): string {
  if (at === 'email') return 'Email field, inside the widget';
  if (at === 'subscribe') return 'Subscribe button, inside the widget';
  if (at === 'after') return 'the next link, after the widget';
  return 'before the widget';
}

/** The live region's sentence after the reader changes the widget. */
export function trapSaid(mode: TrapMode): string {
  if (mode === 'trap') return 'Traps focus with no way out. Tab cycles Email and Subscribe.';
  if (mode === 'exit') return 'Traps focus, and Escape lets it out.';
  return 'No trap. Tab moves on past the widget.';
}
