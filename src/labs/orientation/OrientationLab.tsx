import { useId, useState } from 'react';
import { FailIcon, PassIcon } from '../../components/Icons';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import {
  LOCKS,
  ORIENTATION_START,
  PHONE,
  TURNS,
  contentLine,
  hides,
  orientationSaid,
  orientationVerdict,
  windowLine,
  type Lock,
  type Orientation,
} from './orientation';
import { ZoomFrame } from '../shared/ZoomFrame';

/**
 * An order-tracking page, as the 1.3.4 lab and live examples draw it on a phone in the zoom
 * frame. The page is its own size container, so its CSS asks the frame's window which way up it
 * is (`@container (orientation: …)`, swatch.css), not the real screen:
 *
 *   adapts      one column upright, two on its side
 *   portrait    held on its side, hides everything and asks to be turned upright
 *   landscape   held upright, hides everything and asks to be turned sideways
 *
 * The prompt is marked `data-rotate-prompt`, so the stage can tell when it is drawn.
 */
export function OrderPage({ lock }: { lock: Lock }) {
  return (
    <div className={`opage opage--${lock}`}>
      <div className="opage__body">
        <div>
          <p className="opage__title">Your order</p>
          <p>Field parka, size M. Order 4417.</p>
        </div>
        <ol className="opage__steps">
          <li>Packed on Monday</li>
          <li>On its way</li>
          <li>Arrives Thursday</li>
        </ol>
      </div>
      {lock === 'adapts' ? null : (
        <p className="opage__prompt" data-rotate-prompt>
          {lock === 'portrait' ? 'Turn your phone upright to use this page' : 'Turn your phone sideways to use this page'}
        </p>
      )}
    </div>
  );
}

/**
 * The 1.3.4 lab (#55): the reader turns the phone and chooses whether the page adapts or is
 * locked to one way up. The verdict fails whenever the page is locked; the frame and readouts
 * show what that costs held the other way. The mock is a depicted page: inert and hidden.
 */

type Model = { readonly state: Orientation; readonly said: Said | null };

const START: Model = { state: ORIENTATION_START, said: null };

export function OrientationLab() {
  const id = useId();
  const [{ state, said }, setModel] = useState<Model>(START);
  const hidden = hides(state);
  const locked = state.lock !== 'adapts';

  const change = (patch: Partial<Orientation>) =>
    setModel((m) => {
      const next = { ...m.state, ...patch };
      return { state: next, said: { text: orientationSaid(next) } };
    });

  return (
    <LabShell
      className="lab orient-lab"
      verdict={orientationVerdict(state)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="orient-mock" data-lab-mock aria-hidden="true" inert>
        <ZoomFrame zoom={100} base={PHONE} turned={state.turn === 'landscape'} focusable={false}>
          <OrderPage lock={state.lock} />
        </ZoomFrame>
      </div>

      <div className="lab-controls">
        <LabChoice
          name={`${id}-turn`}
          legend="Hold the phone"
          options={TURNS}
          value={state.turn}
          onChange={(turn) => change({ turn })}
        />
        <LabChoice
          name={`${id}-lock`}
          legend="The page"
          options={LOCKS}
          value={state.lock}
          onChange={(lock) => change({ lock })}
        />
      </div>

      <ul className="lab-res orient-res">
        <li>
          <strong>{windowLine(state.turn)}</strong>
          <span>The phone’s window</span>
        </li>
        <li className={locked ? 'bad' : 'ok'}>
          <strong>
            {locked ? <FailIcon /> : <PassIcon />}
            {contentLine(state)}
          </strong>
          <span>
            {hidden
              ? 'A reader who can’t turn the phone can’t use the page'
              : locked
                ? 'Turn it, and the page hides everything'
                : 'The page works either way up'}
          </span>
        </li>
      </ul>
    </LabShell>
  );
}
