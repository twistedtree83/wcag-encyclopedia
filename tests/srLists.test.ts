import { describe, it, expect } from 'vitest';
import { announce, spoken } from '../src/labs/shared/announce';
import { listOf, tabSwitchLine } from '../src/live/lists';
import { parseMarkup } from './markup';

/**
 * The screen reader's own readings out of context (#50): a links list, a headings list and a
 * browser-tab switch. Expected text is written out by hand from how screen readers voice these.
 */

const said = (html: string, list: 'links' | 'headings') =>
  listOf(announce(parseMarkup(html)), list).map(spoken);

describe('a links list', () => {
  it('reads each link by its own text, without the sentence around it', () => {
    const html =
      '<ul><li>Annual report 2025 — <a href="/a">read more</a></li>' +
      '<li>Board minutes — <a href="/b">read more</a></li></ul>';
    expect(said(html, 'links')).toEqual(['read more, link', 'read more, link']);
  });

  it('leaves out headings, text and anchors without an href', () => {
    expect(said('<h3>News</h3><p>Hello <a>there</a> <a href="/x">Go home</a></p>', 'links')).toEqual([
      'Go home, link',
    ]);
  });
});

describe('a headings list', () => {
  it('reads each heading with its level, and nothing else', () => {
    const html = '<h3>More</h3><p>Text</p><h4>Details</h4><label>Name <input/></label>';
    expect(said(html, 'headings')).toEqual(['More, heading, level 3', 'Details, heading, level 4']);
  });
});

describe('a tab switch', () => {
  it('says the page title', () => {
    expect(spoken(tabSwitchLine('Delivery — Acme', 'acme.example/delivery'))).toBe('Delivery — Acme');
  });

  it('says the address when the page has no title', () => {
    expect(spoken(tabSwitchLine('  ', 'acme.example/delivery'))).toBe('acme.example/delivery');
  });
});
