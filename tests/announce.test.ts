import { describe, it, expect } from 'vitest';
import { announce, liveRegionLines, spoken } from '../src/labs/announce';
import { parseMarkup } from './markup';

/**
 * The announcement log (#42): given markup, what a screen reader would say, in reading order.
 * Expected lines are written out by hand from how screen readers voice these patterns (name,
 * role, then states), not derived from the code.
 */

const say = (html: string) => announce(parseMarkup(html)).map(spoken);

describe('names', () => {
  it('names a field from its <label for>', () => {
    expect(say('<label for="e">Email</label><input type="email" id="e"/>')).toEqual([
      'Email',
      'Email, edit text',
    ]);
  });

  it('names a field from a wrapping <label>', () => {
    expect(say('<label>Postcode <input type="text"/></label>')).toEqual([
      'Postcode',
      'Postcode, edit text',
    ]);
  });

  it('names an image from alt, and skips an empty alt', () => {
    expect(say('<img src="a.png" alt="Company logo"/><img src="b.png" alt=""/>')).toEqual([
      'Company logo, image',
    ]);
  });

  it('prefers aria-label over the content', () => {
    expect(say('<button aria-label="Close dialog">×</button>')).toEqual(['Close dialog, button']);
  });

  it('prefers aria-labelledby over aria-label, joining every id in order', () => {
    expect(
      say(
        '<span id="a">Delete</span><span id="b">invoice 42</span>' +
          '<button aria-labelledby="a b" aria-label="Ignored">X</button>',
      ),
    ).toEqual(['Delete invoice 42', 'Delete invoice 42, button']);
  });

  it('names a button from its content, using alt for images and skipping hidden parts', () => {
    expect(
      say('<button><img src="i.svg" alt="Search"/><span aria-hidden="true">🔍</span></button>'),
    ).toEqual(['Search, button']);
  });

  it('says only the role when there is no name', () => {
    expect(say('<button></button>')).toEqual(['button']);
    expect(say('<div role="switch" aria-checked="true"></div>')).toEqual(['switch, on']);
  });
});

describe('roles', () => {
  it('takes roles from native elements', () => {
    expect(
      say('<h2>Billing</h2><a href="/help">Help</a><input type="checkbox" aria-label="Agree"/>'),
    ).toEqual(['Billing, heading, level 2', 'Help, link', 'Agree, checkbox, not checked']);
  });

  it('takes roles from ARIA, over the native role', () => {
    expect(say('<div role="button">Save</div><a href="#" role="button">Open</a>')).toEqual([
      'Save, button',
      'Open, button',
    ]);
  });

  it('reads a plain div as text, with no role', () => {
    expect(say('<div><span>Email notifications</span></div>')).toEqual(['Email notifications']);
  });

  it('does not treat an anchor without href as a link', () => {
    expect(say('<a>Read more</a>')).toEqual(['Read more']);
  });
});

describe('states', () => {
  it('says required and invalid, from HTML or ARIA', () => {
    expect(
      say(
        '<input type="text" aria-label="Name" required=""/>' +
          '<input type="text" aria-label="Phone" aria-required="true" aria-invalid="true"/>',
      ),
    ).toEqual(['Name, edit text, required', 'Phone, edit text, required, invalid entry']);
  });

  it('says expanded or collapsed', () => {
    expect(
      say('<button aria-expanded="true">Menu</button><button aria-expanded="false">More</button>'),
    ).toEqual(['Menu, button, expanded', 'More, button, collapsed']);
  });

  it('says checked from the element, and from aria-checked', () => {
    expect(
      say(
        '<input type="checkbox" aria-label="Agree" checked=""/>' +
          '<div role="checkbox" aria-checked="false">Subscribe</div>' +
          '<div role="switch" aria-checked="false">Wi-Fi</div>',
      ),
    ).toEqual(['Agree, checkbox, checked', 'Subscribe, checkbox, not checked', 'Wi-Fi, switch, off']);
  });

  it('makes a button with aria-pressed a toggle button', () => {
    expect(
      say('<button aria-pressed="true">Bold</button><button aria-pressed="false">Italic</button>'),
    ).toEqual(['Bold, toggle button, pressed', 'Italic, toggle button, not pressed']);
  });

  it('ignores a state the role does not support', () => {
    expect(say('<button aria-checked="true">Mute</button>')).toEqual(['Mute, button']);
    expect(say('<div role="switch" aria-pressed="true">Mute</div>')).toEqual(['Mute, switch']);
    expect(say('<div aria-pressed="true">Mute</div>')).toEqual(['Mute']);
  });

  it('adds the description from aria-describedby last', () => {
    expect(
      say(
        '<input type="password" aria-label="Password" aria-describedby="h"/>' +
          '<p id="h">At least 12 characters</p>',
      ),
    ).toEqual(['Password, edit text, At least 12 characters', 'At least 12 characters']);
  });
});

describe('what is skipped, and language', () => {
  it('skips aria-hidden and hidden parts', () => {
    expect(say('<p aria-hidden="true">Decoration</p><p hidden="">Later</p><p>Shown</p>')).toEqual([
      'Shown',
    ]);
  });

  it('reads the subtree it is given even when that root is hidden', () => {
    const tree = parseMarkup('<div aria-hidden="true"><button>Save</button></div>');
    const mock = tree.children[0];
    expect(typeof mock === 'object' && announce(mock).map(spoken)).toEqual(['Save, button']);
  });

  it('marks the language of a part', () => {
    const [line] = announce(parseMarkup('<p lang="fr">Bonjour</p>'));
    expect(line).toMatchObject({ name: 'Bonjour', lang: 'fr' });
    expect(spoken(line!)).toBe('Bonjour (fr)');
  });

  it('switches voice for a phrase in another language, mid-sentence, and back', () => {
    expect(
      say('<div lang="en"><p>The sign read <em lang="fr">Défense d’afficher</em>, ignored.</p></div>'),
    ).toEqual(['The sign read (en)', 'Défense d’afficher (fr)', ', ignored. (en)']);
  });

  it('keeps a sentence in one voice when nothing in it is marked', () => {
    expect(say('<div lang="en"><p>The sign read <em>Défense d’afficher</em>, ignored.</p></div>')).toEqual([
      'The sign read Défense d’afficher , ignored. (en)',
    ]);
  });
});

describe('status messages', () => {
  const regions = (html: string) => liveRegionLines(parseMarkup(html)).map(spoken);

  it('reads the text of each status region and live region', () => {
    expect(
      regions(
        '<p>Basket (4)</p><p role="status">Added. 4 items in basket.</p>' +
          '<div aria-live="assertive">Card declined</div><p role="alert"></p>',
      ),
    ).toEqual(['Added. 4 items in basket.', 'Card declined', '']);
  });

  it('finds none in a message that is plain text, and none that are switched off', () => {
    expect(regions('<p>Added. 4 items in basket.</p><p aria-live="off">Saved</p>')).toEqual([]);
  });
});
