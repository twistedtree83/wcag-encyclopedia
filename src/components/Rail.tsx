/**
 * The left rail: all thirteen guidelines, grouped by principle, tracking scroll position.
 *
 * Each principle carries an accent hue *and* a marker shape. The active guideline is marked
 * with a filled bar and `aria-current`, so the "you are here" signal reaches screen readers
 * through semantics rather than through colour.
 */

import { GUIDELINES, PRINCIPLES, PRINCIPLE_MARKS } from '../criteria/structure';
import type { Principle } from '../criteria/types';

function PrincipleGroup({ principle, current }: { principle: Principle; current: string }) {
  const mark = PRINCIPLE_MARKS[principle.num];
  const guidelines = GUIDELINES.filter((g) => g.principle === principle.num);

  return (
    <>
      <p className="rail__principle" style={{ color: `var(--${mark.token})` }}>
        <span
          aria-hidden="true"
          className={`marker marker--${mark.shape}`}
          style={{ background: `var(--${mark.token})` }}
        />
        {principle.num} · {principle.name}
      </p>
      <ul className="rail__list">
        {guidelines.map((g) => {
          const active = g.num === current;
          return (
            <li key={g.num} className="rail__item">
              <span
                aria-hidden="true"
                className="rail__bar"
                style={{ background: active ? `var(--${mark.token})` : 'var(--rule)' }}
              />
              <a
                className="rail__link"
                href={`#g${g.num}`}
                {...(active ? { 'aria-current': 'true' as const } : {})}
              >
                <span className="rail__num">{g.num}</span> {g.name}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function Rail({ current }: { current: string }) {
  return (
    <nav className="rail" aria-label="Guidelines">
      <p className="rail__heading">Contents</p>
      {PRINCIPLES.map((p) => (
        <PrincipleGroup key={p.num} principle={p} current={current} />
      ))}
      <p className="rail__note">
        Level A and AA are documented in full. AAA criteria appear where they change a common
        pattern.
      </p>
    </nav>
  );
}
