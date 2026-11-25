/**
 * The 2.1.1 lab's model (#45): one "Add to basket" control, built three ways, and simulated
 * Tab, Enter and Space on it. A click-only div is no Tab stop. A div with tabindex is reached,
 * but no key presses it unless someone writes the handlers. A real button gets both for free.
 */

import type { Verdict } from './LabShell';

export type Control = 'div' | 'focusable' | 'button';
export type KbKey = 'tab' | 'enter' | 'space';

export const CONTROLS: readonly { readonly value: Control; readonly label: string }[] = [
  { value: 'div', label: 'A click-only div' },
  { value: 'focusable', label: 'A div with tabindex="0"' },
  { value: 'button', label: 'A real button' },
];

/** The control's markup, as the lab shows it. */
export const MARKUP: Readonly<Record<Control, string>> = {
  div: '<div class="btn" onclick="add()">Add to basket</div>',
  focusable: '<div class="btn" tabindex="0" onclick="add()">Add to basket</div>',
  button: '<button type="button" onclick="add()">Add to basket</button>',
};

export type Kb = {
  readonly control: Control;
  /** Whether simulated focus is on the control. */
  readonly focused: boolean;
  readonly basket: number;
  /** What the last simulated key did, or null before one was pressed. */
  readonly last: string | null;
};

export const KB_START: Kb = { control: 'div', focused: false, basket: 0, last: null };

const reachable = (c: Control) => c !== 'div';
const pressable = (c: Control) => c === 'button';

export function kbVerdict(control: Control): Verdict {
  return { criterion: '2.1.1', passes: reachable(control) && pressable(control) };
}

/** A new control: focus starts outside it again; the basket keeps what was added. */
export function kbChoose(s: Kb, control: Control): Kb {
  return { ...s, control, focused: false, last: null };
}

const items = (n: number) => `${n} item${n === 1 ? '' : 's'}`;

export function kbPress(s: Kb, key: KbKey): Kb {
  if (key === 'tab') {
    return reachable(s.control)
      ? { ...s, focused: true, last: 'Tab: focus is on Add to basket.' }
      : { ...s, focused: false, last: 'Tab: focus skipped it. It is not a Tab stop.' };
  }
  const name = key === 'enter' ? 'Enter' : 'Space';
  if (!s.focused) return { ...s, last: `${name}: nothing has focus, so nothing happened.` };
  if (!pressable(s.control)) return { ...s, last: `${name}: nothing happened.` };
  const basket = s.basket + 1;
  return { ...s, basket, last: `${name}: added. Basket: ${items(basket)}.` };
}

/** The live region's sentence after the reader picks a control. */
export function kbSaid(control: Control): string {
  if (control === 'div') return 'A click-only div. Tab skips it, and Enter and Space do nothing.';
  if (control === 'focusable') {
    return 'A div with tabindex. Tab reaches it, but Enter and Space do nothing.';
  }
  return 'A real button. Tab reaches it, and Enter and Space press it.';
}

export function basketText(n: number): string {
  return `Basket: ${items(n)}`;
}
