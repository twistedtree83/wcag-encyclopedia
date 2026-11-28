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
import { ALL_HANDS, BRIEFING } from '../labs/captions/captions';
import { BUDGET, EPISODE, FOLD } from '../labs/media-alternatives/mediaAlternatives';

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
    procedure: [
      'List every prerecorded audio-only file (a podcast, a recorded talk with no picture) and every prerecorded video with no sound track (a silent animation, a screen recording with no narration).',
      'For each audio-only file, find its transcript. It should be on the same page, or linked from right beside the player.',
      'Play the audio while you read the transcript. Check it holds everything that is said, names who says it, and notes sounds that matter, such as laughter or a door slamming.',
      'For each video-only file, find either a text description or an audio track. Watch the video and check the alternative tells you everything the picture shows that you need: who is there, what they do, and any text on screen.',
      'If a file has no alternative because it is itself an alternative to text on the page, check it is labelled as one, for example "Video version of the steps above".',
    ],
    questions: [
      {
        question: 'Does a podcast need a transcript to pass 1.2.1?',
        answer:
          'Yes. A prerecorded audio file needs a text alternative with the same information, and for a podcast that is a transcript that names each speaker and notes the sounds that matter.',
      },
      {
        question: 'Does a silent video need captions?',
        answer:
          'No. Captions carry sound, and a silent video has none. It needs a text description of what the picture shows, or an audio track that describes it.',
      },
      {
        question: 'Does 1.2.1 cover live audio, such as a radio stream?',
        answer:
          'No. 1.2.1 covers only prerecorded media. Live audio with no picture falls under 1.2.9 Audio-only (Live), which is Level AAA.',
      },
    ],
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
    procedure: [
      'List every prerecorded video with a sound track on the page, including ones embedded from YouTube or Vimeo.',
      'Play each video and turn captions on with the CC button. If there is no way to turn them on and none are drawn into the picture, the video fails.',
      'Turn the sound off and watch the whole video with captions. Check every line of speech is there and correct, and that you can tell who is speaking.',
      'Check the captions include the sounds that matter, such as [phone rings] or [music stops], and not only speech.',
      'Check each caption appears while its words are spoken and stays on screen long enough to read.',
    ],
    questions: [
      {
        question: 'Do burned-in captions pass 1.2.2?',
        answer:
          'Yes. Open captions, drawn into the picture so they cannot be turned off, count as captions. Closed captions, which people turn on and off, count too.',
      },
      {
        question: 'Is a transcript enough instead of captions?',
        answer:
          'No. For a video with sound, 1.2.2 asks for captions shown in time with the picture. A transcript helps, but it is what 1.2.1 Audio-only and Video-only (Prerecorded) asks for when there is audio and no picture.',
      },
      {
        question: 'Do captions need to describe sounds as well as speech?',
        answer:
          'Yes. Captions name who is speaking and include sound effects that carry meaning, because a person who cannot hear the sound track misses them otherwise.',
      },
    ],
  },

  {
    num: '1.2.3',
    name: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    since: '2.0',
    guideline: '1.2',
    labs: ['media-alternative'],
    gist:
      'If a video shows what its soundtrack never says, give that as audio description or text.',
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
    procedure: [
      'List every prerecorded video with sound on the page.',
      'Watch each video once, then play it again with the screen covered. Note everything you missed: actions, scene changes, text on screen, who is in the room.',
      'If the sound track already tells you all of it, the video needs nothing more. Otherwise look for an audio-described version, often offered as a separate video or a second audio track.',
      'If there is no audio description, look for a text alternative on the page or linked beside the player. Check it gives the dialogue in order and describes what happens on screen as well.',
      'Play the described version, or read the text alternative, and check it covers every item on your list.',
    ],
    questions: [
      {
        question: 'Does every video need audio description to pass 1.2.3?',
        answer:
          'No. If the sound track already says everything the picture shows, such as a talk where the speaker reads each slide aloud, there is nothing left to describe.',
      },
      {
        question: 'Is a transcript of the dialogue enough for 1.2.3?',
        answer:
          'No. The text alternative has to describe what happens on screen too: the actions, the setting and any text shown, in order with the dialogue.',
      },
      {
        question: 'Does a text alternative still pass at Level AA?',
        answer:
          'No. At Level A, 1.2.3 accepts either audio description or a text alternative. 1.2.5 Audio Description (Prerecorded), Level AA, asks for audio description, so a text alternative alone stops at Level A.',
      },
    ],
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
    procedure: [
      'List every live video stream with sound on the site, such as a webinar, a broadcast event or a live news feed.',
      'Join a live session and turn captions on. Check captions appear for all of the speech, not only parts of it.',
      'Watch with the sound off for a few minutes. Check you can follow what is said and tell who is saying it.',
      'Check the captions keep up with the speech and do not fall further behind as the session goes on.',
      'Ask how the captions are made before the next event. A real-time captioner, such as a CART service, has to be booked in advance.',
    ],
    questions: [
      {
        question: 'Do video calls in a web app need live captions under 1.2.4?',
        answer:
          'No. 1.2.4 is aimed at broadcasts. W3C says it is not meant to cover two-way calls between people made through a web app.',
      },
      {
        question: 'Does a live radio stream need captions under 1.2.4?',
        answer:
          'No. 1.2.4 covers live audio that comes with video. Live audio with no picture falls under 1.2.9 Audio-only (Live), which is Level AAA.',
      },
      {
        question: 'Do live captions need to name the speakers?',
        answer:
          'Yes. Live captions carry the same information as prerecorded ones: who is speaking, and the sounds that matter, such as applause.',
      },
    ],
  },

  {
    num: '1.2.5',
    name: 'Audio Description (Prerecorded)',
    level: 'AA',
    since: '2.0',
    guideline: '1.2',
    labs: ['description'],
    gist:
      'Prerecorded video needs a real audio description track: at AA, text alone is not enough.',
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
    procedure: [
      'List every prerecorded video with sound on the page.',
      'Play each one with the screen covered and note what the sound track leaves out: actions, scene changes, text on screen, people who appear without speaking.',
      'Look for audio description: a described version of the video, a second audio track, or a control on the player that turns description on.',
      'Play the described version and check each item on your list is described in the pauses between speech.',
      'Check the description does not talk over dialogue or sounds that matter. Where a pause is too short, the player can pause the video while the description plays.',
    ],
    questions: [
      {
        question: 'Does a text transcript pass 1.2.5?',
        answer:
          'No. 1.2.5 asks for audio description. A text alternative meets 1.2.3 Audio Description or Media Alternative (Prerecorded) at Level A, but not this criterion.',
      },
      {
        question: 'Does a video need audio description if the narration covers everything?',
        answer:
          'No. When the sound track already gives all the important visual information, the video meets 1.2.5 as it is.',
      },
      {
        question: 'Is extended audio description required at Level AA?',
        answer:
          'No. Pausing the video to fit description in is one way to meet 1.2.5, but only 1.2.7 Extended Audio Description (Prerecorded), Level AAA, asks for it when the pauses are too short.',
      },
    ],
  },
];
