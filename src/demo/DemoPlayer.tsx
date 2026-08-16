/**
 * The player shell: 16:9 chrome-less browser mock, caption line, transport row.
 *
 * One player, nine timelines. It knows nothing about any particular demo — the caller supplies
 * a timeline and a function that draws a frame. If a demo ever seems to need this component
 * changed, that is a signal the timeline abstraction is wrong; raise it rather than special-
 * casing here.
 *
 * Demos are silent and looping. Captions are on, always — there is no control to turn them
 * off, because there is no audio for them to be redundant with.
 */

import type { ReactNode } from 'react';
import { formatTime, type Frame, type Timeline } from './timeline';
import { useTimeline } from './useTimeline';

export function DemoPlayer<S>({
  timeline,
  render,
}: {
  timeline: Timeline<S>;
  render: (frame: Frame<S>) => ReactNode;
}) {
  const { t, frame, playing, reducedMotion, toggle, seek } = useTimeline(timeline);
  const scrubId = `scrub-${timeline.id}`;

  return (
    <figure className="demo" aria-labelledby={`${timeline.id}-caption`}>
      <div className="demo__stage">{render(frame)}</div>

      <figcaption id={`${timeline.id}-caption`} className="demo__caption">
        <span className="demo__caption-label">Caption</span>
        {frame.caption}
      </figcaption>

      <div className="demo__transport">
        <button
          type="button"
          className="demo__button"
          onClick={toggle}
          aria-label={playing ? `Pause demo: ${timeline.title}` : `Play demo: ${timeline.title}`}
        >
          <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
          {playing ? 'Pause' : 'Play'}
        </button>

        <label className="visually-hidden" htmlFor={scrubId}>
          Scrub position in {timeline.title}
        </label>
        <input
          id={scrubId}
          className="demo__scrub"
          type="range"
          min={0}
          max={timeline.duration}
          step={0.1}
          value={t}
          onChange={(e) => seek(Number.parseFloat(e.target.value))}
        />

        <span className="demo__time">
          {formatTime(t)} / {formatTime(timeline.duration)}
        </span>
        <span className="demo__badge">CC on</span>
        <span className="demo__meta">
          Silent · {reducedMotion ? 'paused for reduced motion' : 'looping'}
        </span>
      </div>
    </figure>
  );
}
