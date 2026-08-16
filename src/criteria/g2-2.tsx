/**
 * Guideline 2.2 — Enough Time.
 *
 * Both criteria come down to the same assumption: that everyone reads, types, and decides at
 * the speed the person who built the thing does.
 */

import type { CriterionRecord } from './types';

export const G2_2: readonly CriterionRecord[] = [
  {
    num: '2.2.1',
    name: 'Timing Adjustable',
    level: 'A',
    guideline: '2.2',
    plain:
      'If something is on a timer, the reader must be able to turn it off, adjust it to at ' +
      'least ten times the default, or extend it — with at least twenty seconds’ warning and a ' +
      'simple action to get more time. Real-time events and hard security limits are exempt.',
    fail: {
      caption: 'Session ends without warning, taking the form with it.',
      render: () => (
        <>
          <div className="notice notice--bad">
            <span className="notice__title">Session expired</span>
            <span>Please sign in again.</span>
          </div>
          <p className="example-note">
            Fifteen minutes, no warning, and the half-finished application is gone. Anyone
            typing with a switch, looking words up, or interrupted by care needs starts over —
            and hits the same wall next time.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A warning, an extension, and the work preserved.',
      render: () => (
        <>
          <div className="notice">
            <span className="notice__title">Still there?</span>
            <span>Your session ends in 2 minutes. Your answers are saved.</span>
            <span className="notice__actions">
              <span className="pill">Give me more time</span>
              <span className="pill">Sign out</span>
            </span>
          </div>
          <p className="example-note">
            Warned well before the limit, extended by one obvious action, and the data survives
            either way. Saving the work is not strictly required by the criterion — it is what
            makes the difference between compliant and kind.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.2.2',
    name: 'Pause, Stop, Hide',
    level: 'A',
    guideline: '2.2',
    demos: ['autoplay-2-2-2'],
    plain:
      'Anything that moves, blinks, scrolls, or auto-updates for more than five seconds needs a ' +
      'way to pause, stop, or hide it — provided it runs alongside other content. Motion in the ' +
      'periphery is genuinely disabling for people with ADHD, vestibular disorders, or low ' +
      'vision using magnification.',
    fail: {
      caption: 'A carousel that advances on its own, with no control.',
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
  },
];
