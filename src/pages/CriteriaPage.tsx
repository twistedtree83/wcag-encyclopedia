import { useEffect, useState } from 'react';
import { EMPTY_QUERY, countMatches, filterCriteria, type Query } from '../catalog/filter';
import { queryFromSearch, searchFromQuery } from '../catalog/urlQuery';
import { CORPUS, criteriaInPrinciple } from '../criteria/corpus';
import { PRINCIPLES } from '../criteria/structure';
import { CriteriaResults } from '../components/CriteriaResults';
import { Filters } from '../components/Filters';
import { Marker } from '../components/Tags';

/**
 * The All criteria page (design guide 9.3): the page head with the split by principle, then
 * the filter panel and the full grid of index cards.
 *
 * The page is pre-rendered unfiltered, so readers without JavaScript get every criterion. Once
 * hydrated it reads the filters from the URL (`?p=`, `?l=`, `?new`, `?q=`; see urlQuery.ts) and
 * writes them back on every change, so a filtered view can be shared. The query starts empty on
 * both sides and is read from the URL in an effect, so hydration always matches the server.
 */
export function CriteriaPage() {
  const [query, setQuery] = useState<Query>(EMPTY_QUERY);

  useEffect(() => {
    setQuery(queryFromSearch(window.location.search));
  }, []);

  function update(over: Partial<Query>) {
    const next = { ...query, ...over };
    setQuery(next);
    const url = `${window.location.pathname}${searchFromQuery(next)}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', url);
  }

  const shown = filterCriteria(CORPUS, query);
  const counts = countMatches(CORPUS, query);

  return (
    <>
      <section className="ph ph2" aria-labelledby="criteria-title">
        <div>
          <p className="eyebrow">WCAG 2.2 · Levels A and AA</p>
          <h1 id="criteria-title">All {CORPUS.length} criteria</h1>
          <p className="lede">
            Each one in a sentence, with the way it most often goes wrong. Open any criterion to
            see it broken and then fixed.
          </p>
        </div>
        <Split />
      </section>

      <section className="index" aria-label="Search and filter criteria">
        <Filters id="criteria" query={query} onChange={update} />

        <CriteriaResults records={shown} counts={counts} />
      </section>
    </>
  );
}

/** "How they split by principle": a marker, name, count and bar per principle. */
function Split() {
  return (
    <div>
      <h2 className="split-title">How they split by principle</h2>
      <ul className="split">
        {PRINCIPLES.map((p) => {
          const n = criteriaInPrinciple(p.num).length;
          return (
            <li key={p.num}>
              <Marker principle={p.num} />
              <strong>{p.name}</strong>
              <span>
                {n}
                <span className="sr"> criteria</span>
              </span>
              <span className="b" aria-hidden="true">
                <i className={`p${p.num}`} style={{ width: `${(n / CORPUS.length) * 100}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
