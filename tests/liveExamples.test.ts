import { describe, it, expect } from 'vitest';
import { focusLine, spoken, type AxNode } from '../src/labs/announce';
import { isTabbable, nodeAt, step } from '../src/live/focus';
import { logOf, type StageEvent } from '../src/live/events';
import { parseMarkup } from './markup';

/**
 * Live examples (#43): the pure parts under both stages. What a screen reader says when focus
 * lands on an element, which elements Tab stops at, and the log an instrument draws from the
 * stage's input events. Expected text is written out by hand from how screen readers voice these
 * patterns, not derived from the code.
 */

const first = (html: string): AxNode => {
  const root = parseMarkup(html);
  const el = root.children.find((c) => typeof c !== 'string');
  return (el ?? root) as AxNode;
};
const onFocus = (html: string) => spoken(focusLine(first(html)));

describe('what is said when focus lands', () => {
  it('says a native switch by its label, role and state', () => {
    expect(
      onFocus('<input type="checkbox" role="switch" aria-label="Email notifications" checked=""/>'),
    ).toBe('Email notifications, switch, on');
  });

  it('says nothing for a focusable div with no name and no role', () => {
    expect(onFocus('<div class="toggle" tabindex="0"><span class="knob"></span></div>')).toBe('');
  });

  it('names a focused field from a label elsewhere in the example', () => {
    const root = parseMarkup(
      '<label><input type="checkbox" role="switch"/> Email notifications</label>',
    );
    const input = nodeAt(root, [0, 0]);
    expect(input.tag).toBe('input');
    expect(spoken(focusLine(input, root))).toBe('Email notifications, switch, off');
  });

  it('says a roleless element by its text, as a screen reader reads focused text', () => {
    expect(onFocus('<div tabindex="0">Email notifications</div>')).toBe('Email notifications');
  });
});

describe('which elements Tab stops at', () => {
  const cases: [string, boolean][] = [
    ['<button>Go</button>', true],
    ['<a href="/x">x</a>', true],
    ['<a>x</a>', false],
    ['<input type="checkbox"/>', true],
    ['<input type="hidden"/>', false],
    ['<div tabindex="0"></div>', true],
    ['<div tabindex="-1"></div>', false],
    ['<button tabindex="-1">Go</button>', false],
    ['<button disabled="">Go</button>', false],
    ['<div></div>', false],
  ];
  for (const [html, expected] of cases) {
    it(`${html} ${expected ? 'is' : 'is not'} a Tab stop`, () => {
      const { tag, attrs } = first(html);
      expect(isTabbable(tag, attrs)).toBe(expected);
    });
  }
});

describe('where Tab goes next', () => {
  it('enters at the first stop, Shift+Tab at the last, and wraps at both ends', () => {
    expect(step(3, -1, false)).toBe(0);
    expect(step(3, -1, true)).toBe(2);
    expect(step(3, 2, false)).toBe(0);
    expect(step(3, 0, true)).toBe(2);
    expect(step(3, 1, false)).toBe(2);
    expect(step(0, -1, false)).toBe(-1);
  });
});

describe('the log drawn from a stage’s input events', () => {
  const sw = { name: 'Email notifications', role: 'switch', states: ['on'], description: '' };
  const blank = { name: '', role: null, states: [], description: '' };
  const text = { name: 'Email notifications', role: null, states: [], description: '' };

  it('writes one line per focus move and change, simulated or real alike', () => {
    const events: StageEvent[] = [
      { kind: 'focus', simulated: true, line: blank, index: 0, total: 1 },
      { kind: 'focus', simulated: false, line: sw, index: 0, total: 1 },
      { kind: 'change', simulated: false, line: { ...sw, states: ['off'] } },
    ];
    expect(logOf(events).map(spoken)).toEqual([
      '',
      'Email notifications, switch, on',
      'Email notifications, switch, off',
    ]);
  });

  it('writes every line of a read-aloud, and keeps only the latest lines', () => {
    const read: StageEvent = { kind: 'read', simulated: true, lines: [blank, text] };
    expect(logOf([read]).map(spoken)).toEqual(['', 'Email notifications']);
    expect(logOf([read, read, read, read], 5)).toHaveLength(5);
  });

  it('writes a status message announced while focus stays where it was', () => {
    const add = { name: 'Add to basket', role: 'button', states: [], description: '' };
    const message = { name: 'Added. 4 items in basket.', role: null, states: [], description: '' };
    const events: StageEvent[] = [
      { kind: 'focus', simulated: false, line: add, index: 0, total: 1 },
      { kind: 'status', simulated: false, line: message },
    ];
    expect(logOf(events).map(spoken)).toEqual(['Add to basket, button', 'Added. 4 items in basket.']);
  });
});
