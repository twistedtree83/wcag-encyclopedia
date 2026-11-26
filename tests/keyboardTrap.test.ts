import { describe, it, expect } from 'vitest';
import {
  TRAP_START,
  trapChoose,
  trapLeave,
  trapPress,
  trapSaid,
  trapVerdict,
  whereText,
} from '../src/labs/keyboard-trap/keyboardTrap';

/**
 * The 2.1.2 lab's model (#45): a newsletter widget drawn inside the mock, with an Email field
 * and a Subscribe button, then a link after it on the page. The widget traps simulated focus
 * with no way out, traps it with Escape as the exit, or doesn't trap it. The reader's real focus
 * is never involved. Expected sentences are written out by hand.
 */

const tabs = (n: number, s = TRAP_START) => {
  let at = s;
  for (let i = 0; i < n; i++) at = trapPress(at, 'tab');
  return at;
};

describe('verdict', () => {
  it('fails only for the trap with no way out', () => {
    expect(trapVerdict('trap')).toEqual({ criterion: '2.1.2', passes: false });
    expect(trapVerdict('exit').passes).toBe(true);
    expect(trapVerdict('free').passes).toBe(true);
  });
});

describe('Tab and Escape inside the drawn widget', () => {
  it('the trap cycles Email and Subscribe forever, and Escape does nothing', () => {
    expect(whereText(tabs(1))).toBe('Email field, inside the widget');
    expect(whereText(tabs(2))).toBe('Subscribe button, inside the widget');
    const wrapped = tabs(3);
    expect(wrapped.at).toBe('email');
    expect(wrapped.last).toBe('Tab: back to the Email field. Focus is trapped.');
    const esc = trapPress(wrapped, 'escape');
    expect(esc.at).toBe('email');
    expect(esc.last).toBe('Escape: nothing happened. Focus is still trapped.');
  });

  it('with an exit, Tab still loops but Escape lets focus out to the page', () => {
    const s = tabs(3, trapChoose(TRAP_START, 'exit'));
    expect(s.at).toBe('email');
    const out = trapPress(s, 'escape');
    expect(out.at).toBe('after');
    expect(out.last).toBe('Escape: the widget let focus go. Focus is on the next link.');
    expect(whereText(out)).toBe('the next link, after the widget');
  });

  it('without a trap, Tab moves on past the widget to the next link', () => {
    const s = tabs(3, trapChoose(TRAP_START, 'free'));
    expect(s.at).toBe('after');
    expect(s.last).toBe('Tab: focus moved on to the next link.');
  });

  it('nothing is focused before the first Tab', () => {
    expect(whereText(TRAP_START)).toBe('before the widget');
  });
});

describe('the escape hatch', () => {
  it('always takes simulated focus out of the mock, even from the trap', () => {
    const out = trapLeave(tabs(2));
    expect(out.at).toBe('before');
    expect(out.last).toBe('Simulated focus is back before the widget.');
  });
});

describe('what is said when the widget changes', () => {
  it('names how the widget treats focus', () => {
    expect(trapSaid('trap')).toBe('Traps focus with no way out. Tab cycles Email and Subscribe.');
    expect(trapSaid('exit')).toBe('Traps focus, and Escape lets it out.');
    expect(trapSaid('free')).toBe('No trap. Tab moves on past the widget.');
  });
});
