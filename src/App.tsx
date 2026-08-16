/**
 * The page.
 *
 * All four principles and all thirteen guidelines render from here, whether or not the corpus
 * reaches them yet, so every navigation link resolves. Content tasks add records; this
 * structure does not change.
 *
 * Still to come: the header's search and filter controls (T-05), the theme toggle (T-04), and
 * the mobile drawer and viewport preview (T-06). The masthead leaves room for them.
 */

import { CORPUS } from './criteria/corpus';
import { EXPECTED_TOTAL } from './criteria/manifest';
import { GUIDELINES, PRINCIPLES } from './criteria/structure';
import { useCurrentGuideline } from './hooks/useCurrentGuideline';
import { GuidelineSection } from './components/GuidelineSection';
import { PrincipleOpener } from './components/PrincipleOpener';
import { Rail } from './components/Rail';
import { Strip } from './components/Strip';
import { HowToRead } from './sections/HowToRead';
import { ObeysItsOwnRules } from './sections/ObeysItsOwnRules';

export function App() {
  const current = useCurrentGuideline();

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
        <Strip current={current} />
      </header>

      <div className="shell">
        <Rail current={current} />

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

          <HowToRead />

          {PRINCIPLES.map((principle) => (
            <div key={principle.num}>
              <PrincipleOpener principle={principle} />
              {GUIDELINES.filter((g) => g.principle === principle.num).map((g) => (
                <GuidelineSection key={g.num} num={g.num} />
              ))}
            </div>
          ))}

          <ObeysItsOwnRules />
        </main>
      </div>
    </>
  );
}
