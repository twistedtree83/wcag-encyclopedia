import { useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from '../shared/AnnouncementLog';
import { FE_ERROR, FE_START, FE_VALUE, SHOWN, feSaid, feVerdict, type FormErrors } from './formErrors';
import { LabShell, type Said } from '../shared/LabShell';
import { Choice } from '../shared/Choice';

/**
 * The 3.3.1 lab (#52): the reader picks how a rejected email is shown, submits the mock form, and
 * hears the log. A red border alone leaves the log exactly as it was before the submit; text tied
 * to the field is said with it.
 *
 * The mock is a depicted form: inert and hidden from assistive technology. The log speaks for it.
 */

type Model = {
  readonly f: FormErrors;
  /** Counts the reader's changes; 0 at the start and after Reset. */
  readonly heard: number;
};

const START: Model = { f: FE_START, heard: 0 };

/** The mock form after the reader's choices: one field, and its error once submitted. */
export function FormErrorsMock({ f, id }: { readonly f: FormErrors; readonly id: string }) {
  const field = `${id}-email`;
  const err = `${id}-err`;
  const shown = f.submitted;
  const text = shown && f.shown === 'text';
  return (
    <div className="lform">
      <label className="lform__label" htmlFor={field}>
        Email
      </label>
      <input
        id={field}
        type="email"
        tabIndex={-1}
        readOnly
        value={FE_VALUE}
        className={shown ? 'lform__field lform__field--bad' : 'lform__field'}
        {...(text ? { 'aria-invalid': true, 'aria-describedby': err } : {})}
      />
      {text ? (
        <p className="lform__err" id={err}>
          <span aria-hidden="true">✕ </span>
          {FE_ERROR}
        </p>
      ) : null}
    </div>
  );
}

export function FormErrorsLab() {
  const id = useId();
  const [{ f, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, f);

  // Only the reader's own changes are spoken: Reset leaves `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: feSaid(f, lines) } : null),
    [heard, f, lines],
  );

  const change = (patch: Partial<FormErrors>) =>
    setModel((m) => ({ f: { ...m.f, ...patch }, heard: m.heard + 1 }));

  return (
    <LabShell
      className="lab flab"
      verdict={feVerdict(f)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock flab__mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <FormErrorsMock f={f} id={id} />
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-shown`}
          legend="How the error is shown"
          options={SHOWN}
          value={f.shown}
          onChange={(shown) => change({ shown })}
        />
        <button type="button" className="btn o sm" onClick={() => change({ submitted: true })}>
          Submit the form
        </button>
      </div>

      <AnnouncementLog id={id} lines={lines} />
    </LabShell>
  );
}
