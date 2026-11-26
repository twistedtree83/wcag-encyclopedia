import { describe, it, expect } from 'vitest';
import { WORD, scDictate, scSaid, scTypedSaid, scVerdict } from '../src/labs/character-shortcuts/shortcuts';

/**
 * The 2.1.4 lab's model (#45): "e" archives the message. It is always on, remapped to Alt+E, or
 * active only while the message has focus. A speech-input user dictates a word into the reply
 * box. Expected strings are written out by hand.
 */

describe('verdict', () => {
  it('fails only when the single-key shortcut is always on', () => {
    expect(scVerdict('always')).toEqual({ criterion: '2.1.4', passes: false });
    expect(scVerdict('remapped').passes).toBe(true);
    expect(scVerdict('focus').passes).toBe(true);
  });
});

describe('dictating a word into the reply box', () => {
  it('always on: every e archives the message and never reaches the box', () => {
    expect(WORD).toBe('see you there');
    expect(scDictate('always', WORD)).toEqual({ typed: 's you thr', fired: 4 });
  });

  it('remapped or focus-only: the whole word lands in the box, nothing fires', () => {
    expect(scDictate('remapped', WORD)).toEqual({ typed: 'see you there', fired: 0 });
    expect(scDictate('focus', WORD)).toEqual({ typed: 'see you there', fired: 0 });
  });

  it('says what happened', () => {
    expect(scTypedSaid('always')).toBe(
      'Dictated “see you there”. The reply box got “s you thr”, and e archived the message.',
    );
    expect(scTypedSaid('focus')).toBe(
      'Dictated “see you there”. The reply box got all of it. No shortcut fired.',
    );
  });
});

describe('what is said when the shortcut changes', () => {
  it('names the binding', () => {
    expect(scSaid('always')).toBe('Shortcut e, always on.');
    expect(scSaid('remapped')).toBe('Shortcut remapped to Alt+E.');
    expect(scSaid('focus')).toBe('Shortcut e, only while the message has focus.');
  });
});
