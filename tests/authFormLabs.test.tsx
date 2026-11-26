import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ComponentType } from 'react';
import { announce, spoken } from '../src/labs/shared/announce';
import { RE_START, reOnScreen, reVerdict, type RedundantEntry } from '../src/labs/redundant-entry/redundantEntry';
import { AA_START, aaOnScreen, aaVerdict, type AccessibleAuth } from '../src/labs/accessible-auth/accessibleAuth';
import { criterion } from '../src/criteria/corpus';
import { parseMarkup } from './markup';

/**
 * The 3.3.7 and 3.3.8 labs and live examples (#60). Expected sentences are written out by hand;
 * the address is "12 Cotton Row, Leeds", which is 20 characters counted on the fingers.
 */

describe('3.3.7: the checkout carries the address forward, or asks for it again', () => {
  it('starts at the first step, with the address asked for again at billing, which fails', () => {
    expect(reVerdict(RE_START)).toEqual({ criterion: '3.3.7', passes: false });
    expect(reOnScreen(RE_START)).toBe(
      'Step 1 of 3: Delivery address. At billing, the address is asked for again.',
    );
  });

  it('asked for again at billing: all 20 characters are typed a second time', () => {
    const r: RedundantEntry = { reuse: 'ask', step: 2 };
    expect(reOnScreen(r)).toBe(
      'Step 3 of 3: Billing address, asked for again. 20 characters to type a second time.',
    );
    expect(reVerdict(r).passes).toBe(false);
  });

  it('carried forward or offered for reuse: nothing is typed again, and it passes', () => {
    const carry: RedundantEntry = { reuse: 'carry', step: 2 };
    const offer: RedundantEntry = { reuse: 'offer', step: 2 };
    expect(reOnScreen(carry)).toBe(
      'Step 3 of 3: Billing address, carried forward. Nothing to type again.',
    );
    expect(reOnScreen(offer)).toBe(
      'Step 3 of 3: Billing address, offered for reuse. One tick, nothing to type again.',
    );
    expect(reVerdict(carry).passes).toBe(true);
    expect(reVerdict(offer).passes).toBe(true);
    expect(reOnScreen({ reuse: 'offer', step: 1 })).toBe(
      'Step 2 of 3: Payment. At billing, the address is offered for reuse.',
    );
  });
});

describe('3.3.8: what signing in asks of the reader', () => {
  it('starts with a password that blocks paste, which fails', () => {
    expect(aaVerdict(AA_START)).toEqual({ criterion: '3.3.8', passes: false });
    expect(aaOnScreen(AA_START)).toBe(
      'Type the password from memory. Paste is blocked, so a password manager cannot fill it.',
    );
  });

  it('a password manager fills the field only where paste is allowed', () => {
    const tries: readonly [AccessibleAuth['method'], string, boolean][] = [
      ['puzzle', 'Nothing to fill: a password manager cannot solve the puzzle.', false],
      ['blocked', 'Paste blocked: the field is still empty.', false],
      ['paste', 'Filled from the password manager: 16 characters, none typed.', true],
      ['passkey', 'Nothing to fill or type: the device confirms the passkey.', true],
    ];
    for (const [method, outcome, passes] of tries) {
      const a: AccessibleAuth = { method, filled: true };
      expect(aaOnScreen(a)).toBe(outcome);
      expect(aaVerdict(a).passes).toBe(passes);
    }
  });

  it('says what each sign-in asks before anything is filled', () => {
    expect(aaOnScreen({ method: 'puzzle', filled: false })).toBe(
      'Type the letters in the picture. A test of perception and memory, with no way around it.',
    );
    expect(aaOnScreen({ method: 'paste', filled: false })).toBe(
      'Paste or fill the password. A password manager remembers it for the reader.',
    );
    expect(aaOnScreen({ method: 'passkey', filled: false })).toBe(
      'Sign in with a passkey or an emailed link. Nothing to remember or transcribe.',
    );
  });
});

/** What the live example says when read aloud, from its own markup. */
const readAloud = (Example: ComponentType) =>
  announce(parseMarkup(renderToStaticMarkup(<Example />))).map(spoken);

describe('the live examples, read aloud', () => {
  it('3.3.7: the broken billing step asks for the address again, in an empty field', () => {
    const lines = readAloud(criterion('3.3.7')!.fail.live!.Example);
    expect(lines).toContain('Billing address, edit text');
  });

  it('3.3.7: the fixed billing step offers the delivery address, already ticked', () => {
    const lines = readAloud(criterion('3.3.7')!.pass.live!.Example);
    expect(lines).toContain('Same as delivery: 12 Cotton Row, Leeds, checkbox, checked');
    expect(lines).not.toContain('Billing address, edit text');
  });

  it('3.3.8: the broken sign-in blocks paste and adds a picture puzzle', () => {
    const lines = readAloud(criterion('3.3.8')!.fail.live!.Example);
    expect(lines).toContain('Paste is turned off for your security.');
    expect(lines).toContain('Security check, image');
  });

  it('3.3.8: the fixed sign-in takes a pasted code, or a route that tests nothing', () => {
    const lines = readAloud(criterion('3.3.8')!.pass.live!.Example);
    expect(lines).toContain('Use a passkey instead, button');
    expect(lines).toContain('Email me a sign-in link, button');
  });
});
