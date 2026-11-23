/**
 * The 4.1.2 flagship lab's model (#42): a mock "Email notifications" toggle whose element, name
 * and state the reader edits. The announcement log reads the mock's markup; the verdict passes
 * once the log exposes a role, a name and a state for the control.
 *
 * `nrvVerdict` works from the model so the page can pre-render it; the unit test holds it equal
 * to the log's own `exposure` in every combination, so the two cannot drift.
 */

import { spoken, type Announcement } from './announce';
import type { Verdict } from './LabShell';

export type Control = 'div' | 'button' | 'role-button' | 'switch';
export type NameSource = 'none' | 'content' | 'aria-label' | 'labelledby';
export type StateAttr = 'none' | 'aria-pressed' | 'aria-checked';

export type Nrv = {
  readonly control: Control;
  readonly name: NameSource;
  readonly state: StateAttr;
  /** Whether the toggle is switched on. */
  readonly on: boolean;
};

/** The visible text, and the name the control should have. */
export const LABEL = 'Email notifications';

/** A plain div with a click handler: nothing exposed. */
export const NRV_START: Nrv = { control: 'div', name: 'none', state: 'none', on: true };

type Option<T> = { readonly value: T; readonly label: string };

export const CONTROLS: readonly Option<Control>[] = [
  { value: 'div', label: 'A plain div' },
  { value: 'button', label: 'A native <button>' },
  { value: 'role-button', label: 'A div with role="button"' },
  { value: 'switch', label: 'A div with role="switch"' },
];

export const NAMES: readonly Option<NameSource>[] = [
  { value: 'none', label: 'None: the text sits beside it' },
  { value: 'content', label: 'The text inside the control' },
  { value: 'aria-label', label: 'aria-label' },
  { value: 'labelledby', label: 'aria-labelledby the text' },
];

export const STATES: readonly Option<StateAttr>[] = [
  { value: 'none', label: 'None' },
  { value: 'aria-pressed', label: 'aria-pressed' },
  { value: 'aria-checked', label: 'aria-checked' },
];

/** The role words a toggle can be announced with, and the states that say its value. */
const TOGGLE_ROLES = new Set(['button', 'toggle button', 'switch']);
const VALUE_STATES = new Set(['pressed', 'not pressed', 'on', 'off']);

export type Exposure = { readonly role: boolean; readonly name: boolean; readonly state: boolean };

/** What the log exposes for the control: its role, its name, its state. */
export function exposure(lines: readonly Announcement[]): Exposure {
  const line = lines.find((l) => l.role !== null && TOGGLE_ROLES.has(l.role));
  return {
    role: line !== undefined,
    name: Boolean(line?.name),
    state: Boolean(line?.states.some((s) => VALUE_STATES.has(s))),
  };
}

/** The verdict for a model, without rendering it. */
export function nrvVerdict({ control, name, state }: Nrv): Verdict {
  const role = control !== 'div';
  const named = role && name !== 'none';
  const stated =
    (state === 'aria-pressed' && (control === 'button' || control === 'role-button')) ||
    (state === 'aria-checked' && control === 'switch');
  return { criterion: '4.1.2', passes: role && named && stated };
}

/** The live region's sentence after a change: the log, then what is missing. */
export function saidFor(lines: readonly Announcement[]): string {
  const said = `Screen reader says: ${lines.map(spoken).join('; ')}.`;
  const e = exposure(lines);
  const missing = (['role', 'name', 'state'] as const).filter((k) => !(e.role && e[k]));
  if (missing.length === 0) return `${said} Role, name and state all exposed.`;
  const list =
    missing.length === 1
      ? missing[0]
      : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
  return `${said} Missing ${list}.`;
}

/** The control's opening tag as the mock renders it, for the readout. */
export function markupOf({ control, name, state, on }: Nrv, labelId = 'label'): string {
  const attrs: string[] = [];
  if (control === 'role-button') attrs.push('role="button"');
  if (control === 'switch') attrs.push('role="switch"');
  if (state !== 'none') attrs.push(`${state}="${on}"`);
  if (name === 'aria-label') attrs.push(`aria-label="${LABEL}"`);
  if (name === 'labelledby') attrs.push(`aria-labelledby="${labelId}"`);
  const tag = control === 'button' ? 'button' : 'div';
  const inside = name === 'content' ? LABEL : '…';
  return `<${[tag, ...attrs].join(' ')}>${inside}</${tag}>`;
}
