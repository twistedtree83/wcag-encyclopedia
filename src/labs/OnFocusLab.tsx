import { useId, useMemo, useState } from 'react';
import { LabChoice } from './LabChoice';
import { LabShell, type Said } from './LabShell';
import {
  ACTS,
  ADDRESS,
  FOCUS_START,
  STOPS,
  focusSaid,
  focusVerdict,
  pressTab,
  withAct,
  type FocusLab,
} from './onFocus';

/**
 * The 3.2.1 lab (#47): the reader sets what focusing Email does in a mock checkout form, then
 * presses a simulated Tab through it. The mock is depicted (inert, hidden from assistive
 * technology) and has its own address bar, so a change of page happens inside it only: the real
 * page never moves, and the reader's focus stays on "Press Tab in the form".
 */

type Model = { readonly lab: FocusLab; readonly heard: number };

const START: Model = { lab: FOCUS_START, heard: 0 };

export function OnFocusLab() {
  const id = useId();
  const [{ lab, heard }, setModel] = useState<Model>(START);
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: focusSaid(lab) } : null),
    [heard, lab],
  );
  const update = (next: (l: FocusLab) => FocusLab) =>
    setModel((m) => ({ lab: next(m.lab), heard: m.heard + 1 }));

  return (
    <LabShell
      className="lab focus-lab"
      verdict={focusVerdict(lab)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock fl-mock" data-lab-mock aria-hidden="true" inert>
        <p className="ctx__bar">{ADDRESS[lab.page]}</p>
        {lab.page === 'form' ? (
          <div className="fl-form">
            {STOPS.map((stop, i) => (
              <span
                key={stop}
                className={stop === 'Send' ? 'fl-stop fl-stop--send' : 'fl-stop'}
                data-on={lab.at === i ? 'true' : undefined}
              >
                {stop === 'Send' ? (
                  'Send'
                ) : (
                  <>
                    <span className="fl-label">{stop}</span>
                    <span className="fl-box" />
                  </>
                )}
              </span>
            ))}
          </div>
        ) : lab.page === 'sent' ? (
          <div className="fl-page">
            <p className="ctx__title">Order sent</p>
            <p className="ctx__text">Name: empty. Email: empty. Too late to fill them in.</p>
          </div>
        ) : (
          <div className="fl-page">
            <p className="ctx__title">Today’s offers</p>
            <p className="ctx__text">The checkout form, and anything typed into it, is gone.</p>
          </div>
        )}
      </div>

      <div className="lab-controls">
        <LabChoice
          name={`${id}-act`}
          legend="When Email gets focus"
          options={ACTS}
          value={lab.act}
          onChange={(act) => update(() => withAct(act))}
        />
        <div className="fl-keys">
          <button type="button" className="btn o sm" onClick={() => update(pressTab)}>
            Press Tab in the form
          </button>
          <output className="lab-code" aria-live="off">
            {lab.page === 'form' && lab.at >= 0
              ? `Focus on ${STOPS[lab.at]}`
              : lab.page === 'form'
                ? 'Focus is not in the form yet'
                : `Moved to ${ADDRESS[lab.page]}`}
          </output>
        </div>
      </div>
    </LabShell>
  );
}
