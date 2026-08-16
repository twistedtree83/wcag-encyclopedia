/**
 * The demo library: an index of all nine demos.
 *
 * Every demo is reachable two ways — from its criterion card while reading the standard in
 * order, and from here when the reader wants to browse the demos themselves. Entries that are
 * not yet authored render as clearly-marked placeholders rather than dead links.
 */

import { DEMO_CATALOGUE } from '../demo/catalogue';
import { demoById } from '../demo/registry';
import { criterion } from '../criteria/corpus';
import { formatTime } from '../demo/timeline';

export function DemoLibrary() {
  const ready = DEMO_CATALOGUE.filter((d) => demoById(d.id)).length;

  return (
    <section className="library" aria-labelledby="library-heading">
      <div className="library__head">
        <h2 id="library-heading" className="library__title">
          Demo library
        </h2>
        <span className="library__count">
          {ready} of {DEMO_CATALOGUE.length} authored
        </span>
      </div>
      <p className="library__lede">
        Silent, looping, captioned animations of the criteria whose point is temporal — focus
        moving, a layout reflowing, a screen reader announcing. Each one is a timeline the
        reader can pause and scrub, not a video.
      </p>

      <ul className="library__grid">
        {DEMO_CATALOGUE.map((entry) => {
          const authored = demoById(entry.id);
          const record = criterion(entry.criterion);
          return (
            <li key={entry.id} className="library__item">
              <span
                aria-hidden="true"
                className={`library__thumb${authored ? '' : ' library__thumb--pending'}`}
              >
                {authored ? '▶' : 'To come'}
              </span>
              <span className="library__num">{entry.criterion}</span>
              <span className="library__desc">
                {authored ? (
                  <a href={`#${entry.criterion}`}>{entry.description}</a>
                ) : (
                  entry.description
                )}
              </span>
              <span className="library__meta">
                {formatTime(entry.duration)} · captioned
                {record ? ` · ${record.name}` : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
