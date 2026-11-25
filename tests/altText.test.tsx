import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, spoken } from '../src/labs/announce';
import { ALT_START, altSaid, altVerdict, markupOfAlt, presetOf, type AltModel } from '../src/labs/altText';
import { AltMock } from '../src/labs/AltTextLab';
import { altFromSearch, searchFromAlt } from '../src/labs/altQuery';
import { parseMarkup } from './markup';

/**
 * The 1.1.1 flagship lab (#48). The reader writes the alt text for a mock image, a product photo
 * or a decorative divider; the log reads the mock's own markup. Expected lines and verdicts are
 * written out by hand from how screen readers treat each alt.
 */

const logOf = (m: AltModel) => announce(parseMarkup(renderToStaticMarkup(<AltMock model={m} />)));
const said = (m: AltModel) => logOf(m).map(spoken);
const photo = (alt: string | null): AltModel => ({ purpose: 'photo', alt });
const divider = (alt: string | null): AltModel => ({ purpose: 'divider', alt });

describe('the product photo', () => {
  it('starts with no alt attribute: said only as "image", and fails', () => {
    expect(ALT_START).toEqual(photo(null));
    expect(said(ALT_START)).toEqual(['image']);
    expect(altVerdict(ALT_START)).toEqual({ criterion: '1.1.1', passes: false });
  });

  it('fails with its file name as the alt', () => {
    expect(said(photo('overshirt-401.jpg'))).toEqual(['overshirt-401.jpg, image']);
    expect(altVerdict(photo('overshirt-401.jpg')).passes).toBe(false);
    expect(altVerdict(photo('IMG_4017.PNG')).passes).toBe(false);
  });

  it('fails marked decorative: skipped, so what it shows is lost', () => {
    expect(said(photo(''))).toEqual([]);
    expect(altVerdict(photo('')).passes).toBe(false);
  });

  it('fails with a word that names only the kind of thing', () => {
    expect(said(photo('image'))).toEqual(['image, image']);
    expect(altVerdict(photo('image')).passes).toBe(false);
    expect(altVerdict(photo(' Photo ')).passes).toBe(false);
    expect(altVerdict(photo('   ')).passes).toBe(false);
  });

  it('passes described by what it shows, in the reader’s own words too', () => {
    expect(said(photo('Wool overshirt in rust, worn open'))).toEqual([
      'Wool overshirt in rust, worn open, image',
    ]);
    expect(altVerdict(photo('Wool overshirt in rust, worn open')).passes).toBe(true);
    expect(altVerdict(photo('Rust shirt')).passes).toBe(true);
  });
});

describe('the decorative divider', () => {
  it('passes only with an empty alt, which skips it', () => {
    expect(said(divider(''))).toEqual([]);
    expect(altVerdict(divider('')).passes).toBe(true);
  });

  it('fails with no alt, a file name or a description: each is said aloud', () => {
    expect(said(divider(null))).toEqual(['image']);
    expect(said(divider('Decorative gold swirl'))).toEqual(['Decorative gold swirl, image']);
    for (const alt of [null, 'swirl-divider.svg', 'Decorative gold swirl', ' ']) {
      expect(altVerdict(divider(alt)).passes, String(alt)).toBe(false);
    }
  });
});

describe('presets and the markup readout', () => {
  it('knows which preset an alt is, for each image', () => {
    expect(presetOf(photo(null))).toBe('none');
    expect(presetOf(photo('overshirt-401.jpg'))).toBe('filename');
    expect(presetOf(photo(''))).toBe('decorative');
    expect(presetOf(photo('Wool overshirt in rust, worn open'))).toBe('descriptive');
    expect(presetOf(divider('swirl-divider.svg'))).toBe('filename');
    expect(presetOf(photo('Rust shirt'))).toBeNull();
  });

  it('writes the img tag as an author would', () => {
    expect(markupOfAlt(photo(null))).toBe('<img src="overshirt-401.jpg">');
    expect(markupOfAlt(divider(''))).toBe('<img src="swirl-divider.svg" alt="">');
    expect(markupOfAlt(photo('Say "hi"'))).toBe('<img src="overshirt-401.jpg" alt="Say &quot;hi&quot;">');
  });
});

describe('what the live region says', () => {
  it('reads the log, then why it passes or fails', () => {
    expect(altSaid(ALT_START, logOf(ALT_START))).toBe(
      'Screen reader says: image. No alt attribute, so the photo is only "image".',
    );
    expect(altSaid(photo(''), logOf(photo('')))).toBe(
      'Screen reader says nothing: the image is skipped. Marked decorative, so what the photo shows is lost.',
    );
    const named = photo('Wool overshirt in rust, worn open');
    expect(altSaid(named, logOf(named))).toBe(
      'Screen reader says: Wool overshirt in rust, worn open, image. The photo is named.',
    );
    expect(altSaid(divider(''), logOf(divider('')))).toBe(
      'Screen reader says nothing: the image is skipped. Decoration, correctly skipped.',
    );
    const noisy = divider('Decorative gold swirl');
    expect(altSaid(noisy, logOf(noisy))).toBe(
      'Screen reader says: Decorative gold swirl, image. Decoration with a name is noise.',
    );
  });
});

describe('the URL', () => {
  it('writes nothing for the start, and round-trips every other state', () => {
    expect(searchFromAlt(ALT_START)).toBe('');
    for (const m of [photo(''), photo('Rust shirt & co'), divider(null), divider('')]) {
      expect(altFromSearch(searchFromAlt(m)), JSON.stringify(m)).toEqual(m);
    }
    expect(searchFromAlt(divider(''))).toBe('?img=divider&alt=');
  });

  it('ignores what it does not know, and caps a long alt', () => {
    expect(altFromSearch('')).toBeNull();
    expect(altFromSearch('?img=banner')).toBeNull();
    expect(altFromSearch('?img=banner&alt=x')).toEqual(photo('x'));
    expect(altFromSearch(`?alt=${'a'.repeat(500)}`)?.alt).toHaveLength(150);
  });
});
