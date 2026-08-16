/**
 * The mobile navigation drawer — the rail's replacement below the rail breakpoint.
 *
 * Built on native `<dialog>` and `showModal()`, which gives focus trapping, Escape to close,
 * inertness of the rest of the page, and focus restoration to the trigger — all behaviours we
 * would otherwise hand-roll and get subtly wrong. A hand-rolled focus trap is one of the most
 * common sources of keyboard traps (2.1.2), and the platform already has a correct one.
 *
 * It carries its own copy of the search and level controls, because at this width the masthead
 * has no room for them and a reader on a phone still has to be able to filter.
 */

import { useEffect, useRef } from 'react';
import { GUIDELINES, PRINCIPLES, PRINCIPLE_MARKS } from '../criteria/structure';
import { Controls } from './Controls';
import type { Query } from '../catalog/filter';

export function Drawer({
  open,
  onClose,
  query,
  onQueryChange,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  query: Query;
  onQueryChange: (next: Query) => void;
  summary: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-label="Guidelines"
      // Escape and the backdrop both route through the same close, so React state and the
      // dialog's own open state cannot drift apart.
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="drawer__head">
        <span className="drawer__heading">Contents</span>
        <button type="button" className="drawer__close" onClick={onClose}>
          Close ✕
        </button>
      </div>

      <Controls query={query} onChange={onQueryChange} summary={summary} idPrefix="drawer" />

      <nav className="drawer__nav" aria-label="Guidelines">
        {PRINCIPLES.map((principle) => {
          const mark = PRINCIPLE_MARKS[principle.num];
          return (
            <div key={principle.num}>
              <p className="drawer__principle" style={{ color: `var(--${mark.token})` }}>
                <span
                  aria-hidden="true"
                  className={`marker marker--${mark.shape}`}
                  style={{ background: `var(--${mark.token})` }}
                />
                {principle.num} · {principle.name}
              </p>
              <ul className="drawer__list">
                {GUIDELINES.filter((g) => g.principle === principle.num).map((g) => (
                  <li key={g.num}>
                    <a className="drawer__link" href={`#g${g.num}`} onClick={onClose}>
                      <span className="rail__num">{g.num}</span> {g.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </dialog>
  );
}
