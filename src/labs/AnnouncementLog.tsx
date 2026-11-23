import { useLayoutEffect, useState, type RefObject } from 'react';
import { announce, fromDom, spoken, type Announcement } from './announce';

/**
 * The announcement log instrument (CONTEXT.md): what a screen reader would say about a piece of
 * markup, shown as text. `announce.ts` does the computing; this file reads the rendered DOM and
 * draws the lines. See the notes in `announce.ts` for the subset of naming rules it follows.
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   const lines = useAnnouncementLog(ref, state);   // re-read whenever `state` changes
 *   <div ref={ref} aria-hidden="true" inert>…the mock…</div>
 *   <AnnouncementLog id={id} lines={lines} />
 *
 * The log is read after each commit, so it is empty in the pre-rendered page and fills in on
 * hydration. It is not a live region: a lab tells the shell what to say through `said`.
 */

const same = (a: readonly Announcement[], b: readonly Announcement[]) =>
  a.length === b.length && a.every((l, i) => spoken(l) === spoken(b[i]!) && l.role === b[i]!.role);

/** The lines for the element in `ref`, re-read after any render where `key` changed. */
export function useAnnouncementLog(
  ref: RefObject<Element | null>,
  key: unknown,
): readonly Announcement[] {
  const [lines, setLines] = useState<readonly Announcement[]>([]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const next = announce(fromDom(ref.current));
    setLines((prev) => (same(prev, next) ? prev : next));
  }, [ref, key]);
  return lines;
}

export function AnnouncementLog({
  id,
  lines,
  title = 'Screen reader says',
}: {
  /** Prefix for the heading's id. */
  readonly id: string;
  readonly lines: readonly Announcement[];
  readonly title?: string;
}) {
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-alog`}>
        {title}
      </p>
      <ol aria-labelledby={`${id}-alog`}>
        {lines.map((line, i) => (
          <li key={i} className={line.role ? undefined : 'alog__text'}>
            {spoken(line)}
          </li>
        ))}
      </ol>
    </div>
  );
}
