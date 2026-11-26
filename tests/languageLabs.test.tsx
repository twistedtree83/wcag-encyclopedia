import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, spoken, type AxNode } from '../src/labs/shared/announce';
import {
  pageSaid,
  pageVerdict,
  partsSaid,
  partsVerdict,
  voiceOf,
  withVoices,
} from '../src/labs/language/language';
import { PageMock, PartsMock } from '../src/labs/language/LanguageLabs';
import { parseMarkup } from './markup';

/**
 * The 3.1.1 and 3.1.2 labs (#51): the announcement log names the voice each line is read in.
 * A line with no language is read in the reader's own default voice, which the labs take to be
 * German, so an English page with no `lang` is read with German rules. Expected lines are
 * written out by hand.
 */

const mockOf = (el: ReactElement): AxNode => {
  const root = parseMarkup(renderToStaticMarkup(el));
  return root.children.find((c) => typeof c !== 'string') as AxNode;
};
const heard = (el: ReactElement) => withVoices(announce(mockOf(el))).map(spoken);

describe('voices', () => {
  it('names the voice for a language, and the reader’s default for none', () => {
    expect(voiceOf('en')).toBe('English voice');
    expect(voiceOf('en-GB')).toBe('English voice');
    expect(voiceOf('fr')).toBe('French voice');
    expect(voiceOf(undefined)).toBe('German voice, the reader’s default');
    expect(voiceOf('nl')).toBe('nl voice');
  });
});

describe('3.1.1: the page’s language', () => {
  it('with no lang, the English page is read in the reader’s German voice', () => {
    expect(heard(<PageMock lang="none" />)).toEqual([
      'Opening hours, heading, level 4 (German voice, the reader’s default)',
      'Monday to Friday, nine till five. Closed on bank holidays. (German voice, the reader’s default)',
    ]);
    expect(pageVerdict('none')).toEqual({ criterion: '3.1.1', passes: false });
    expect(pageSaid('none')).toBe(
      'The page is read in a German voice, the reader’s default: it declares no language.',
    );
  });

  it('with lang="en", it is read in an English voice and passes', () => {
    expect(heard(<PageMock lang="en" />)).toEqual([
      'Opening hours, heading, level 4 (English voice)',
      'Monday to Friday, nine till five. Closed on bank holidays. (English voice)',
    ]);
    expect(pageVerdict('en')).toEqual({ criterion: '3.1.1', passes: true });
    expect(pageSaid('en')).toBe('The page is read in an English voice.');
  });

  it('with the wrong language declared, it is read in a French voice and fails', () => {
    expect(heard(<PageMock lang="fr" />)[0]).toBe('Opening hours, heading, level 4 (French voice)');
    expect(pageVerdict('fr')).toEqual({ criterion: '3.1.1', passes: false });
    expect(pageSaid('fr')).toBe('The page is read in a French voice, but its text is English.');
  });
});

describe('3.1.2: the language of a part', () => {
  it('an unmarked French phrase is read in the English voice, and fails', () => {
    expect(heard(<PartsMock marked={false} />)).toEqual([
      'The sign on the door still read Défense d’afficher , which nobody obeyed. (English voice)',
    ]);
    expect(partsVerdict(false)).toEqual({ criterion: '3.1.2', passes: false });
    expect(partsSaid(false)).toBe('Défense d’afficher is read in the English voice.');
  });

  it('marked lang="fr", the voice switches for the phrase and back, and passes', () => {
    expect(heard(<PartsMock marked />)).toEqual([
      'The sign on the door still read (English voice)',
      'Défense d’afficher (French voice)',
      ', which nobody obeyed. (English voice)',
    ]);
    expect(partsVerdict(true)).toEqual({ criterion: '3.1.2', passes: true });
    expect(partsSaid(true)).toBe('Défense d’afficher is read in a French voice, then back to English.');
  });
});
