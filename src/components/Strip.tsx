/**
 * The "You are in" strip.
 *
 * Deliberately plain text, not a live region: it updates on every scroll, and announcing that
 * would make the page unusable with a screen reader (user story 57). Screen reader users get
 * their position from the rail's `aria-current` and from the heading structure instead.
 */

import { guidelineFor, principleFor, PRINCIPLE_MARKS } from '../criteria/structure';

export function Strip({ current }: { current: string }) {
  const guideline = guidelineFor(current);
  const principle = principleFor(current);
  if (!guideline || !principle) return null;

  const mark = PRINCIPLE_MARKS[principle.num];

  return (
    <p className="strip" aria-hidden="true">
      <span className="strip__label">You are in</span>
      <span
        className={`marker marker--${mark.shape}`}
        style={{ background: `var(--${mark.token})` }}
      />
      <span className="strip__principle" style={{ color: `var(--${mark.token})` }}>
        {principle.name}
      </span>
      <span className="strip__sep">/</span>
      <span>
        {guideline.num} {guideline.name}
      </span>
    </p>
  );
}
