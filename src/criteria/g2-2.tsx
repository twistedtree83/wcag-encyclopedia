/**
 * Guideline 2.2 — Enough Time.
 *
 * Both criteria come down to the same assumption: that everyone reads, types, and decides at
 * the speed the person who built the thing does.
 */

import { useId, useRef, useState, type Ref } from 'react';
import { useClockNow } from '../live/clock';
import { slideAt } from '../labs/timing/carousel';
import { Slides } from '../labs/timing/timingParts';
import type { CriterionRecord, LiveExample } from './types';

/*
 * 2.2.1's live examples (#61): a one-field application on a two-minute session, on the stage's
 * mock clock. Nothing runs until the reader presses "Wait 20 seconds" or "Run the clock". The
 * broken one ends without a word and takes the answer with it; the fixed one warns 20 seconds
 * ahead in an alert, offers more time in one press, and keeps the answer if the time runs out.
 * Each names what it shows in `data-timer`, for the clock instrument.
 */

const SESSION = 120;
const WARN = 20;

function NameField({ field }: { readonly field?: Ref<HTMLInputElement> }) {
  const id = useId();
  return (
    <form className="lform" onSubmit={(e) => e.preventDefault()}>
      <label className="lform__label" htmlFor={`${id}-name`}>
        Full name
      </label>
      <input
        ref={field}
        id={`${id}-name`}
        autoComplete="name"
        defaultValue="Sam Okafor"
        className="lform__field"
      />
      <button type="submit" className="btn p sm">
        Send application
      </button>
    </form>
  );
}

function ExpiringForm() {
  const now = useClockNow();
  if (now >= SESSION) {
    return (
      <div className="sess" data-timer="Session expired, answer lost">
        <div className="notice notice--bad">
          <span className="notice__title">Session expired</span>
          <span>Please sign in again. Your answers have been cleared.</span>
        </div>
      </div>
    );
  }
  return (
    <div className="sess" data-timer="Form open">
      <NameField />
    </div>
  );
}

function WarnedForm() {
  const now = useClockNow();
  const field = useRef<HTMLInputElement>(null);
  const [deadline, setDeadline] = useState(SESSION);
  const left = deadline - now;
  if (left <= 0) {
    return (
      <div className="sess" data-timer="Session ended, answer saved">
        <div className="notice">
          <span className="notice__title">Session ended</span>
          <span>Your answers are saved. Sign in to carry on where you left off.</span>
        </div>
      </div>
    );
  }
  const warned = left <= WARN;
  const shows = warned ? 'Warning: Still there?' : deadline > SESSION ? 'Form open, time extended' : 'Form open';
  return (
    <div className="sess" data-timer={shows}>
      {/* In the page from the start, so the warning is announced when it fills. */}
      <div role="alert">
        {warned ? (
          <div className="notice">
            <span className="notice__title">Still there?</span>
            <span>Your session ends in {WARN} seconds. Your answers are saved.</span>
            <span className="notice__actions">
              <button
                type="button"
                className="btn p sm"
                onClick={() => {
                  setDeadline(now + SESSION);
                  field.current?.focus();
                }}
              >
                Give me more time
              </button>
            </span>
          </div>
        ) : null}
      </div>
      <NameField field={field} />
    </div>
  );
}

const SESSION_LIVE: Omit<LiveExample, 'Example'> = {
  keys: ['tab', 'shift-tab', 'enter', 'read', 'wait', 'run'],
  instruments: ['clock', 'announcement-log'],
  clock: { end: 180 },
};

/*
 * 2.2.2's live examples (#62): a carousel that moves a slide every four mock seconds once the
 * reader moves the stage's clock. The broken one has no control; the fixed one has a real Pause
 * button before the slides. `data-timer` names the phase (moving, past five seconds, paused),
 * never the slide, so a running clock isn't a change on every tick.
 */

const MOVING = 5;

function ShopLink() {
  return (
    <a href="#shop-the-sale" className="tcar__link" onClick={(e) => e.preventDefault()}>
      Shop the sale
    </a>
  );
}

function MovingCarousel() {
  const now = useClockNow();
  const shows = now <= MOVING ? 'Moving on its own' : 'Still moving after 5 seconds, no control';
  return (
    <div className="tcar" data-timer={shows}>
      <Slides slide={slideAt(now)} />
      <ShopLink />
    </div>
  );
}

function PausableCarousel() {
  const now = useClockNow();
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const shows =
    pausedAt !== null
      ? 'Paused by the reader'
      : now <= MOVING
        ? 'Moving, with Pause'
        : 'Moving after 5 seconds, with Pause';
  return (
    <div className="tcar" data-timer={shows}>
      <button
        type="button"
        className="btn o sm"
        onClick={() => setPausedAt(pausedAt === null ? now : null)}
      >
        {pausedAt === null ? 'Pause' : 'Play'}
      </button>
      <Slides slide={slideAt(pausedAt ?? now)} />
      <ShopLink />
    </div>
  );
}

const CAROUSEL_LIVE: Omit<LiveExample, 'Example'> = {
  keys: ['tab', 'shift-tab', 'enter', 'read', 'wait', 'run'],
  instruments: ['clock', 'announcement-log'],
  clock: { end: 60 },
};

export const G2_2: readonly CriterionRecord[] = [
  {
    num: '2.2.1',
    name: 'Timing Adjustable',
    level: 'A',
    since: '2.0',
    guideline: '2.2',
    labs: ['session-timeout'],
    gist: 'A time limit must let the reader turn it off, lengthen it, or ask for more time.',
    plain:
      'If something is on a timer, the reader must be able to turn it off, adjust it to at ' +
      'least ten times the default, or extend it — with at least twenty seconds’ warning and a ' +
      'simple action to get more time. Real-time events and hard security limits are exempt.',
    fail: {
      caption: 'Session ends without warning, taking the form with it.',
      live: { Example: ExpiringForm, ...SESSION_LIVE },
      render: () => (
        <>
          <div className="notice notice--bad">
            <span className="notice__title">Session expired</span>
            <span>Please sign in again.</span>
          </div>
          <p className="example-note">
            Two minutes, no warning, and the half-finished application is gone. Anyone
            typing with a switch, looking words up, or interrupted by care needs starts over —
            and hits the same wall next time.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A warning, an extension, and the work preserved.',
      live: { Example: WarnedForm, ...SESSION_LIVE },
      render: () => (
        <>
          <div className="notice">
            <span className="notice__title">Still there?</span>
            <span>Your session ends in {WARN} seconds. Your answers are saved.</span>
            <span className="notice__actions">
              <span className="pill">Give me more time</span>
              <span className="pill">Sign out</span>
            </span>
          </div>
          <p className="example-note">
            Warned {WARN} seconds before the two-minute limit, extended by one obvious action,
            and the data survives either way. Saving the work is not strictly required by the criterion — it is what
            makes the difference between compliant and kind.
          </p>
        </>
      ),
    },
    procedure: [
      'List every time limit the page sets: a session that signs the person out, a form that expires, a quiz with a clock, a message that disappears after a few seconds, a page that redirects on its own.',
      'For each one, start the activity and wait without touching anything. Time how long it takes to expire, with a stopwatch or the clock in the corner of the screen.',
      'Check that the person gets at least one of these before the limit is reached: a setting that turns it off, a setting that makes it at least ten times longer, or a warning with at least 20 seconds to extend it with one simple action such as pressing a button.',
      'Where the warning is the way to pass, extend the limit again and again. Check that it can be extended at least ten times.',
      'Check that the warning can be reached with the keyboard and is announced by a screen reader (NVDA on Windows, VoiceOver on a Mac), so the person knows it is there.',
      'For any limit that cannot be changed, check that it is one of the exceptions: part of a live event such as an auction, a limit that extending would make pointless, or a limit longer than 20 hours.',
    ],
    questions: [
      {
        question: 'Does a session timeout for security fail 2.2.1?',
        answer:
          'Only when the person has no way to keep the session going. Warn them before it ends and let them extend it with one action, or let them choose a longer session when they sign in.',
      },
      {
        question: 'Is a ticket hold of ten minutes allowed?',
        answer:
          'Yes, when extending it would defeat its purpose. Holding seats for one person indefinitely would keep them from everyone else, so that limit is essential and is exempt.',
      },
      {
        question: 'Does 2.2.1 cover a carousel that moves on its own?',
        answer:
          'Only in part. A carousel that advances on a timer sets a time limit on reading each slide, but the usual fix, a control that pauses or stops it, is what 2.2.2 Pause, Stop, Hide asks for. Meet 2.2.2 and the carousel usually meets 2.2.1 too.',
      },
    ],
  },

  {
    num: '2.2.2',
    name: 'Pause, Stop, Hide',
    level: 'A',
    since: '2.0',
    guideline: '2.2',
    demos: ['autoplay-2-2-2'],
    labs: ['stop-carousel'],
    gist:
      'Anything that moves or updates on its own for over five seconds needs a way to pause it.',
    plain:
      'Anything that moves, blinks, scrolls, or auto-updates for more than five seconds needs a ' +
      'way to pause, stop, or hide it — provided it runs alongside other content. Motion in the ' +
      'periphery is genuinely disabling for people with ADHD, vestibular disorders, or low ' +
      'vision using magnification.',
    fail: {
      caption: 'A carousel that advances on its own, with no control.',
      live: { Example: MovingCarousel, ...CAROUSEL_LIVE },
      render: () => (
        <>
          <div className="carousel" aria-hidden="true">
            <span className="carousel__slide carousel__slide--on" />
            <span className="carousel__slide" />
            <span className="carousel__slide" />
            <span className="carousel__dots">● ○ ○</span>
          </div>
          <p className="example-note">
            It advances every four seconds. A magnifier user reading the left edge loses their
            place each time; anyone reading slowly never finishes a slide.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A pause control, present before the motion starts.',
      live: { Example: PausableCarousel, ...CAROUSEL_LIVE },
      render: () => (
        <>
          <div className="carousel" aria-hidden="true">
            <span className="carousel__slide carousel__slide--on" />
            <span className="carousel__slide" />
            <span className="carousel__slide" />
            <span className="carousel__dots">
              <span className="pill">❚❚ Pause</span> ● ○ ○
            </span>
          </div>
          <p className="example-note">
            Pause is a real control in the tab order, not a hover-only affordance. Honouring{' '}
            <span className="alt-code">prefers-reduced-motion</span> by not auto-advancing at
            all is better still — the demos on this page take that route.
          </p>
        </>
      ),
    },
    diff: {
      title: 'carousel.js',
      lines: [
        { kind: 'del', text: 'setInterval(next, 4000);' },
        { kind: 'add', text: "const still = matchMedia('(prefers-reduced-motion: reduce)').matches;" },
        { kind: 'add', text: 'let timer = still ? null : setInterval(next, 4000);' },
        { kind: 'add', text: 'pauseButton.addEventListener("click", () => {' },
        { kind: 'add', text: '  timer = timer ? clearInterval(timer) : setInterval(next, 4000);' },
        { kind: 'add', text: '});' },
      ],
      note:
        'The reader’s stated preference decides whether it starts; the button decides whether ' +
        'it continues. Neither alone is sufficient.',
    },
    procedure: [
      'Load the page and watch it for 10 seconds without touching anything. Note everything that moves, blinks, scrolls or updates on its own: carousels, tickers, animated backgrounds, videos without sound, live scores, feeds.',
      'For each item that starts by itself, sits next to other content and runs for more than five seconds, look for a control that pauses, stops or hides it.',
      'Reach that control with the keyboard alone and use it. Check that the movement stops and stays stopped, and does not start again when focus leaves.',
      'For content that updates on its own, such as a news feed or a share price, check that the person can pause the updates, stop them, hide them, or choose how often they arrive.',
      'Turn on Reduce motion in the operating system settings and reload. Check what still moves, and whether a control is still needed for it.',
    ],
    questions: [
      {
        question: 'Does an animation that lasts four seconds need a pause button?',
        answer:
          'No. Movement that stops by itself within five seconds is outside 2.2.2. Blinking that stops within five seconds passes too.',
      },
      {
        question: 'Does a loading spinner fail 2.2.2?',
        answer:
          'No, when it is the only thing on screen and the person cannot do anything until loading ends. A spinner that keeps turning beside content the person is trying to read needs a way to stop or hide it.',
      },
      {
        question: 'Does a carousel that pauses while it has focus pass 2.2.2?',
        answer:
          'No. Pausing on focus or hover stops the movement only while the person stays on the carousel, and it starts again as soon as they move on to read something else. Give it a pause or stop button that keeps it still.',
      },
    ],
  },
];
