import { useEffect, useId, useRef, useState } from 'react';
import { FailIcon, PassIcon } from '../../components/Icons';
import {
  BUTTON_BG,
  BUTTON_TEXT,
  MAX_PX,
  PAGE_BG,
  RING_CHECK,
  RING_COLOURS,
  RING_START,
  hexOf,
  ringCheck,
  ringSaid,
  ringVerdict,
  type Ring,
} from './focusRing';
import { LabShell, type Said } from '../shared/LabShell';
import { ringFromSearch, searchFromRing } from './ringQuery';

/**
 * The 2.4.7 flagship lab (#44): the reader styles the focus ring on a dark "Save" button
 * (thickness, offset, colour) and sees whether it stays visible. The verdict is the contrast
 * engine against the site's non-text threshold, on each colour the ring touches (`focusRing.ts`).
 *
 * The mock is a depicted design: inert and hidden from assistive technology, drawn in fixed
 * colours, so a ring the reader made invisible is never a real focus indicator on this page.
 *
 * State is in the URL (`ringQuery.ts`): the page pre-renders the start, applies the query after
 * mount without announcing it, and writes changes back with `history.replaceState`.
 */

type Model = { readonly ring: Ring; readonly said: Said | null };

const START: Model = { ring: RING_START, said: null };

/** A labelled range with its value in words. Shared with the 2.4.1 and 2.4.11 labs (#46). */
export function Slider({
  id,
  label,
  value,
  text,
  onChange,
  min = 0,
  max = MAX_PX,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;
  text: string;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="slide">
      <label htmlFor={id}>
        <span>{label}</span>
        <span>{text}</span>
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={text}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </div>
  );
}

export function FocusRingLab() {
  const id = useId();
  const [{ ring, said }, setModel] = useState<Model>(START);
  const check = ringCheck(ring);

  useEffect(() => {
    const preload = ringFromSearch(window.location.search);
    if (preload) setModel({ ring: preload, said: null });
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromRing(ring) + hash);
  }, [ring]);

  const change = (patch: Partial<Ring>) =>
    setModel((m) => {
      const next = { ...m.ring, ...patch };
      return { ring: next, said: { text: ringSaid(next) } };
    });

  const px = (n: number) => (n === 0 ? 'none' : `${n}px`);

  return (
    <LabShell
      className="lab ring-lab"
      verdict={ringVerdict(ring)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div
        className="ring-mock"
        data-lab-mock
        aria-hidden="true"
        inert
        style={{ background: PAGE_BG }}
      >
        <span
          className="ring-mock__btn"
          style={{ color: BUTTON_BG, boxShadow: `inset 0 0 0 2px ${BUTTON_BG}` }}
        >
          Cancel
        </span>
        <span
          className="ring-mock__btn"
          style={{
            background: BUTTON_BG,
            color: BUTTON_TEXT,
            outline: ring.width > 0 ? `${ring.width}px solid ${hexOf(ring.colour)}` : 'none',
            outlineOffset: `${ring.offset}px`,
          }}
        >
          Save
        </span>
      </div>

      <div className="ring-controls">
        <Slider
          id={`${id}-w`}
          label="Ring thickness"
          value={ring.width}
          text={px(ring.width)}
          onChange={(width) => change({ width })}
        />
        <Slider
          id={`${id}-off`}
          label="Gap from the button"
          value={ring.offset}
          text={ring.offset === 0 ? 'touching' : `${ring.offset}px`}
          onChange={(offset) => change({ offset })}
        />
        <fieldset className="nrv-choice">
          <legend>Ring colour</legend>
          {RING_COLOURS.map((c) => (
            <label key={c.value}>
              <input
                type="radio"
                name={`${id}-c`}
                value={c.value}
                checked={ring.colour === c.value}
                onChange={() => change({ colour: c.value })}
              />
              <span className="ring-swatch" style={{ background: c.hex }} aria-hidden="true" />
              {c.label}
            </label>
          ))}
        </fieldset>
      </div>

      <ul className="lab-res ring-res">
        {check.sides.length === 0 ? (
          <li className="bad">
            <strong>
              <FailIcon />
              No ring
            </strong>
            <span>Nothing shows where focus is</span>
          </li>
        ) : (
          check.sides.map((s) => (
            <li key={s.against} className={s.passes ? 'ok' : 'bad'}>
              <strong>
                {s.passes ? <PassIcon /> : <FailIcon />}
                {s.score}:1 against {s.against}
              </strong>
              <span>
                {s.passes ? 'Stands out' : 'Lost'}: needs {RING_CHECK.threshold}:1 ({RING_CHECK.level})
              </span>
            </li>
          ))
        )}
      </ul>
    </LabShell>
  );
}
