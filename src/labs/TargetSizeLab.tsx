import { useEffect, useId, useRef, useState } from 'react';
import { FailIcon, PassIcon } from '../components/Icons';
import { LabShell, type Said } from './LabShell';
import { searchFromTargets, targetsFromSearch } from './targetQuery';
import {
  GAP_MAX,
  MIN_TARGET,
  SIZE_MAX,
  SIZE_MIN,
  TARGETS_START,
  targetCheck,
  targetSaid,
  targetVerdict,
  type Targets,
} from './targetSize';

/**
 * The 2.5.8 flagship lab (#57): the reader resizes three icon targets and the space between
 * them, and sees the 24 by 24 target, or each target's 24px circle, pass or fail (`targetSize.ts`).
 *
 * The mock is a drawing at twice the size, inert and hidden from assistive technology: its
 * small targets are pictures of a failure, never controls on this page.
 *
 * State is in the URL (`targetQuery.ts`): the page pre-renders the start, applies the query after
 * mount without announcing it, and writes changes back with `history.replaceState`.
 */

type Model = { readonly targets: Targets; readonly said: Said | null };

const START: Model = { targets: TARGETS_START, said: null };

const GLYPHS = ['★', '↻', '✕'];

/** Room around the row for the circles, in CSS px of the drawing. */
const PAD = 14;

function Slider({
  id,
  label,
  value,
  min,
  max,
  text,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  text: string;
  onChange: (v: number) => void;
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
        step={1}
        value={value}
        aria-valuetext={text}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </div>
  );
}

export function TargetSizeLab() {
  const id = useId();
  const [{ targets, said }, setModel] = useState<Model>(START);
  const { size, gap } = targets;
  const check = targetCheck(targets);

  useEffect(() => {
    const preload = targetsFromSearch(window.location.search);
    if (preload) setModel({ targets: preload, said: null });
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromTargets(targets) + hash);
  }, [targets]);

  const change = (patch: Partial<Targets>) =>
    setModel((m) => {
      const next = { ...m.targets, ...patch };
      return { targets: next, said: { text: targetSaid(next) } };
    });

  const width = 3 * size + 2 * gap + 2 * PAD;
  const height = Math.max(size, MIN_TARGET) + 2 * PAD;
  const cy = height / 2;
  const left = (i: number) => PAD + i * (size + gap);

  return (
    <LabShell
      className="lab ts-lab"
      verdict={targetVerdict(targets)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="ts-mock" data-lab-mock aria-hidden="true" inert>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width * 2}
          height={height * 2}
          focusable="false"
        >
          {GLYPHS.map((g, i) => (
            <g key={g}>
              <rect className="ts-target" x={left(i)} y={cy - size / 2} width={size} height={size} rx="2" />
              <text className="ts-glyph" x={left(i) + size / 2} y={cy} dy="0.35em" textAnchor="middle">
                {g}
              </text>
              {check.bySize ? (
                <rect
                  className="ts-guide"
                  x={left(i) + size / 2 - MIN_TARGET / 2}
                  y={cy - MIN_TARGET / 2}
                  width={MIN_TARGET}
                  height={MIN_TARGET}
                />
              ) : (
                <circle
                  className={check.overlap > 0 ? 'ts-circle is-clash' : 'ts-circle'}
                  cx={left(i) + size / 2}
                  cy={cy}
                  r={MIN_TARGET / 2}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="ts-controls">
        <Slider
          id={`${id}-size`}
          label="Target size"
          value={size}
          min={SIZE_MIN}
          max={SIZE_MAX}
          text={`${size} by ${size}px`}
          onChange={(v) => change({ size: v })}
        />
        <Slider
          id={`${id}-gap`}
          label="Space between targets"
          value={gap}
          min={0}
          max={GAP_MAX}
          text={gap === 0 ? 'touching' : `${gap}px`}
          onChange={(v) => change({ gap: v })}
        />
      </div>

      <ul className="lab-res ts-res">
        <li className={check.bySize ? 'ok' : 'bad'}>
          <strong>
            {check.bySize ? <PassIcon /> : <FailIcon />}
            {size} by {size}px
          </strong>
          <span>{check.bySize ? 'Big enough on its own' : 'Under 24 by 24'}</span>
        </li>
        {check.bySize ? null : (
          <li className={check.overlap === 0 ? 'ok' : 'bad'}>
            <strong>
              {check.overlap === 0 ? <PassIcon /> : <FailIcon />}
              Centres {size + gap}px apart
            </strong>
            <span>
              {check.overlap === 0
                ? '24px circles clear each other'
                : `24px circles overlap by ${check.overlap}px`}
            </span>
          </li>
        )}
      </ul>
    </LabShell>
  );
}
