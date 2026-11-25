import { useId, useState } from 'react';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';
import {
  RE_ADDRESS,
  RE_START,
  RE_STEPS,
  REUSE,
  reOnScreen,
  reVerdict,
  type RedundantEntry,
} from './redundantEntry';

/**
 * The 3.3.7 lab (#60): the reader steps through a three-step mock checkout and chooses what its
 * billing step does with the address typed at step 1: asks for it again, carries it forward, or
 * offers it for reuse. A readout says where they are and how much they would type again.
 *
 * The mock is drawn: inert, hidden from assistive technology, and never typed into. Back and
 * Next step stay focusable at the ends (aria-disabled), so focus never drops to the page.
 */

type Model = { readonly r: RedundantEntry; readonly said: Said | null };

const START: Model = { r: RE_START, said: null };

/** The step on screen, drawn as the checkout would show it. */
export function RedundantEntryMock({ r }: { readonly r: RedundantEntry }) {
  const last = r.step === RE_STEPS.length - 1;
  return (
    <div className="lform">
      <p className="lform__step">
        Step {r.step + 1} of {RE_STEPS.length}: {RE_STEPS[r.step]}
      </p>
      {r.step === 0 ? <span className="swatch-field border--strong">{RE_ADDRESS}</span> : null}
      {r.step === 1 ? <span className="lform__hint">Pay on delivery</span> : null}
      {last && r.reuse === 'ask' ? <span className="swatch-field border--strong" /> : null}
      {last && r.reuse === 'carry' ? (
        <>
          <span className="swatch-field border--strong">{RE_ADDRESS}</span>
          <span className="lform__hint">Carried forward from step 1</span>
        </>
      ) : null}
      {last && r.reuse === 'offer' ? (
        <span className="lform__hint">☑ Same as delivery: {RE_ADDRESS}</span>
      ) : null}
    </div>
  );
}

export function RedundantEntryLab() {
  const id = useId();
  const [{ r, said }, setModel] = useState<Model>(START);
  const change = (patch: Partial<RedundantEntry>) =>
    setModel((m) => {
      const next = { ...m.r, ...patch };
      return { r: next, said: { text: reOnScreen(next) } };
    });

  return (
    <LabShell className="lab flab re-lab" verdict={reVerdict(r)} said={said} onReset={() => setModel(START)}>
      <div className="lab__mock flab__mock" data-lab-mock aria-hidden="true" inert>
        <RedundantEntryMock r={r} />
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-reuse`}
          legend="At billing, the address is"
          options={REUSE}
          value={r.reuse}
          onChange={(reuse) => change({ reuse })}
        />
        <div className="re-lab__steps">
          <button
            type="button"
            className="btn o sm"
            aria-disabled={r.step === 0}
            onClick={() => r.step > 0 && change({ step: r.step - 1 })}
          >
            Back
          </button>
          <button
            type="button"
            className="btn o sm"
            aria-disabled={r.step === RE_STEPS.length - 1}
            onClick={() => r.step < RE_STEPS.length - 1 && change({ step: r.step + 1 })}
          >
            Next step
          </button>
        </div>
      </div>

      <div className="lab-out">
        <output className="flab__screen" aria-live="off">
          {reOnScreen(r)}
        </output>
      </div>
    </LabShell>
  );
}
