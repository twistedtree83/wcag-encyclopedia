import { useEffect, useId, useRef, useState } from 'react';
import { FailIcon, PassIcon } from '../../components/Icons';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import { NoticeCard } from './NoticeCard';
import { searchFromSpacing, spacingFromSearch } from './spacingQuery';
import {
  CARD_WINDOW,
  OVERRIDES,
  RESIZE_BOXES,
  RESIZE_START,
  SCALES,
  SPACING_BOXES,
  SPACING_START,
  ordered,
  resizeSaid,
  resizeVerdict,
  spacingSaid,
  spacingVerdict,
  type Override,
  type Resize,
  type Scale,
  type Spacing,
} from '../shared/textFit';
import { ZoomFrame } from '../shared/ZoomFrame';

/** Whether the text fits, as a readout: the same words the model says. */
function FitReadout({ passes, locked }: { readonly passes: boolean; readonly locked: string }) {
  return (
    <li className={passes ? 'ok' : 'bad'}>
      <strong>
        {passes ? <PassIcon /> : <FailIcon />}
        {passes ? 'All the text fits' : 'Text is cut off'}
      </strong>
      <span>{passes ? 'Every box shows all of its text' : `The ${locked} boxes no longer hold their text`}</span>
    </li>
  );
}

/**
 * The 1.4.12 flagship lab (#54): the reader turns on 1.4.12's four text-spacing overrides, one
 * at a time or all four, over a notice card whose boxes are either fixed at their designed
 * height or flexible. The verdict fails when an override reaches a fixed box.
 *
 * The mock is a depicted page: inert and hidden from assistive technology. State is in the URL
 * (`spacingQuery.ts`): the page pre-renders the start, applies the query after mount without
 * announcing it, and writes changes back with `history.replaceState`.
 */

type SpacingModel = { readonly state: Spacing; readonly said: Said | null };

const SPACING_MODEL: SpacingModel = { state: SPACING_START, said: null };

export function TextSpacingLab() {
  const id = useId();
  const [{ state, said }, setModel] = useState<SpacingModel>(SPACING_MODEL);
  const verdict = spacingVerdict(state);
  const all = state.on.length === OVERRIDES.length;

  useEffect(() => {
    const preload = spacingFromSearch(window.location.search);
    if (preload) setModel({ state: preload, said: null });
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromSpacing(state) + hash);
  }, [state]);

  const change = (patch: Partial<Spacing>) =>
    setModel((m) => {
      const next = { ...m.state, ...patch };
      return { state: next, said: { text: spacingSaid(next) } };
    });
  const toggle = (o: Override, on: boolean) =>
    change({ on: ordered(on ? [...state.on, o] : state.on.filter((v) => v !== o)) });

  return (
    <LabShell
      className="lab spacing-lab"
      verdict={verdict}
      said={said}
      onReset={() => setModel(SPACING_MODEL)}
    >
      <div className="fit-mock" data-lab-mock aria-hidden="true" inert>
        <ZoomFrame zoom={100} base={CARD_WINDOW} spacing={state.on} focusable={false}>
          <NoticeCard locked={state.boxes === 'fixed'} />
        </ZoomFrame>
      </div>

      <div className="lab-controls">
        <fieldset className="sem-choice">
          <legend>Text spacing overrides</legend>
          {OVERRIDES.map((o) => (
            <label key={o.value}>
              <input
                type="checkbox"
                checked={state.on.includes(o.value)}
                onChange={(e) => toggle(o.value, e.target.checked)}
              />
              {o.label}
            </label>
          ))}
          <button
            type="button"
            className="btn o sm fit-all"
            onClick={() => change({ on: all ? [] : OVERRIDES.map((o) => o.value) })}
          >
            {all ? 'Clear all four' : 'Apply all four'}
          </button>
        </fieldset>
        <LabChoice
          name={`${id}-boxes`}
          legend="Boxes"
          options={SPACING_BOXES}
          value={state.boxes}
          onChange={(boxes) => change({ boxes })}
        />
      </div>

      <ul className="lab-res fit-res">
        <li>
          <strong>{state.on.length} of 4</strong>
          <span>overrides on</span>
        </li>
        <FitReadout passes={verdict.passes} locked="fixed-height" />
      </ul>
    </LabShell>
  );
}

/**
 * The 1.4.4 lab (#54): the reader scales the notice card's text to 150% or 200%, and switches
 * its boxes between locked in px and flexible. The verdict fails when larger text no longer fits
 * a locked box. The mock is a depicted page, inert and hidden from assistive technology.
 */

type ResizeModel = { readonly state: Resize; readonly said: Said | null };

const RESIZE_MODEL: ResizeModel = { state: RESIZE_START, said: null };

const SCALE_OPTIONS = SCALES.map((s) => ({ value: String(s), label: `${s}%` }));

export function ResizeTextLab() {
  const id = useId();
  const [{ state, said }, setModel] = useState<ResizeModel>(RESIZE_MODEL);
  const verdict = resizeVerdict(state);

  const change = (patch: Partial<Resize>) =>
    setModel((m) => {
      const next = { ...m.state, ...patch };
      return { state: next, said: { text: resizeSaid(next) } };
    });

  return (
    <LabShell
      className="lab resize-lab"
      verdict={verdict}
      said={said}
      onReset={() => setModel(RESIZE_MODEL)}
    >
      <div className="fit-mock" data-lab-mock aria-hidden="true" inert>
        <ZoomFrame zoom={100} base={CARD_WINDOW} textScale={state.scale / 100} focusable={false}>
          <NoticeCard locked={state.boxes === 'locked'} />
        </ZoomFrame>
      </div>

      <div className="lab-controls">
        <LabChoice
          name={`${id}-scale`}
          legend="Text size"
          options={SCALE_OPTIONS}
          value={String(state.scale)}
          onChange={(v) => change({ scale: Number(v) as Scale })}
        />
        <LabChoice
          name={`${id}-boxes`}
          legend="Boxes"
          options={RESIZE_BOXES}
          value={state.boxes}
          onChange={(boxes) => change({ boxes })}
        />
      </div>

      <ul className="lab-res fit-res">
        <li>
          <strong>{16 * (state.scale / 100)}px</strong>
          <span>body text size</span>
        </li>
        <FitReadout passes={verdict.passes} locked="px-locked" />
      </ul>
    </LabShell>
  );
}
