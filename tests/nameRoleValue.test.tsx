import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, spoken } from '../src/labs/announce';
import {
  CONTROLS,
  NAMES,
  NRV_START,
  STATES,
  exposure,
  nrvVerdict,
  saidFor,
  type Nrv,
} from '../src/labs/nameRoleValue';
import { NrvMock } from '../src/labs/NameRoleValueLab';
import { nrvFromSearch, searchFromNrv } from '../src/labs/nrvQuery';
import { parseMarkup } from './markup';

/**
 * The 4.1.2 flagship lab (#42). The log lines are what a screen reader says for each mock, read
 * from the mock's own markup; expected lines are written out by hand.
 */

const logOf = (nrv: Nrv) =>
  announce(parseMarkup(renderToStaticMarkup(<NrvMock nrv={nrv} labelId="l" />)));

describe('the mock, as announced', () => {
  it('starts as a div that says only its visible text', () => {
    expect(logOf(NRV_START).map(spoken)).toEqual(['Email notifications']);
    expect(nrvVerdict(NRV_START)).toEqual({ criterion: '4.1.2', passes: false });
  });

  it('a switch with a role and a state but no name', () => {
    const nrv: Nrv = { control: 'switch', name: 'none', state: 'aria-checked', on: true };
    expect(logOf(nrv).map(spoken)).toEqual(['switch, on', 'Email notifications']);
    expect(exposure(logOf(nrv))).toEqual({ role: true, name: false, state: true });
  });

  it('a named switch with aria-checked passes', () => {
    const nrv: Nrv = { control: 'switch', name: 'aria-label', state: 'aria-checked', on: true };
    expect(logOf(nrv).map(spoken)).toEqual(['Email notifications, switch, on', 'Email notifications']);
    expect(nrvVerdict(nrv).passes).toBe(true);
  });

  it('a native button named by its content, with aria-pressed, turned off', () => {
    const nrv: Nrv = { control: 'button', name: 'content', state: 'aria-pressed', on: false };
    expect(logOf(nrv).map(spoken)).toEqual(['Email notifications, toggle button, not pressed']);
    expect(nrvVerdict(nrv).passes).toBe(true);
  });

  it('a role="button" labelled by its text, with a state buttons do not have', () => {
    const nrv: Nrv = { control: 'role-button', name: 'labelledby', state: 'aria-checked', on: true };
    expect(logOf(nrv).map(spoken)).toEqual(['Email notifications, button', 'Email notifications']);
    expect(nrvVerdict(nrv).passes).toBe(false);
  });

  it('agrees with the log in every combination', () => {
    for (const control of CONTROLS.map((c) => c.value)) {
      for (const name of NAMES.map((n) => n.value)) {
        for (const state of STATES.map((s) => s.value)) {
          for (const on of [true, false]) {
            const nrv = { control, name, state, on };
            const e = exposure(logOf(nrv));
            expect(nrvVerdict(nrv).passes, JSON.stringify(nrv)).toBe(e.role && e.name && e.state);
          }
        }
      }
    }
  });
});

describe('what the live region says', () => {
  it('reads the log, then what is missing or that all three are exposed', () => {
    expect(saidFor(logOf(NRV_START))).toBe(
      'Screen reader says: Email notifications. Missing role, name and state.',
    );
    expect(
      saidFor(logOf({ control: 'switch', name: 'none', state: 'aria-checked', on: true })),
    ).toBe('Screen reader says: switch, on; Email notifications. Missing name.');
    expect(
      saidFor(logOf({ control: 'switch', name: 'aria-label', state: 'aria-checked', on: true })),
    ).toBe(
      'Screen reader says: Email notifications, switch, on; Email notifications. Role, name and state all exposed.',
    );
  });
});

describe('the URL', () => {
  it('writes nothing for the starting state', () => {
    expect(searchFromNrv(NRV_START)).toBe('');
  });

  it('round-trips a state', () => {
    const nrv: Nrv = { control: 'switch', name: 'labelledby', state: 'aria-checked', on: false };
    expect(searchFromNrv(nrv)).toBe('?el=switch&name=labelledby&state=aria-checked&on=0');
    expect(nrvFromSearch('?el=switch&name=labelledby&state=aria-checked&on=0')).toEqual(nrv);
  });

  it('ignores what it does not know, and returns null when nothing is asked for', () => {
    expect(nrvFromSearch('')).toBeNull();
    expect(nrvFromSearch('?p=2')).toBeNull();
    expect(nrvFromSearch('?el=span&name=aria-label')).toEqual({ ...NRV_START, name: 'aria-label' });
  });
});
