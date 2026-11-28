/**
 * Guideline 3.1 — Readable.
 *
 * Both criteria are one attribute each, both are trivially cheap, and both are skipped
 * constantly. The cost of getting them wrong lands entirely on people using speech.
 */

import type { CriterionRecord, LiveExample } from './types';

/*
 * 3.1.1 and 3.1.2's live examples (#51). Each is a short mock page; "Read it aloud" fills the
 * log with the voice each line is read in. A mock page with no `lang` is read in the reader's
 * own default voice. The real page's `lang` is never changed.
 */

function PageWithoutLang() {
  return (
    <div className="live-page">
      <p className="live-page__h">Opening hours</p>
      <p>Monday to Friday, nine till five.</p>
    </div>
  );
}

function PageWithLang() {
  return (
    <div className="live-page" lang="en">
      <p className="live-page__h">Opening hours</p>
      <p>Monday to Friday, nine till five.</p>
    </div>
  );
}

function PhraseUnmarked() {
  return (
    <div className="live-page" lang="en">
      <p>
        The sign on the door still read <em>Défense d’afficher</em>, which nobody obeyed.
      </p>
    </div>
  );
}

function PhraseMarked() {
  return (
    <div className="live-page" lang="en">
      <p>
        The sign on the door still read <em lang="fr">Défense d’afficher</em>, which nobody
        obeyed.
      </p>
    </div>
  );
}

const READ_KEYS: LiveExample['keys'] = ['read'];

export const G3_1: readonly CriterionRecord[] = [
  {
    num: '3.1.1',
    name: 'Language of Page',
    level: 'A',
    since: '2.0',
    guideline: '3.1',
    labs: ['page-language'],
    plain:
      'Declare the page’s language in the markup. It is what tells a screen reader which voice ' +
      'and pronunciation rules to use, and what lets a browser offer to translate.',
    fail: {
      caption: 'No language declared.',
      live: { Example: PageWithoutLang, keys: READ_KEYS, instruments: ['voice-log'] },
      render: () => (
        <>
          <div className="codeline">&lt;html&gt;</div>
          <p className="example-note">
            The screen reader falls back to whatever the user’s system says. English read with
            German pronunciation rules is not slightly harder to follow — it is unintelligible.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'One attribute.',
      live: { Example: PageWithLang, keys: READ_KEYS, instruments: ['voice-log'] },
      render: () => (
        <>
          <div className="codeline">&lt;html lang="en"&gt;</div>
          <p className="example-note">
            Use the real subtag for the content — <span className="alt-code">en-GB</span> and{' '}
            <span className="alt-code">en-US</span> differ in more than spelling once a voice is
            reading them aloud.
          </p>
        </>
      ),
    },
    diff: {
      title: 'index.html',
      lines: [
        { kind: 'del', text: '<html>' },
        { kind: 'add', text: '<html lang="en">' },
      ],
      note: 'The cheapest criterion in the standard, and among the most often missed.',
    },
    procedure: [
      'Open the page, right-click and choose View Page Source. Find the opening html element and check that it has a lang attribute.',
      'Check that the value is a real language code for the language of the page, such as en for English or fr for French. An empty value, or a word such as english, does not count.',
      'Read the page and work out which language most of its text is in. Check that lang names that language; when two languages share the page equally, it names the one that comes first.',
      'Run a free checker such as axe DevTools or the W3C Nu Html Checker and look for a missing or invalid lang attribute. Repeat on each page template the site uses.',
      'Turn on a screen reader (NVDA on Windows, VoiceOver on a Mac) and read the first paragraph. Listen for the right voice and accent; English read with a French accent means lang is missing or wrong.',
    ],
    questions: [
      {
        question: 'Does 3.1.1 need a region code such as en-GB?',
        answer:
          'No. The language code on its own, such as en, is enough to pass. A region code such as en-GB can still help a screen reader choose the right accent.',
      },
      {
        question: 'Does a page in two languages pass 3.1.1?',
        answer:
          'Yes, when the html element declares the language most of the text is in. If both are used about equally, declare the one that comes first, and mark passages in the other with their own lang attribute for 3.1.2 Language of Parts.',
      },
      {
        question: 'Does 3.1.1 apply to a single-page app?',
        answer:
          'Yes. An app at one address counts as one page, so its html element needs a lang attribute like any other page. If the app switches its whole interface to another language, change lang to match.',
      },
    ],
  },

  {
    num: '3.1.2',
    name: 'Language of Parts',
    level: 'AA',
    since: '2.0',
    guideline: '3.1',
    labs: ['parts-language'],
    gist:
      'A passage in another language needs its own lang attribute, so screen readers switch voice.',
    plain:
      'Passages in another language need their own lang attribute, so a screen reader switches ' +
      'voice for them. Proper names and words that have been absorbed into the surrounding ' +
      'language are exempt.',
    fail: {
      caption: 'A French quotation read with an English voice.',
      live: { Example: PhraseUnmarked, keys: READ_KEYS, instruments: ['voice-log'] },
      render: () => (
        <>
          <p className="example-prose">
            The sign on the door still read <em>Défense d’afficher</em>, which nobody obeyed.
          </p>
          <p className="example-note">
            Pronounced with English rules it becomes noise. The reader cannot tell whether they
            missed a word or the page contains a typo.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The passage declares its own language.',
      live: { Example: PhraseMarked, keys: READ_KEYS, instruments: ['voice-log'] },
      render: () => (
        <>
          <p className="example-prose">
            The sign on the door still read{' '}
            <em lang="fr">Défense d’afficher</em>, which nobody obeyed.
          </p>
          <p className="example-note">
            <span className="alt-code">&lt;em lang="fr"&gt;</span>. The voice switches for the
            phrase and switches back. Words like "café" or "rendezvous" need nothing — they are
            English now.
          </p>
        </>
      ),
    },
    procedure: [
      'Read the page and list every passage, phrase or single word in a language other than the one the html element declares.',
      'Cross off proper names, technical terms, words of no clear language, and words that have become part of the surrounding language, such as café in English.',
      'Open your browser’s DevTools, inspect each passage left on the list, and check that it, or an element around it, has a lang attribute.',
      'Check that each lang value is the code for the language the passage is in, such as de for German or es for Spanish.',
      'Turn on a screen reader (NVDA on Windows, VoiceOver on a Mac) and read each passage. Listen for the voice switching to the other language and back again after it.',
    ],
    questions: [
      {
        question: 'Do proper names in another language need a lang attribute?',
        answer:
          'No. 3.1.2 leaves out proper names, so a French town or a German surname in English text needs no lang attribute of its own.',
      },
      {
        question: 'Does a single word in another language need lang?',
        answer:
          'Only when it has not become part of the surrounding language. One word can need its own lang, but a word such as rendezvous in English text is English now and needs nothing.',
      },
      {
        question: 'Can an automated checker test 3.1.2?',
        answer:
          'No, not on its own. A checker can find a lang value that is not a valid code, but it cannot tell that a passage is in another language. You have to read the page.',
      },
    ],
  },
];
