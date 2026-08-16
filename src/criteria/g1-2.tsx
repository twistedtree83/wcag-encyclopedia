/**
 * Guideline 1.2 — Time-based Media.
 *
 * Every example here depicts a player rather than embedding one: this page ships no `<video>`
 * or `<audio>` element by design, and an e2e test enforces that. The mock is enough, because
 * what these criteria turn on is what sits *around* the media — captions, transcripts,
 * descriptions — not the media itself.
 */

import type { CriterionRecord } from './types';

function Player({ caption, badge }: { caption?: string; badge?: string }) {
  return (
    <span aria-hidden="true" className="player">
      <span className="player__screen">
        {badge ? <span className="player__badge">{badge}</span> : null}
        {caption ? <span className="player__cc">{caption}</span> : null}
      </span>
      <span className="player__bar">
        <span className="player__play">▶</span>
        <span className="player__track" />
      </span>
    </span>
  );
}

export const G1_2: readonly CriterionRecord[] = [
  {
    num: '1.2.1',
    name: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    guideline: '1.2',
    plain:
      'A recording with only sound needs a transcript. A recording with only pictures needs ' +
      'either a transcript or an audio track describing it. Whichever sense the recording ' +
      'requires, offer the same content to someone who cannot use it.',
    fail: {
      caption: 'A podcast episode published as audio and nothing else.',
      render: () => (
        <>
          <p className="swatch-label">Episode 14 — Supply chains</p>
          <Player badge="audio" />
          <p className="example-note">
            Fifty minutes of speech with no transcript. A deaf listener gets the title. So does
            anyone on a train, in an open office, or searching the site for a phrase they
            remember hearing.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A full transcript sits beneath the player.',
      render: () => (
        <>
          <p className="swatch-label">Episode 14 — Supply chains</p>
          <Player badge="audio" />
          <p className="transcript">
            <strong>Transcript</strong>
            <span>
              <b>Ama:</b> …so the bottleneck was never the factory, it was the paperwork at the
              port. <b>Dele:</b> And that is where the three weeks went.
            </span>
          </p>
          <p className="example-note">
            Speaker-labelled, on the page rather than behind a download. It also happens to be
            the only version a search engine can read.
          </p>
        </>
      ),
    },
  },

  {
    num: '1.2.2',
    name: 'Captions (Prerecorded)',
    level: 'A',
    guideline: '1.2',
    plain:
      'Prerecorded video with sound needs captions: the dialogue, who is speaking, and the ' +
      'sounds that carry meaning. Auto-generated captions count only once someone has ' +
      'corrected them.',
    fail: {
      caption: 'Auto-captions, uncorrected.',
      render: () => (
        <>
          <Player badge="video" caption="were going to deploy the pack age on fry day" />
          <p className="example-note">
            The machine heard something. Names, jargon, and numbers are exactly what it gets
            wrong, and exactly what the sentence depends on.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Corrected captions, with speakers and meaningful sound.',
      render: () => (
        <>
          <Player badge="video" caption="[Priya] We're going to deploy the package on Friday." />
          <p className="example-note">
            Punctuated, attributed, and reviewed. Non-speech sound that carries meaning —
            <span className="alt-code"> [alarm]</span>,{' '}
            <span className="alt-code">[laughter]</span> — is captioned too.
          </p>
        </>
      ),
    },
  },

  {
    num: '1.2.3',
    name: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    guideline: '1.2',
    plain:
      'If the picture carries information the soundtrack does not, offer that information some ' +
      'other way — either an audio description track or a text alternative telling the whole ' +
      'story. Captions do not cover this: they carry what was said, not what was shown.',
    fail: {
      caption: 'The soundtrack alone does not carry the demonstration.',
      render: () => (
        <>
          <Player badge="video" caption="[Sam] Then you just do this, and it's ready." />
          <p className="example-note">
            "This" is a gesture. A blind viewer hears a complete sentence and learns nothing,
            and the captions faithfully reproduce the same gap.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A text alternative describes the action, not just the dialogue.',
      render: () => (
        <>
          <Player badge="video" caption="[Sam] Then you fold the corner under, and it's ready." />
          <p className="transcript">
            <strong>Described transcript</strong>
            <span>
              <b>Sam</b> folds the near corner of the fabric under the seam allowance and
              presses it flat with a thumb. "Then you fold the corner under, and it's ready."
            </span>
          </p>
          <p className="example-note">
            Two fixes, either of which works: the script stopped saying "this", and the
            described transcript carries what the camera showed.
          </p>
        </>
      ),
    },
  },

  {
    num: '1.2.4',
    name: 'Captions (Live)',
    level: 'AA',
    guideline: '1.2',
    plain:
      'Live video with sound needs live captions. Real time, as it happens — a transcript ' +
      'published afterwards is a different thing and does not satisfy this.',
    fail: {
      caption: 'Captions promised for "later today".',
      render: () => (
        <>
          <Player badge="live" />
          <p className="example-note">
            An all-hands streaming now, with a note that a recording and transcript will follow.
            Deaf employees attend the meeting a day late and cannot ask a question in it.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Captions appear during the broadcast.',
      render: () => (
        <>
          <Player badge="live" caption="[CEO] …and the hiring freeze lifts in March." />
          <p className="example-note">
            Live captioning, human or machine-with-a-human. The test is whether someone can
            take part in the event, not whether they can read about it afterwards.
          </p>
        </>
      ),
    },
  },

  {
    num: '1.2.5',
    name: 'Audio Description (Prerecorded)',
    level: 'AA',
    guideline: '1.2',
    plain:
      'At AA the text alternative is no longer enough on its own: prerecorded video needs an ' +
      'actual audio description track, narrating the visual information into the gaps in the ' +
      'dialogue.',
    fail: {
      caption: 'A described transcript, but no described audio track.',
      render: () => (
        <>
          <Player badge="video" />
          <p className="example-note">
            Enough for 1.2.3 at Level A, not enough here. A blind viewer has to read a document
            alongside the video instead of simply watching it.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A selectable audio description track.',
      render: () => (
        <>
          <Player badge="video" caption="[Description] She crosses out the second column." />
          <p className="example-note">
            Narration written into the natural pauses, offered as an alternate audio track. The
            viewer watches the same video everyone else does.
          </p>
        </>
      ),
    },
    diff: {
      title: 'player.html, the track elements',
      lines: [
        { kind: 'context', text: '<video controls>' },
        { kind: 'context', text: '  <track kind="captions" src="en.vtt" srclang="en" default>' },
        { kind: 'add', text: '  <track kind="descriptions" src="en-desc.vtt" srclang="en">' },
        { kind: 'context', text: '</video>' },
      ],
      note:
        'Captions and descriptions are different track kinds carrying different information. ' +
        'Shipping one does not satisfy the criterion that asks for the other.',
    },
  },
];
