import { describe, it, expect } from 'vitest';
import { KB_START, kbPress, kbSaid, kbVerdict, kbChoose } from '../src/labs/keyboard-control/keyboard';

/**
 * The 2.1.1 lab's model (#45): an "Add to basket" control built as a click-only div, a div with
 * tabindex, or a real button, and simulated Tab, Enter and Space on it. Only the button is both
 * reached by Tab and pressed by Enter and Space. Expected sentences are written out by hand.
 */

describe('verdict', () => {
  it('fails for the click-only div and the focusable div, passes for the button', () => {
    expect(kbVerdict('div')).toEqual({ criterion: '2.1.1', passes: false });
    expect(kbVerdict('focusable').passes).toBe(false);
    expect(kbVerdict('button').passes).toBe(true);
  });
});

describe('trying it by keyboard', () => {
  it('Tab skips the click-only div, and Enter then has nothing to press', () => {
    const tabbed = kbPress(KB_START, 'tab');
    expect(tabbed.focused).toBe(false);
    expect(tabbed.last).toBe('Tab: focus skipped it. It is not a Tab stop.');
    const entered = kbPress(tabbed, 'enter');
    expect(entered.basket).toBe(0);
    expect(entered.last).toBe('Enter: nothing has focus, so nothing happened.');
  });

  it('Tab reaches the focusable div, but Enter and Space do nothing', () => {
    const s = kbPress(kbChoose(KB_START, 'focusable'), 'tab');
    expect(s.focused).toBe(true);
    expect(s.last).toBe('Tab: focus is on Add to basket.');
    expect(kbPress(s, 'enter').last).toBe('Enter: nothing happened.');
    expect(kbPress(s, 'space').basket).toBe(0);
  });

  it('the button is reached by Tab and pressed by Enter and by Space', () => {
    const s = kbPress(kbChoose(KB_START, 'button'), 'tab');
    const once = kbPress(s, 'enter');
    expect(once.basket).toBe(1);
    expect(once.last).toBe('Enter: added. Basket: 1 item.');
    expect(kbPress(once, 'space').last).toBe('Space: added. Basket: 2 items.');
  });

  it('a new control starts unfocused, with the basket kept', () => {
    const s = kbPress(kbPress(kbChoose(KB_START, 'button'), 'tab'), 'enter');
    const swapped = kbChoose(s, 'div');
    expect(swapped).toMatchObject({ control: 'div', focused: false, basket: 1, last: null });
  });
});

describe('what is said when the control changes', () => {
  it('names what Tab and the keys do', () => {
    expect(kbSaid('div')).toBe('A click-only div. Tab skips it, and Enter and Space do nothing.');
    expect(kbSaid('focusable')).toBe(
      'A div with tabindex. Tab reaches it, but Enter and Space do nothing.',
    );
    expect(kbSaid('button')).toBe('A real button. Tab reaches it, and Enter and Space press it.');
  });
});
