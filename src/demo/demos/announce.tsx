/**
 * Demos — 4.1.2, 3.3.1, 4.1.3, 2.5.8, 2.2.2.
 *
 * Five timelines, no player changes. Screen reader output is drawn as visible speech bubbles;
 * there is no synthesised audio anywhere on this site, and none is needed — the point is
 * *what* is announced, which reads perfectly well.
 */

import type { Frame, Timeline } from '../timeline';

/* --- 4.1.2 Name, Role, Value ---------------------------------------------------------------- */

export type AnnounceState = { readonly labelled: boolean; readonly said: string | null };

export const nameTimeline: Timeline<AnnounceState> = {
  id: 'name-4-1-2',
  title: 'A screen reader on an unlabelled icon button versus a labelled one',
  duration: 18,
  keyframes: [
    { t: 0, state: { labelled: false, said: null }, caption: 'A toolbar of icon-only buttons.' },
    {
      t: 3,
      state: { labelled: false, said: '"button"' },
      caption: 'Focus lands on the first. The screen reader says "button" — and nothing else.',
    },
    {
      t: 6,
      state: { labelled: false, said: '"button"' },
      caption: 'The next one announces identically. All three are "button".',
    },
    {
      t: 9,
      state: { labelled: false, said: '"graphic"' },
      caption: 'The third reads the SVG filename. The reader cannot tell which one deletes.',
    },
    {
      t: 11,
      state: { labelled: true, said: null },
      caption: 'Now with an accessible name on each control.',
    },
    {
      t: 13.5,
      state: { labelled: true, said: '"Save draft, button"' },
      caption: 'Name and role, both announced.',
    },
    {
      t: 16,
      state: { labelled: true, said: '"Delete post, button"' },
      caption: 'The destructive one is identifiable before it is pressed.',
    },
  ],
};

export function renderName(frame: Frame<AnnounceState>): React.ReactNode {
  const { labelled, said } = frame.state;
  const icons = [
    { glyph: '💾', name: 'Save draft' },
    { glyph: '📎', name: 'Attach file' },
    { glyph: '🗑', name: 'Delete post' },
  ];
  const focused = said ? Math.max(0, ['💾', '📎', '🗑'].findIndex((_, i) => (said.includes(icons[i]!.name) || (!labelled && i === (frame.index - 1))))) : -1;

  return (
    <div className="adem">
      <div className="adem__toolbar">
        {icons.map((icon, i) => (
          <span
            key={icon.name}
            className={`adem__icon${i === focused ? ' adem__icon--focused' : ''}`}
          >
            <span aria-hidden="true">{icon.glyph}</span>
            {labelled ? <span className="adem__name">{icon.name}</span> : null}
          </span>
        ))}
      </div>
      <p className={`adem__speech${said ? '' : ' adem__speech--quiet'}`}>
        <span className="adem__speaker">Screen reader</span>
        {said ?? 'silent'}
      </p>
    </div>
  );
}

/* --- 3.3.1 Error Identification ------------------------------------------------------------- */

export type ErrorState = { readonly stage: 'form' | 'generic' | 'inline'; readonly said: string | null };

export const errorTimeline: Timeline<ErrorState> = {
  id: 'errors-3-3-1',
  title: 'Generic "invalid input" versus inline, named, linked errors',
  duration: 16,
  keyframes: [
    { t: 0, state: { stage: 'form', said: null }, caption: 'A short form, filled in and submitted.' },
    {
      t: 3,
      state: { stage: 'generic', said: '"Invalid input"' },
      caption: 'Rejected. A red banner, and every field outlined in red.',
    },
    {
      t: 6,
      state: { stage: 'generic', said: '"Email, edit text"' },
      caption: 'Tabbing back through, the fields announce nothing about being wrong.',
    },
    {
      t: 9,
      state: { stage: 'inline', said: '"1 problem. Email — enter an address that includes a domain."' },
      caption: 'The same rejection, with a summary that names the field and links to it.',
    },
    {
      t: 13,
      state: { stage: 'inline', said: '"Email, invalid entry, enter an address that includes a domain"' },
      caption: 'And at the field itself, the message is part of what the control announces.',
    },
  ],
};

export function renderError(frame: Frame<ErrorState>): React.ReactNode {
  const { stage, said } = frame.state;
  return (
    <div className="adem">
      <div className="adem__form">
        {stage === 'generic' ? <span className="adem__banner adem__banner--bad">Invalid input</span> : null}
        {stage === 'inline' ? (
          <span className="adem__banner">1 problem — Email: enter an address that includes a domain</span>
        ) : null}
        <span className="adem__row">
          Email
          <span
            className={`adem__input${stage !== 'form' ? ' adem__input--bad' : ''}`}
          >
            ada@example
          </span>
        </span>
        {stage === 'inline' ? <span className="adem__err">✕ Enter an address that includes a domain</span> : null}
        <span className="adem__row">
          Postcode
          <span className={`adem__input${stage === 'generic' ? ' adem__input--bad' : ''}`}>
            SW1A 1AA
          </span>
        </span>
      </div>
      <p className={`adem__speech${said ? '' : ' adem__speech--quiet'}`}>
        <span className="adem__speaker">Screen reader</span>
        {said ?? 'silent'}
      </p>
    </div>
  );
}

/* --- 4.1.3 Status Messages ------------------------------------------------------------------- */

export type LiveState = { readonly count: number; readonly live: boolean; readonly said: string | null };

export const liveTimeline: Timeline<LiveState> = {
  id: 'live-4-1-3',
  title: 'A live region announcing an asynchronous cart update',
  duration: 10,
  keyframes: [
    { t: 0, state: { count: 3, live: false, said: null }, caption: 'A basket with three items.' },
    {
      t: 2,
      state: { count: 4, live: false, said: null },
      caption: 'Add is pressed. The counter changes in the corner — and nothing is announced.',
    },
    {
      t: 4.5,
      state: { count: 4, live: true, said: null },
      caption: 'The same page, now with a live region present in the DOM before it is filled.',
    },
    {
      t: 6.5,
      state: { count: 5, live: true, said: '"Added. 5 items in basket."' },
      caption: 'Add is pressed. The change is spoken without focus moving.',
    },
    {
      t: 9,
      state: { count: 5, live: true, said: null },
      caption: 'Focus never left the Add button, so the reader can keep shopping.',
    },
  ],
};

export function renderLive(frame: Frame<LiveState>): React.ReactNode {
  const { count, live, said } = frame.state;
  return (
    <div className="adem">
      <div className="adem__cart">
        <span className="adem__badge">Basket ({count})</span>
        <span className="adem__addbtn adem__icon--focused">Add to basket</span>
      </div>
      <p className="adem__region">
        {live ? 'role="status" present' : 'no live region'}
      </p>
      <p className={`adem__speech${said ? '' : ' adem__speech--quiet'}`}>
        <span className="adem__speaker">Screen reader</span>
        {said ?? 'silent'}
      </p>
    </div>
  );
}

/* --- 2.5.8 Target Size ----------------------------------------------------------------------- */

export type TargetState = { readonly size: number; readonly tipAt: number };

export const targetTimeline: Timeline<TargetState> = {
  id: 'targets-2-5-8',
  title: 'Tap targets at 18px versus 24px with a fingertip overlay',
  duration: 9,
  keyframes: [
    { t: 0, state: { size: 18, tipAt: 0 }, caption: 'Three 18px controls, packed together.' },
    {
      t: 2,
      state: { size: 18, tipAt: 1 },
      caption: 'A fingertip is about 45px across. It covers all three at once.',
    },
    {
      t: 4,
      state: { size: 18, tipAt: 2 },
      caption: 'Aiming for retweet, the contact point is centred on delete.',
    },
    { t: 6, state: { size: 24, tipAt: 2 }, caption: 'The same icons in 24px targets, via padding.' },
    {
      t: 7.5,
      state: { size: 24, tipAt: 1 },
      caption: 'The intended target now owns enough of the contact patch to win.',
    },
  ],
};

export function renderTarget(frame: Frame<TargetState>): React.ReactNode {
  const { size, tipAt } = frame.state;
  const glyphs = ['★', '↻', '✕'];
  return (
    <div className="adem">
      <div className="tdem">
        <div className="tdem__row">
          {glyphs.map((g) => (
            <span key={g} className="tdem__target" style={{ width: size, height: size }}>
              {g}
            </span>
          ))}
          <span
            aria-hidden="true"
            className="tdem__tip"
            style={{ left: `calc(${tipAt} * (${size}px + 0.25rem))` }}
          />
        </div>
      </div>
      <p className="adem__region">{size}px targets · 45px fingertip</p>
    </div>
  );
}

/* --- 2.2.2 Pause, Stop, Hide ------------------------------------------------------------------ */

export type CarouselState = { readonly slide: number; readonly pausable: boolean; readonly paused: boolean };

export const carouselTimeline: Timeline<CarouselState> = {
  id: 'autoplay-2-2-2',
  title: 'An autoplaying carousel versus one with a pause control',
  duration: 12,
  keyframes: [
    { t: 0, state: { slide: 0, pausable: false, paused: false }, caption: 'A carousel with no controls.' },
    { t: 2, state: { slide: 1, pausable: false, paused: false }, caption: 'It advances after four seconds, mid-sentence.' },
    { t: 4, state: { slide: 2, pausable: false, paused: false }, caption: 'And again. A slow reader never finishes a slide.' },
    { t: 6, state: { slide: 0, pausable: true, paused: false }, caption: 'The same carousel with a pause control in the tab order.' },
    { t: 8, state: { slide: 1, pausable: true, paused: false }, caption: 'It still advances — until the reader says otherwise.' },
    { t: 10, state: { slide: 1, pausable: true, paused: true }, caption: 'Paused. The slide stays put for as long as it is needed.' },
  ],
};

export function renderCarousel(frame: Frame<CarouselState>): React.ReactNode {
  const { slide, pausable, paused } = frame.state;
  return (
    <div className="adem">
      <div className="cdem">
        <span className="cdem__stage">Slide {slide + 1} of 3</span>
        <span className="cdem__dots">
          {pausable ? (
            <span className={`cdem__pause${paused ? ' cdem__pause--on' : ''}`}>
              {paused ? '▶ Play' : '❚❚ Pause'}
            </span>
          ) : null}
          {[0, 1, 2].map((i) => (
            <span key={i} className={`cdem__dot${i === slide ? ' cdem__dot--on' : ''}`} />
          ))}
        </span>
      </div>
      <p className="adem__region">
        {pausable ? (paused ? 'paused by the reader' : 'auto-advancing, pausable') : 'auto-advancing, no control'}
      </p>
    </div>
  );
}
