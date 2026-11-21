import { describe, it, expect } from 'vitest';
import { EMPTY_QUERY, type Query } from '../src/catalog/filter';
import { queryFromSearch, searchFromQuery, resultsLine } from '../src/catalog/urlQuery';

/**
 * The All criteria page keeps its filters in the URL, so a filtered view can be shared:
 * `?p=1` to `?p=4` for a principle, `?q=` for a search, `?new` for new in 2.2, and `?l=` for
 * a level. These two functions are the whole contract between the address bar and the page.
 */

const q = (over: Partial<Query> = {}): Query => ({ ...EMPTY_QUERY, ...over });

describe('reading a query from the URL', () => {
  it('is the empty query when there is no search string', () => {
    expect(queryFromSearch('')).toEqual(EMPTY_QUERY);
    expect(queryFromSearch('?')).toEqual(EMPTY_QUERY);
  });

  it('reads ?p=1 to ?p=4 as a principle', () => {
    expect(queryFromSearch('?p=1')).toEqual(q({ principle: 1 }));
    expect(queryFromSearch('?p=4')).toEqual(q({ principle: 4 }));
  });

  it('ignores a principle that does not exist', () => {
    for (const bad of ['?p=0', '?p=5', '?p=x', '?p=', '?p=1.5']) {
      expect(queryFromSearch(bad), bad).toEqual(EMPTY_QUERY);
    }
  });

  it('reads ?q= as the search text, decoded', () => {
    expect(queryFromSearch('?q=focus')).toEqual(q({ text: 'focus' }));
    expect(queryFromSearch('?q=link+purpose')).toEqual(q({ text: 'link purpose' }));
    expect(queryFromSearch('?q=1.4%203')).toEqual(q({ text: '1.4 3' }));
  });

  it('reads ?new, with or without a value, as new in 2.2', () => {
    expect(queryFromSearch('?new')).toEqual(q({ newIn22: true }));
    expect(queryFromSearch('?new=1')).toEqual(q({ newIn22: true }));
  });

  it('reads ?l=A and ?l=AA as a level, and ignores anything else', () => {
    expect(queryFromSearch('?l=A')).toEqual(q({ level: 'A' }));
    expect(queryFromSearch('?l=AA')).toEqual(q({ level: 'AA' }));
    expect(queryFromSearch('?l=AAA')).toEqual(EMPTY_QUERY);
  });

  it('combines parameters', () => {
    expect(queryFromSearch('?p=2&l=AA&new&q=target')).toEqual(
      q({ principle: 2, level: 'AA', newIn22: true, text: 'target' }),
    );
  });
});

describe('writing a query to the URL', () => {
  it('writes nothing for the empty query', () => {
    expect(searchFromQuery(EMPTY_QUERY)).toBe('');
  });

  it('writes the short forms the footer links use', () => {
    expect(searchFromQuery(q({ principle: 3 }))).toBe('?p=3');
    expect(searchFromQuery(q({ newIn22: true }))).toBe('?new');
    expect(searchFromQuery(q({ text: 'captions' }))).toBe('?q=captions');
    expect(searchFromQuery(q({ level: 'A' }))).toBe('?l=A');
  });

  it('encodes the search text and leaves out blank text', () => {
    expect(searchFromQuery(q({ text: 'a&b' }))).toBe('?q=a%26b');
    expect(searchFromQuery(q({ text: '   ' }))).toBe('');
  });

  it('writes several parameters in a fixed order', () => {
    expect(searchFromQuery(q({ text: 'x', newIn22: true, level: 'AA', principle: 2 }))).toBe(
      '?p=2&l=AA&new&q=x',
    );
  });

  it('round-trips every query a reader can build', () => {
    const queries = [
      q({ principle: 1 }),
      q({ level: 'AA', newIn22: true }),
      q({ principle: 4, text: 'name, role & value' }),
    ];
    for (const query of queries) expect(queryFromSearch(searchFromQuery(query))).toEqual(query);
  });
});

describe('the results line', () => {
  it('names both numbers as a sentence', () => {
    expect(resultsLine({ shown: 6, total: 55 })).toBe('Showing 6 of 55 criteria.');
    expect(resultsLine({ shown: 55, total: 55 })).toBe('Showing 55 of 55 criteria.');
    expect(resultsLine({ shown: 0, total: 55 })).toBe('Showing 0 of 55 criteria.');
  });
});
