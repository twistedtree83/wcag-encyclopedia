import { useId, useState } from 'react';
import { FailIcon, PassIcon } from '../components/Icons';
import { FADE_DEFAULT, SCALE_TICKS, fadeState, scalePosition } from './fade';
import { LabShell, type Said } from './LabShell';

/**
 * The fade-the-text lab (design guide §8.10): the reader drags "Fade the text" and the exhibit
 * text really fades, crossing the contrast thresholds. Nothing moves unless the reader moves it.
 *
 * It sits in the lab shell, which owns the verdict, Reset and the polite region. Each slider
 * change hands the shell a new `said`, so a drag is announced once it rests; Reset hands it
 * `null`, so going back to the start is not announced. Ids come from `useId`, since Home shows
 * this lab too.
 */

type Model = { readonly faded: number; readonly said: Said | null };

const START: Model = { faded: FADE_DEFAULT, said: null };

export function FadeLab() {
  const id = useId();
  const [{ faded, said }, setModel] = useState<Model>(START);
  const s = fadeState(faded);

  const slider = `${id}-fade`;
  const description = `${id}-fade-d`;

  return (
    <LabShell
      className="lab fade-lab"
      verdict={s.verdict}
      said={said}
      onReset={() => setModel(START)}
    >
      {/* Faded past 4.5 : 1, the exhibit is the failure the reader made: only then is it marked
          as a deliberate failure, and axe leaves it out. */}
      <div
        className="lab__exhibit"
        data-lab-mock
        {...(s.verdict.passes ? {} : { 'data-depicts-failure': true })}
        style={{ color: s.colour }}
      >
        <h4>Opening hours</h4>
        <p>Monday to Friday, nine until five. Closed on public holidays.</p>
      </div>

      <div className="slide">
        <label htmlFor={slider}>
          <span>Fade the text</span>
          <span>{faded}% faded</span>
        </label>
        <input
          type="range"
          id={slider}
          min={0}
          max={100}
          value={faded}
          aria-valuetext={`${faded}% faded`}
          aria-describedby={description}
          onChange={(e) => {
            const next = Number(e.currentTarget.value);
            setModel({ faded: next, said: { text: fadeState(next).announcement } });
          }}
        />
        <span className="sr" id={description}>
          Raise the slider to fade the text towards the background. The ratio and results update as
          you move it.
        </span>
      </div>

      <div className="labout">
        <span>Contrast ratio</span>
        <output htmlFor={slider} aria-live="off">
          {s.ratioText}
        </output>
      </div>

      <div className="scale" aria-hidden="true">
        <div className="scale__track" />
        <div className="scale__fill" style={{ width: `${s.position}%` }} />
        {SCALE_TICKS.map((t) => (
          <div className="scale__tick" key={t} style={{ left: `calc(${scalePosition(t)}% - 1px)` }}>
            <span>{t}</span>
          </div>
        ))}
      </div>

      <ul className="lab-res">
        {s.results.map((r) => (
          <li key={`${r.name}${r.level}`} className={r.passes ? 'ok' : 'bad'}>
            <strong>
              {r.passes ? <PassIcon /> : <FailIcon />}
              {r.passes ? 'Passes' : 'Fails'}
            </strong>
            <span>
              {r.name}, {r.level}
            </span>
          </li>
        ))}
      </ul>
    </LabShell>
  );
}
