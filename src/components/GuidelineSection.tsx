/**
 * One guideline: its heading, and the cards for the criteria authored under it.
 *
 * All thirteen render from the first commit, whether or not the corpus reaches them yet, so
 * every rail link and every opener link resolves to a real destination. A guideline with no
 * authored criteria says so plainly rather than appearing broken — and it states how many are
 * coming, from the manifest, so the placeholder cannot drift from the plan.
 */

import { criteriaFor } from '../criteria/corpus';
import { EXPECTED } from '../criteria/manifest';
import { guidelineFor, principleFor, PRINCIPLE_MARKS } from '../criteria/structure';
import { CriterionCard } from './CriterionCard';

export function GuidelineSection({ num }: { num: string }) {
  const guideline = guidelineFor(num);
  const principle = principleFor(num);
  if (!guideline || !principle) return null;

  const mark = PRINCIPLE_MARKS[principle.num];
  const criteria = criteriaFor(num);
  const expected = EXPECTED.filter((e) => e.guideline === num);
  const headingId = `g${num}-heading`;

  return (
    <section
      id={`g${num}`}
      data-guideline={num}
      className="guideline"
      aria-labelledby={headingId}
    >
      <div className="guideline__head">
        <span className="guideline__num" style={{ color: `var(--${mark.token})` }}>
          {guideline.num}
        </span>
        <h3 id={headingId} className="guideline__name">
          {guideline.name}
        </h3>
        <span className="guideline__meta">
          Principle {principle.num} · {principle.name}
        </span>
      </div>

      {criteria.length > 0 ? (
        <div className="guideline__cards">
          {criteria.map((c) => (
            <CriterionCard key={c.num} criterion={c} />
          ))}
        </div>
      ) : (
        <p className="guideline__pending">
          Not yet documented — {expected.length}{' '}
          {expected.length === 1 ? 'criterion' : 'criteria'} to come:{' '}
          {expected.map((e) => e.num).join(', ')}.
        </p>
      )}
    </section>
  );
}
