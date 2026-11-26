/**
 * Guideline 1.2 — Time-based Media.
 *
 * Every example here depicts a player rather than embedding one: this page ships no `<video>`
 * or `<audio>` element by design, and an e2e test enforces that. The mock is enough, because
 * what these criteria turn on is what sits *around* the media — captions, transcripts,
 * descriptions — not the media itself.
 */

import type { CriterionRecord } from './types';
import { MockPlayer, Transcript } from '../live/PlayerWindow';
import { ALL_HANDS, BRIEFING } from '../labs/captions';
import { BUDGET, EPISODE, FOLD } from '../labs/mediaAlternatives';

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

/* --- Live examples (#65): the mock player, operated by the input bar on both stages ---------- */

/** 1.2.2 broken: the briefing with its automatic captions, never checked. */
function AutoCaptionedBriefing() {
  return (
    <>
      <MockPlayer clip={BRIEFING} track="auto" />
      <p className="example-note">
        The machine heard something. Names, jargon, and numbers are exactly what it gets wrong,
        and the alarm is not captioned at all.
      </p>
    </>
  );
}

/** 1.2.2 fixed: the same briefing with corrected captions, speakers and sounds. */
function CaptionedBriefing() {
  return (
    <>
      <MockPlayer clip={BRIEFING} track="accurate" />
      <p className="example-note">
        Punctuated, attributed, and reviewed. The sounds that carry meaning are captioned too.
      </p>
    </>
  );
}

/** 1.2.4 broken: a live all-hands with no captions, and a promise of a transcript later. */
function UncaptionedStream() {
  return (
    <>
      <MockPlayer clip={ALL_HANDS} track="none" />
      <p className="example-note">
        Streaming now, with a note that a recording and transcript will follow later today. Deaf
        employees attend the meeting a day late and cannot ask a question in it.
      </p>
    </>
  );
}

/** 1.2.4 fixed: the same stream, captioned as the speaker talks. */
function CaptionedStream() {
  return (
    <>
      <MockPlayer clip={ALL_HANDS} track="accurate" />
      <p className="example-note">
        Live captioning, human or machine-with-a-human. Someone can take part in the event, not
        just read about it afterwards.
      </p>
    </>
  );
}

/* --- Live examples (#66): media alternatives on the mock player ---------------------------- */

/** 1.2.1 broken: the episode as audio and nothing else. */
function EpisodeAlone() {
  return (
    <>
      <p className="swatch-label">Episode 14 — Supply chains</p>
      <MockPlayer clip={EPISODE} track="none" />
      <p className="example-note">
        Speech with no transcript. A deaf listener gets the title. So does anyone on a train, in
        an open office, or searching the site for a phrase they remember hearing.
      </p>
    </>
  );
}

/** 1.2.1 fixed: the same episode with its transcript on the page. */
function EpisodeTranscribed() {
  return (
    <>
      <p className="swatch-label">Episode 14 — Supply chains</p>
      <MockPlayer clip={EPISODE} track="none" />
      <Transcript clip={EPISODE} kind="heard" label="Transcript" />
      <p className="example-note">
        Speaker-labelled, on the page rather than behind a download. It also happens to be the
        only version a search engine can read.
      </p>
    </>
  );
}

/** 1.2.3 broken: the demonstration, captioned, with nothing for what the hands do. */
function DemoCaptionsOnly() {
  return (
    <>
      <MockPlayer clip={FOLD} track="accurate" />
      <p className="example-note">
        “This” is a gesture. A blind viewer hears a complete sentence and learns nothing, and the
        captions faithfully reproduce the same gap.
      </p>
    </>
  );
}

/** 1.2.3 fixed: the same demonstration with a described transcript beside it. */
function DemoDescribedTranscript() {
  return (
    <>
      <MockPlayer clip={FOLD} track="accurate" />
      <Transcript clip={FOLD} kind="described" label="Described transcript" />
      <p className="example-note">
        Either fix works: a script that stops saying “this”, or, as here, a described transcript
        that carries what the camera showed.
      </p>
    </>
  );
}

/** 1.2.5 broken: the review with a described transcript, but no description track. */
function ReviewTranscriptOnly() {
  return (
    <>
      <MockPlayer clip={BUDGET} track="accurate" />
      <Transcript clip={BUDGET} kind="described" label="Described transcript" />
      <p className="example-note">
        Enough for 1.2.3 at Level A, not enough here. A blind viewer has to read a document
        alongside the video instead of simply watching it.
      </p>
    </>
  );
}

/** 1.2.5 fixed: the same review with its description track, cues on screen in the gaps. */
function ReviewDescribed() {
  return (
    <>
      <MockPlayer clip={BUDGET} track="accurate" description />
      <p className="example-note">
        Narration written into the natural pauses, offered as a track the viewer selects. This
        page is silent, so the cues show on screen. The viewer watches the same video everyone
        else does.
      </p>
    </>
  );
}

const PLAYER_KEYS = ['tab', 'shift-tab', 'enter'] as const;

export const G1_2: readonly CriterionRecord[] = [
  {
    num: '1.2.1',
    name: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    since: '2.0',
    guideline: '1.2',
    labs: ['media-only'],
    plain:
      'A recording with only sound needs a transcript. A recording with only pictures needs ' +
      'either a transcript or an audio track describing it. Whichever sense the recording ' +
      'requires, offer the same content to someone who cannot use it.',
    fail: {
      caption: 'A podcast episode published as audio and nothing else.',
      live: { Example: EpisodeAlone, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
      live: { Example: EpisodeTranscribed, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
    since: '2.0',
    guideline: '1.2',
    labs: ['captions'],
    plain:
      'Prerecorded video with sound needs captions: the dialogue, who is speaking, and the ' +
      'sounds that carry meaning. Auto-generated captions count only once someone has ' +
      'corrected them.',
    fail: {
      caption: 'Auto-captions, uncorrected.',
      live: { Example: AutoCaptionedBriefing, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
      live: { Example: CaptionedBriefing, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
    since: '2.0',
    guideline: '1.2',
    labs: ['media-alternative'],
    plain:
      'If the picture carries information the soundtrack does not, offer that information some ' +
      'other way — either an audio description track or a text alternative telling the whole ' +
      'story. Captions do not cover this: they carry what was said, not what was shown.',
    fail: {
      caption: 'The soundtrack alone does not carry the demonstration.',
      live: { Example: DemoCaptionsOnly, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
      live: { Example: DemoDescribedTranscript, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
    since: '2.0',
    guideline: '1.2',
    labs: ['live-captions'],
    plain:
      'Live video with sound needs live captions. Real time, as it happens — a transcript ' +
      'published afterwards is a different thing and does not satisfy this.',
    fail: {
      caption: 'Captions promised for "later today".',
      live: { Example: UncaptionedStream, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
      live: { Example: CaptionedStream, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
    since: '2.0',
    guideline: '1.2',
    labs: ['description'],
    plain:
      'At AA the text alternative is no longer enough on its own: prerecorded video needs an ' +
      'actual audio description track, narrating the visual information into the gaps in the ' +
      'dialogue.',
    fail: {
      caption: 'A described transcript, but no described audio track.',
      live: { Example: ReviewTranscriptOnly, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
      live: { Example: ReviewDescribed, keys: PLAYER_KEYS, instruments: ['mock-player'] },
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
