/**
 * The chapter opener introducing a principle: ordinal, name, one-sentence definition, and the
 * list of its guidelines.
 */

import { GUIDELINES, PRINCIPLE_MARKS } from '../criteria/structure';
import type { Principle } from '../criteria/types';

export function PrincipleOpener({ principle }: { principle: Principle }) {
  const mark = PRINCIPLE_MARKS[principle.num];
  const guidelines = GUIDELINES.filter((g) => g.principle === principle.num);
  const headingId = `p${principle.num}-heading`;

  return (
    <section
      id={`p${principle.num}`}
      className="opener"
      aria-labelledby={headingId}
      style={{
        background: `var(--${mark.token}-wash)`,
        borderTopColor: `var(--${mark.token})`,
      }}
    >
      <div className="opener__inner">
        <span aria-hidden="true" className="opener__ordinal" style={{ color: `var(--${mark.token})` }}>
          {principle.num}
        </span>
        <div className="opener__body">
          <p className="opener__eyebrow" style={{ color: `var(--${mark.token})` }}>
            <span
              aria-hidden="true"
              className={`marker marker--${mark.shape}`}
              style={{ background: `var(--${mark.token})` }}
            />
            Principle {principle.num} of 4
          </p>
          <h2 id={headingId} className="opener__name">
            {principle.name}
          </h2>
          <p className="opener__tagline">{principle.tagline}</p>
          <p className="opener__blurb">{principle.blurb}</p>
          <ul className="opener__list">
            {guidelines.map((g) => (
              <li key={g.num}>
                <a className="opener__link" href={`#g${g.num}`}>
                  <span className="opener__num" style={{ color: `var(--${mark.token})` }}>
                    {g.num}
                  </span>
                  {g.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
