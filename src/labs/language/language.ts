/**
 * The language labs' model (#51): which voice a screen reader reads each line in, and the
 * verdicts for 3.1.1 (the page declares its language) and 3.1.2 (a part in another language
 * declares its own).
 *
 * The voice comes from the `lang` that applies to a line (`Announcement.lang`). A line with none
 * is read in the reader's own default voice. The labs take that to be German, so an English page
 * with no `lang` is read with German pronunciation rules, the failure the 3.1.1 example describes.
 */

import type { Announcement } from '../shared/announce';
import type { Verdict } from '../shared/LabShell';

/** The language the reader's screen reader falls back to when the page declares none. */
export const READER_DEFAULT = 'de';

const LANGUAGES: Readonly<Record<string, string>> = {
  en: 'English',
  fr: 'French',
  de: 'German',
};

/** The voice a line in `lang` is read in: "French voice", or the reader's default for none. */
export function voiceOf(lang: string | undefined): string {
  if (!lang) return `${voiceOf(READER_DEFAULT)}, the reader’s default`;
  const primary = lang.split('-')[0]!.toLowerCase();
  return `${LANGUAGES[primary] ?? lang} voice`;
}

/** The log's lines, each marked with the voice it is read in rather than its bare `lang`. */
export function withVoices(lines: readonly Announcement[]): Announcement[] {
  return lines.map((l) => ({ ...l, lang: voiceOf(l.lang) }));
}

/** 3.1.1: the mock page's `lang` attribute. Its text is English. */
export type PageLang = 'none' | 'en' | 'fr';

export const PAGE_LANGS: readonly { readonly value: PageLang; readonly label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'en', label: 'lang="en"' },
  { value: 'fr', label: 'lang="fr"' },
];

export function pageVerdict(lang: PageLang): Verdict {
  return { criterion: '3.1.1', passes: lang === 'en' };
}

/** What the live region says after the reader sets the page's `lang`. */
export function pageSaid(lang: PageLang): string {
  if (lang === 'none') {
    return `The page is read in a ${voiceOf(undefined)}: it declares no language.`;
  }
  if (lang === 'en') return 'The page is read in an English voice.';
  return 'The page is read in a French voice, but its text is English.';
}

/** 3.1.2: the French phrase in the mock's English sentence. */
export const PHRASE = 'Défense d’afficher';

export function partsVerdict(marked: boolean): Verdict {
  return { criterion: '3.1.2', passes: marked };
}

/** What the live region says after the reader marks or unmarks the phrase. */
export function partsSaid(marked: boolean): string {
  return marked
    ? `${PHRASE} is read in a French voice, then back to English.`
    : `${PHRASE} is read in the English voice.`;
}
