import { describe, it, expect } from 'vitest';
import { pairFromSearch, searchFromPair } from '../src/labs/pairQuery';

/**
 * The Colour check page takes a pair from the URL, `?fg=` and `?bg=`, and the colour check
 * lab on a criterion page links to it with its current pair. These two functions are the whole
 * contract between them.
 */

const DEFAULT = { fg: '#767676', bg: '#FFFFFF' };

describe('writing a pair into the URL', () => {
  it('writes both colours as six hex digits without the #', () => {
    expect(searchFromPair({ fg: '#777777', bg: '#FFFFFF' })).toBe('?fg=777777&bg=FFFFFF');
  });
});

describe('reading a pair from the URL', () => {
  it('is null when neither colour is given', () => {
    expect(pairFromSearch('', DEFAULT)).toBeNull();
    expect(pairFromSearch('?p=1', DEFAULT)).toBeNull();
  });

  it('reads both colours, with or without #, in 3 or 6 digits', () => {
    expect(pairFromSearch('?fg=B5B5B5&bg=%23fff', DEFAULT)).toEqual({
      fg: '#B5B5B5',
      bg: '#FFFFFF',
    });
  });

  it('keeps the current colour for one that is missing or not a colour', () => {
    expect(pairFromSearch('?fg=000', DEFAULT)).toEqual({ fg: '#000000', bg: '#FFFFFF' });
    expect(pairFromSearch('?fg=zzz&bg=123456', DEFAULT)).toEqual({
      fg: '#767676',
      bg: '#123456',
    });
  });

  it('reads back what it writes', () => {
    const pair = { fg: '#1A2B3C', bg: '#F0E0D0' };
    expect(pairFromSearch(searchFromPair(pair), DEFAULT)).toEqual(pair);
  });
});
