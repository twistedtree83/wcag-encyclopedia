/**
 * Demo — 1.4.10 Reflow.
 *
 * A catalogue page narrowing from 1280 to 320 CSS pixels. The columns collapse to one, the
 * navigation becomes a menu button, and no horizontal scrollbar ever appears.
 *
 * The authored state is just the viewport width; everything visible is derived from it, the
 * same way a real responsive layout derives from the real viewport. Width interpolates between
 * keyframes using `frame.progress`, so the narrowing is smooth while the caption steps.
 */

import { lerp, type Frame, type Timeline } from '../timeline';

export type ReflowState = { readonly width: number };

export const reflowTimeline: Timeline<ReflowState> = {
  id: 'reflow-1-4-10',
  title: 'A catalogue page reflowing from 1280px to 320px',
  duration: 12,
  // Captions step while the width interpolates, so each one has to stay true for the whole
  // span it is in effect — a caption naming a single width would contradict the live ruler
  // a fraction of a second later. They name the breakpoints instead, which is also the more
  // useful thing to teach.
  keyframes: [
    { t: 0, state: { width: 1280 }, caption: 'Full width: a three-column catalogue with inline navigation.' },
    { t: 3, state: { width: 900 }, caption: 'The tiles narrow first. Above 780px all three columns still fit.' },
    { t: 6, state: { width: 620 }, caption: 'Below 780px the grid drops to two columns.' },
    { t: 9, state: { width: 400 }, caption: 'Below 520px it is a single column and the navigation collapses to a menu button.' },
    { t: 11, state: { width: 320 }, caption: 'At 320px everything is still reachable — one column, no horizontal scrollbar.' },
  ],
};

/** The mock page, laid out from the width alone. */
export function renderReflow(frame: Frame<ReflowState>): React.ReactNode {
  const next = reflowTimeline.keyframes[frame.index + 1];
  const width = next
    ? lerp(frame.state.width, next.state.width, frame.progress)
    : frame.state.width;

  const columns = width >= 780 ? 3 : width >= 520 ? 2 : 1;
  const menu = width < 520;

  return (
    <div className="reflow">
      {/* The frame narrows; its contents lay out against it via container queries. */}
      <div className="reflow__viewport" style={{ width: `${(width / 1280) * 100}%` }}>
        <div className="reflow__page">
          <div className="reflow__bar">
            <span className="reflow__logo" aria-hidden="true" />
            <span className="reflow__brand">Northbound</span>
            {menu ? (
              <span className="reflow__menu" aria-hidden="true">
                ☰
              </span>
            ) : (
              <span className="reflow__nav">Catalogue · Orders · Account</span>
            )}
          </div>
          <div
            className="reflow__grid"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            <span className="reflow__tile" />
            <span className="reflow__tile" />
            <span className="reflow__tile" />
          </div>
          <div className="reflow__lines">
            <span className="reflow__line reflow__line--head" />
            <span className="reflow__line" />
            <span className="reflow__line reflow__line--short" />
          </div>
        </div>
      </div>
      <p className="reflow__ruler" aria-hidden="true">
        {Math.round(width)} px
      </p>
    </div>
  );
}
