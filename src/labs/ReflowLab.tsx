import { useEffect, useId, useRef, useState } from 'react';
import { FailIcon, PassIcon } from '../components/Icons';
import { LabChoice } from './LabChoice';
import { LabShell, type Said } from './LabShell';
import { LAYOUTS, REFLOW_START, reflowSaid, reflowVerdict, sideways, type Layout, type Reflow } from './reflow';
import { reflowFromSearch, searchFromReflow } from './reflowQuery';
import { ZOOMS, scrollLine, viewportAt, type Zoom } from './zoom';
import { ZoomFrame } from './ZoomFrame';

/**
 * A catalogue page, as the 1.4.10 lab and live examples draw it in the zoom frame. Sized in em
 * so the frame's text size reaches it. Always taller than the window, so it always scrolls down.
 *
 *   fixed    a 60em (960px) page with three 18em-wide tracks: never narrows
 *   reflow   the same page with no width, and tracks that drop to one column
 */
export function CataloguePage({ layout }: { layout: Layout }) {
  return (
    <div className={`zpage zpage--${layout}`}>
      <div className="zpage__bar">
        <span className="zpage__brand">Northbound</span>
        <span>Catalogue · Orders · Account</span>
      </div>
      <p className="zpage__title">Winter catalogue</p>
      <p>Six coats for the cold months, each made to order in our own workshop.</p>
      <div className="zpage__grid">
        {['Rust overshirt', 'Field parka', 'Wool duffle', 'Rain shell', 'Quilted liner', 'Storm cape'].map(
          (name) => (
            <span key={name} className="zpage__tile">
              {name}
            </span>
          ),
        )}
      </div>
      <p>Free returns within 30 days. Delivery takes three to five working days.</p>
    </div>
  );
}

/**
 * The 1.4.10 flagship lab (#53): the reader zooms the frame to 200% or 400% and switches the
 * catalogue between a fixed-width layout and a reflowing one. The verdict fails when the page
 * scrolls sideways as well as down.
 *
 * The mock is a depicted page: inert and hidden from assistive technology, since at 400% the
 * fixed layout is the failure itself. State is in the URL (`reflowQuery.ts`): the page
 * pre-renders the start, applies the query after mount without announcing it, and writes
 * changes back with `history.replaceState`.
 */

type Model = { readonly state: Reflow; readonly said: Said | null };

const START: Model = { state: REFLOW_START, said: null };

const ZOOM_OPTIONS = ZOOMS.map((z) => ({ value: String(z), label: `${z}%` }));

export function ReflowLab() {
  const id = useId();
  const [{ state, said }, setModel] = useState<Model>(START);
  const win = viewportAt(state.zoom);
  const scrolls = sideways(state);

  useEffect(() => {
    const preload = reflowFromSearch(window.location.search);
    if (preload) setModel({ state: preload, said: null });
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromReflow(state) + hash);
  }, [state]);

  const change = (patch: Partial<Reflow>) =>
    setModel((m) => {
      const next = { ...m.state, ...patch };
      return { state: next, said: { text: reflowSaid(next) } };
    });

  return (
    <LabShell
      className="lab reflow-lab"
      verdict={reflowVerdict(state)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="reflow-mock" data-lab-mock aria-hidden="true" inert>
        <ZoomFrame zoom={state.zoom} focusable={false}>
          <CataloguePage layout={state.layout} />
        </ZoomFrame>
      </div>

      <div className="lab-controls">
        <LabChoice
          name={`${id}-zoom`}
          legend="Zoom"
          options={ZOOM_OPTIONS}
          value={String(state.zoom)}
          onChange={(v) => change({ zoom: Number(v) as Zoom })}
        />
        <LabChoice
          name={`${id}-layout`}
          legend="Page layout"
          options={LAYOUTS}
          value={state.layout}
          onChange={(layout) => change({ layout })}
        />
      </div>

      <ul className="lab-res reflow-res">
        <li>
          <strong>
            {win.width} by {win.height}
          </strong>
          <span>CSS pixels in the window</span>
        </li>
        <li className={scrolls ? 'bad' : 'ok'}>
          <strong>
            {scrolls ? <FailIcon /> : <PassIcon />}
            {scrollLine({ sideways: scrolls, down: true })}
          </strong>
          <span>{scrolls ? 'The page is wider than the window' : 'The page fits the window’s width'}</span>
        </li>
      </ul>
    </LabShell>
  );
}
