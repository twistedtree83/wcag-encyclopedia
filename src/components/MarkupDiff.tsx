/**
 * A markup or CSS diff, for criteria whose point is code rather than perception.
 *
 * Changed lines carry a `-` or `+` glyph in the gutter *as well as* a tint and a border,
 * so the diff reads with colour removed entirely. That is the page obeying 1.4.1 while
 * documenting it — and the reason the glyph is real text in the gutter rather than a
 * background image or a pseudo-element colour.
 *
 * Long lines scroll inside the block; the page never scrolls horizontally (1.4.10).
 */

import type { Diff } from '../criteria/types';

const GLYPH = { context: ' ', del: '-', add: '+' } as const;
const LABEL = { context: '', del: 'removed', add: 'added' } as const;

export function MarkupDiff({ diff }: { diff: Diff }) {
  return (
    <figure className="diff">
      <figcaption className="diff__caption">
        Markup diff <span className="diff__where">— {diff.title}</span>
      </figcaption>
      {/*
        The block scrolls horizontally when a line is long, which makes it a scrollable
        region — so it has to be reachable and scrollable by keyboard alone (2.1.1), and it
        needs a name to be worth landing on. Without tabindex a keyboard user simply cannot
        read the end of a long line.
      */}
      <pre className="diff__pre" tabIndex={0} role="region" aria-label={`Markup diff: ${diff.title}`}>
        <code>
          {diff.lines.map((line, i) => (
            <span key={i} className={`diff__line diff__line--${line.kind}`}>
              <span className="diff__gutter" aria-hidden="true">
                {GLYPH[line.kind]}
              </span>
              {LABEL[line.kind] ? (
                <span className="visually-hidden">{LABEL[line.kind]}: </span>
              ) : null}
              {line.text}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      <p className="diff__note">{diff.note}</p>
    </figure>
  );
}
