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
  },
];
