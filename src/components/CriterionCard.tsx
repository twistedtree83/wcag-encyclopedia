/**
 * One criterion, rendered.
 *
 * All 55 criteria go through this component — the corpus is data, and this is the only place
 * that decides what a card looks like. Later tasks extend it (T-07 the diff, T-09 the demo)
 * rather than forking it.
 *
 * The card is deep-linkable at its bare criterion number and carries `scroll-margin-top`, so
 * a targeted card is never obscured by the sticky header — the site passing 2.4.11 by the
 * same mechanism it documents.
 */

import type { CriterionRecord } from '../criteria/types';
import { LevelBadge } from './LevelBadge';
import { ExamplePair } from './ExamplePair';
import { MarkupDiff } from './MarkupDiff';

export function CriterionCard({ criterion }: { criterion: CriterionRecord }) {
  const headingId = `c-${criterion.num}-heading`;

  return (
    <article id={criterion.num} className="card" aria-labelledby={headingId}>
      <div className="card__head">
        <span className="card__num">{criterion.num}</span>
        <h4 id={headingId} className="card__name">
          {criterion.name}
        </h4>
        <LevelBadge level={criterion.level} />
        <a
          className="card__anchor"
          href={`#${criterion.num}`}
          aria-label={`Link to criterion ${criterion.num}, ${criterion.name}`}
        >
          #
        </a>
      </div>

      <p className="card__plain">
        <strong>In plain English:</strong> {criterion.plain}
      </p>

      <ExamplePair fail={criterion.fail} pass={criterion.pass} />

      {criterion.diff ? <MarkupDiff diff={criterion.diff} /> : null}
    </article>
  );
}
