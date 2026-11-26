/**
 * The 4.1.2 page keeps its flagship lab's state in the URL, so a reader can share what they set:
 *
 *   ?el=div|button|role-button|switch       the control's element
 *   ?name=none|content|aria-label|labelledby where its name comes from
 *   ?state=none|aria-pressed|aria-checked    the attribute that exposes its state
 *   ?on=1|0                                  whether it is switched on
 *
 * The starting state writes no query. Anything unknown is ignored rather than rejected, as the
 * colour check's `pairQuery.ts` does: a bad link still opens the page.
 */

import { CONTROLS, NAMES, NRV_START, STATES, type Nrv } from './nameRoleValue';

const known = <T extends string>(options: readonly { value: T }[], v: string | null): T | null =>
  options.find((o) => o.value === v)?.value ?? null;

/** The search string for a state, with its leading `?`, or '' for the starting state. */
export function searchFromNrv(nrv: Nrv): string {
  const { control, name, state, on } = nrv;
  const start = NRV_START;
  if (control === start.control && name === start.name && state === start.state && on === start.on) {
    return '';
  }
  return `?el=${control}&name=${name}&state=${state}&on=${on ? 1 : 0}`;
}

/** The state a search string asks for, or `null` when it asks for nothing this lab knows. */
export function nrvFromSearch(search: string): Nrv | null {
  const params = new URLSearchParams(search);
  const control = known(CONTROLS, params.get('el'));
  const name = known(NAMES, params.get('name'));
  const state = known(STATES, params.get('state'));
  const onParam = params.get('on');
  const on = onParam === '1' ? true : onParam === '0' ? false : null;
  if (control === null && name === null && state === null && on === null) return null;
  return {
    control: control ?? NRV_START.control,
    name: name ?? NRV_START.name,
    state: state ?? NRV_START.state,
    on: on ?? NRV_START.on,
  };
}
