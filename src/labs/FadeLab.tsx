import { useEffect, useId, useRef, useState } from 'react';
import { FailIcon, PassIcon } from '../components/Icons';
import { FADE_DEFAULT, SCALE_TICKS, fadeState, scalePosition } from './fade';

/** How long the slider must rest before the live region speaks, so a drag is announced once. */
export const ANNOUNCE_DELAY_MS = 500;

/**
 * The fade-the-text lab (design guide §8.10): the reader drags "Fade the text" and the exhibit
 * text really fades, crossing the contrast thresholds. Nothing moves unless the reader moves it.
 *
 * The visible ratio and results are not live regions; one visually hidden polite region speaks
 * a summary once the slider has rested, so dragging does not flood it. Ids come from `useId`,
 * since Home (R-08) shows this lab too.
 */
export function FadeLab() {
  const id = useId();
  const [faded, setFaded] = useState(FADE_DEFAULT);
  const [announcement, setAnnouncement] = useState('');
  const moved = useRef(false);
  const s = fadeState(faded);

  useEffect(() => {
    if (!moved.current) return;
    const timer = window.setTimeout(() => setAnnouncement(s.announcement), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [s.announcement]);

  const slider = `${id}-fade`;
  const description = `${id}-fade-d`;

  return (
    <div className="lab fade-lab">
      <div className="lab__exhibit" style={{ color: s.colour }}>
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
            moved.current = true;
            setFaded(Number(e.currentTarget.value));
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

      <p className="sr" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
