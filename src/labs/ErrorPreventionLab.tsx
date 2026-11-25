import { useEffect, useId, useRef, useState } from 'react';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';
import {
  AMOUNT,
  EP_START,
  GUARDS,
  PAYEE,
  epBack,
  epConfirm,
  epGuard,
  epPay,
  epUndo,
  epVerdict,
  type ErrorPrevention,
  type Step,
} from './errorPrevention';

/**
 * The 3.3.4 lab (#59): a depicted payment with an extra zero in the amount. The reader picks the
 * safeguard and pays; with a review step they can go back and correct it, with an undo they can
 * take it back. The mock is inert and hidden from assistive technology; the reader's buttons sit
 * beside it and change with the payment's stage.
 */

type Model = {
  readonly e: ErrorPrevention;
  /** What the last change of the reader's says; null at the start and after Reset. */
  readonly said: Said | null;
};

const START: Model = { e: EP_START, said: null };

/** The depicted payment at its stage: the form, the review, or the outcome. */
export function ErrorPreventionMock({ e, id }: { readonly e: ErrorPrevention; readonly id: string }) {
  const sum = AMOUNT[e.amount];
  if (e.stage === 'review') {
    return (
      <div className="lform">
        <p className="lform__banner">
          Check your payment: {sum} to {PAYEE}
        </p>
        <span className="pay__btns">
          <span className="btn o sm">Go back</span>
          <span className="btn p sm">Confirm payment</span>
        </span>
      </div>
    );
  }
  if (e.stage === 'paid' || e.stage === 'undone') {
    const undone = e.stage === 'undone';
    return (
      <div className="lform">
        <p className={e.guard === 'none' ? 'lform__banner lform__banner--bad' : 'lform__banner'}>
          {undone ? `Payment undone. ${sum} is back in your account.` : `Paid ${sum} to ${PAYEE}.`}
        </p>
        {undone ? null : e.guard === 'undo' ? (
          <span className="btn o sm">Undo</span>
        ) : e.guard === 'none' ? (
          <p className="lform__hint">This can’t be undone.</p>
        ) : null}
      </div>
    );
  }
  return (
    <div className="lform">
      <p className="lform__label">Pay {PAYEE}</p>
      <label className="lform__label" htmlFor={`${id}-amount`}>
        Amount
      </label>
      <input id={`${id}-amount`} type="text" tabIndex={-1} readOnly value={sum} className="lform__field" />
      <span className="btn p sm">Pay</span>
    </div>
  );
}

export function ErrorPreventionLab() {
  const id = useId();
  const [{ e, said }, setModel] = useState<Model>(START);
  const actions = useRef<HTMLDivElement>(null);
  /** Set when the reader presses one of the stage's buttons, which the next stage replaces. */
  const pressed = useRef(false);
  const apply = (step: (e: ErrorPrevention) => Step) =>
    setModel((m) => {
      const next = step(m.e);
      return { e: next.e, said: { text: next.said } };
    });
  const act = (step: (e: ErrorPrevention) => Step) => {
    pressed.current = true;
    apply(step);
  };

  // The button the reader pressed is gone at the next stage: keep focus in the lab.
  useEffect(() => {
    const box = actions.current;
    if (!pressed.current || !box) return;
    pressed.current = false;
    box.querySelector<HTMLElement>('button, [tabindex="-1"]')?.focus();
  }, [e.stage]);

  return (
    <LabShell className="lab flab plab" verdict={epVerdict(e)} said={said} onReset={() => setModel(START)}>
      <div className="lab__mock flab__mock" data-lab-mock aria-hidden="true" inert>
        <ErrorPreventionMock e={e} id={id} />
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-guard`}
          legend="Safeguard before the money goes"
          options={GUARDS}
          value={e.guard}
          onChange={(guard) => apply((m) => epGuard(m, guard))}
        />
        <div className="plab__actions" ref={actions}>
          {e.stage === 'form' ? (
            <button type="button" className="btn o sm" onClick={() => act(epPay)}>
              Pay {AMOUNT[e.amount]}
            </button>
          ) : null}
          {e.stage === 'review' ? (
            <>
              <button type="button" className="btn o sm" onClick={() => act(epBack)}>
                Go back and correct it
              </button>
              <button type="button" className="btn o sm" onClick={() => act(epConfirm)}>
                Confirm payment
              </button>
            </>
          ) : null}
          {e.stage === 'paid' && e.guard === 'undo' ? (
            <button type="button" className="btn o sm" onClick={() => act(epUndo)}>
              Undo the payment
            </button>
          ) : null}
          {e.stage === 'undone' ? (
            <button type="button" className="btn o sm" onClick={() => act(epBack)}>
              Correct the amount
            </button>
          ) : null}
          {e.stage === 'paid' && e.guard !== 'undo' ? (
            <p className="lin-hint" tabIndex={-1}>The payment has gone. Change the safeguard or Reset to try again.</p>
          ) : null}
        </div>
      </div>
    </LabShell>
  );
}
