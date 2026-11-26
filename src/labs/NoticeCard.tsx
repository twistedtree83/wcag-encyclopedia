import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { boxesIn, clippedIn } from '../live/clip';

/**
 * A notice card (#54), as the 1.4.12 and 1.4.4 labs and live examples draw it in the zoom frame.
 * Its text is sized in em, so the frame's text size reaches it, and set in the system font, so
 * no late web font changes it after it is measured.
 *
 * Its two boxes (`data-box`): the notice's two paragraphs, and a one-line "Renews" tag.
 *
 *   locked     each box is fixed, in px, at the size its text had as designed (measured once, at
 *              mount, before any override or larger text), and clips what no longer fits
 *   flexible   the boxes have no size of their own and grow with their text
 *
 * The card marks itself `data-clipped` when any box holds more text than it shows, so e2e can
 * check the measurement agrees with the lab's model.
 */

type Size = { readonly width: number; readonly height: number };


export function NoticeCard({ locked }: { readonly locked: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  /** Each box's size as designed; null until measured (the server can't know it). */
  const [designed, setDesigned] = useState<readonly Size[] | null>(null);
  const [clipped, setClipped] = useState(false);

  useLayoutEffect(() => {
    if (!root.current) return;
    setDesigned(boxesIn(root.current).map((b) => ({ width: b.offsetWidth, height: b.offsetHeight })));
  }, []);
  useLayoutEffect(() => {
    const now = clippedIn(root.current);
    setClipped((c) => (c === now ? c : now));
  });

  const lock = (i: number): CSSProperties | undefined => {
    const size = locked ? designed?.[i] : undefined;
    return size && { width: `${size.width}px`, height: `${size.height}px` };
  };

  return (
    <div
      className={locked ? 'ncard ncard--locked' : 'ncard'}
      ref={root}
      data-clipped={designed ? String(clipped) : undefined}
    >
      <span className="ncard__title">Your plan</span>
      <div className="ncard__body" data-box style={lock(0)}>
        <p>Your subscription renews on 4 March and can be cancelled any time before then.</p>
        <p>We will email a reminder a week before it renews.</p>
      </div>
      <span className="ncard__tag" data-box style={lock(1)}>
        Renews on 4 March
      </span>
    </div>
  );
}
