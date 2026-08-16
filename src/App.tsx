/**
 * The page.
 *
 * T-02 renders the minimum honest slice: a title, one guideline section, and the criteria the
 * corpus actually contains. The header, rail, scroll-spy, principle openers, and the rest of
 * the chrome are T-03's; the filter and search are T-05's. Nothing here pretends to
 * navigation that does not yet work.
 */

import { CORPUS, criteriaFor, populatedGuidelines } from './criteria/corpus';
import { guidelineFor, principleFor } from './criteria/structure';
import { CriterionCard } from './components/CriterionCard';
import { EXPECTED_TOTAL } from './criteria/manifest';

function GuidelineSection({ num }: { num: string }) {
  const guideline = guidelineFor(num);
  const principle = principleFor(num);
  const criteria = criteriaFor(num);
  if (!guideline || !principle) return null;

  return (
    <section
      id={`g${num}`}
      data-guideline={num}
      className="guideline"
      aria-labelledby={`g${num}-heading`}
    >
      <div className="guideline__head">
        <span className="guideline__num">{guideline.num}</span>
        <h3 id={`g${num}-heading`} className="guideline__name">
          {guideline.name}
        </h3>
        <span className="guideline__meta">
          Principle {principle.num} · {principle.name}
        </span>
      </div>
      <div className="guideline__cards">
        {criteria.map((c) => (
          <CriterionCard key={c.num} criterion={c} />
        ))}
      </div>
    </section>
  );
}

export function App() {
  const guidelines = populatedGuidelines();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="masthead">
        <div className="masthead__inner">
          <span className="masthead__eyebrow">WCAG 2.2</span>
          <span className="masthead__title">Visual Encyclopedia</span>
        </div>
      </header>

      <main id="main" className="main">
        <section className="hero" aria-labelledby="title">
          <p className="hero__eyebrow">
            A field guide to the Web Content Accessibility Guidelines
          </p>
          <h1 id="title" className="hero__h1">
            Every WCAG 2.2 criterion, shown rather than described.
          </h1>
          <p className="hero__lede">
            Four principles, thirteen guidelines, and a card for each success criterion: a
            plain-English restatement, a failing example, and the same interface after it
            passes. Everything on this page obeys the criteria it documents.
          </p>
          <dl className="facts">
            <div>
              <dt>Version</dt>
              <dd>WCAG 2.2</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>Level AA</dd>
            </div>
            <div>
              <dt>Structure</dt>
              <dd>4 / 13</dd>
            </div>
            <div>
              <dt>Documented</dt>
              <dd>
                {CORPUS.length} / {EXPECTED_TOTAL}
              </dd>
            </div>
          </dl>
        </section>

        {guidelines.map((num) => (
          <GuidelineSection key={num} num={num} />
        ))}
      </main>
    </>
  );
}
