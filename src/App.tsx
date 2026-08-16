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
import { useState } from 'react';
import { useCurrentGuideline } from './hooks/useCurrentGuideline';
import { useTheme } from './theme/useTheme';
import { GuidelineSection } from './components/GuidelineSection';
import { PrincipleOpener } from './components/PrincipleOpener';
import { Rail } from './components/Rail';
import { Strip } from './components/Strip';
import { Controls } from './components/Controls';
import { Drawer } from './components/Drawer';
import { useViewport, VIEWPORTS, type ViewportName } from './hooks/useViewport';
import { EMPTY_QUERY, countMatches, summarise, type Query } from './catalog/filter';
import { HowToRead } from './sections/HowToRead';
import { ObeysItsOwnRules } from './sections/ObeysItsOwnRules';
import { DemoLibrary } from './sections/DemoLibrary';

export function App() {
  const current = useCurrentGuideline();
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState<Query>(EMPTY_QUERY);
  const summary = summarise(countMatches(CORPUS, query), query);
  const { viewport, width, setViewport, navOpen, setNavOpen } = useViewport();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="preview-bar">
        <span className="preview-bar__label" id="viewport-label">
          Preview width
        </span>
        <fieldset className="viewport-picker" aria-labelledby="viewport-label">
          {(Object.keys(VIEWPORTS) as ViewportName[]).map((name) => (
            <button
              key={name}
              type="button"
              className="controls__seg"
              aria-pressed={viewport === name}
              onClick={() => setViewport(name)}
            >
              {VIEWPORTS[name].label}
            </button>
          ))}
        </fieldset>
      </div>

      {/*
        The preview frame. `container-type: inline-size` on it is what makes the preview
        honest: everything inside sizes against this box rather than the browser window, so
        narrowing it exercises the same code paths a real 320px screen would.
      */}
      <div
        className="preview"
        data-viewport={viewport}
        style={width === null ? undefined : { width: `${width}px` }}
      >
        <header className="masthead">
        <div className="masthead__inner">
          <span className="masthead__eyebrow">WCAG 2.2</span>
          <span className="masthead__title">Visual Encyclopedia</span>

          <button type="button" className="theme-toggle" onClick={toggle}>
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
            {/* The label names the action, not the current state — a button labelled
                "Dark" is ambiguous about which one it does. */}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <button type="button" className="nav-toggle" onClick={() => setNavOpen(true)}>
            ☰ Guidelines
          </button>
        </div>

        <Controls query={query} onChange={setQuery} summary={summary} idPrefix="masthead" />
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
                <GuidelineSection key={g.num} num={g.num} query={query} />
              ))}
            </div>
          ))}

          <DemoLibrary />

          <ObeysItsOwnRules />
        </main>
      </div>

        <Drawer
          open={navOpen}
          onClose={() => setNavOpen(false)}
          query={query}
          onQueryChange={setQuery}
          summary={summary}
        />
      </div>
    </>
  );
}
